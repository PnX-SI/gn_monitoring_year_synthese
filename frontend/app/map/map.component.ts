import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MapService } from '@geonature_common/map/map.service';
import { MonitoringPaginatedResult } from '../interfaces/monitoring.interface';
import { downloadBlob } from '../utils/download.util';

import { MonitoringApiService } from '../services/monitoring-api.service';
import { LegendService } from '../services/legend.service';
import { SubModuleConfig, PageConfig } from '../interfaces/config.interface';

@Component({
  selector: 'mys-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  pageConfig!: PageConfig;
  years: number[] = [];
  selectedYear: number;
  geojsonSites: any = null;
  loading = false;

  /** Sites de chaque sous-module de la page, pour l'onglet qui lui correspond. */
  sitesByModuleCode: { [moduleCode: string]: any[] } = {};

  selectedSiteId: number | null = null;
  private selectedModuleCode: string | null = null;

  /** Visites du site sélectionné pour l'année en cours, cf. loadSelectedSiteVisites. */
  private selectedSiteVisites: any[] = [];

  private siteLayersById = new Map<number, any>();

  get selectedSite(): any | null {
    if (this.selectedSiteId === null || !this.selectedModuleCode) {
      return null;
    }
    const site = (this.sitesByModuleCode[this.selectedModuleCode] || []).find(
      (site) => site.id_base_site === this.selectedSiteId
    );
    return site ? { ...site, visites: this.selectedSiteVisites } : null;
  }

  /** Config du sous-module du site sélectionné (pour visit-panel : visit_label_field). */
  get selectedModuleConfig(): SubModuleConfig | null {
    return this.pageConfig?.modules.find((m) => m.module_code === this.selectedModuleCode) ?? null;
  }

  /** Au moins un sous-module de la page déclare visit_export_name (bouton "télécharger toutes les visites"). */
  get hasVisitExport(): boolean {
    return !!this.pageConfig?.modules.some((m) => m.visit_export_name);
  }

  onEachSiteFeature = (feature: any, layer: any) => {
    const { result } = feature.properties;
    const isPoint = feature.geometry?.type === 'Point' || feature.geometry?.type === 'MultiPoint';

    // Points : couleur sur le contour, fond transparent. Polygones : couleur sur le fond.
    // Un site sans résultat connu (pas de *no_data/*no_match déclaré pour ce module) n'a
    // pas de couleur : on omet alors la clé color/fillColor plutôt que de la passer à
    // `undefined`, sans quoi Leaflet écraserait sa couleur par défaut avec `undefined` et
    // le rendu Canvas hériterait de la dernière couleur valide tracée juste avant sur le
    // canvas partagé (un site voisin pris au hasard), au lieu du bleu Leaflet par défaut.
    const style: any = isPoint
      ? { weight: 4, fillOpacity: 0, radius: 6 }
      : { color: '#000', weight: 1, fillOpacity: result ? 0.7 : 0.3 };
    if (result) {
      style[isPoint ? 'color' : 'fillColor'] = result.color;
    }
    layer.setStyle(style);

    layer.bindPopup(this.buildPopupContent(feature.properties, result?.label ?? 'Pas de donnée'));
    layer.on('click', () => this.selectSite(feature.properties));
    this.siteLayersById.set(feature.properties.id_base_site, layer);
  };

  private buildPopupContent(properties: any, resultLabel: string): string {
    let content = `<b>${properties.base_site_name}</b><br>${this.selectedYear} : ${resultLabel}`;
    content += `<br>id_base_site : ${properties.id_base_site}`;
    return content;
  }

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _monitoringApi: MonitoringApiService,
    private _legend: LegendService,
    private _mapService: MapService
  ) {}

  ngOnInit() {
    this.pageConfig = this._route.snapshot.data.pageConfig;
    this.loading = true;

    // On propose toutes les années depuis la toute première visite du
    // premier sous-module de la page jusqu'à aujourd'hui (un seul appel).
    const firstModuleCode = this.pageConfig.modules[0].module_code;
    this._monitoringApi
      .getVisits(firstModuleCode, { limit: 1, sort: 'visit_date_min', sort_dir: 'asc' })
      .subscribe((result: any) => {
        const oldestYear = this.extractYear(result.items[0]?.visit_date_min);
        const currentYear = new Date().getFullYear();

        this.years = [];
        for (let year = currentYear; year >= (oldestYear ?? currentYear); year--) {
          this.years.push(year);
        }

        const yearParam = Number(this._route.snapshot.queryParamMap.get('year'));
        const defaultYear = this.years[0] ?? currentYear;
        const initialYear = this.years.includes(yearParam) ? yearParam : defaultYear;
        this.onYearChange(initialYear);
      });
  }

  private extractYear(dateStr: string): number | null {
    if (!dateStr) {
      return null;
    }
    const year = new Date(dateStr).getFullYear();
    return Number.isNaN(year) ? null : year;
  }

  onYearChange(year: number) {
    this.selectedYear = year;
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: { year },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
    this.loadSitesForYear(year);
  }

  /**
   * Sélectionne un site (depuis un clic dans la liste ou sur la carte) :
   * affiche ses visites dans le panneau de droite et recentre la carte dessus.
   */
  selectSite(site: any) {
    this.selectedSiteId = site.id_base_site;
    this.selectedModuleCode = site.module_code;
    this.loadSelectedSiteVisites(site);

    const layer = this.siteLayersById.get(site.id_base_site);
    if (!layer) {
      return;
    }
    if (layer.getBounds) {
      this._mapService.map.fitBounds(layer.getBounds());
    } else if (layer.getLatLng) {
      this._mapService.map.setView(layer.getLatLng(), 12);
    }
    layer.openPopup();
  }

  /**
   * Visites du site sélectionné pour l'année en cours. Si le module déclare
   * visit_export_name, on interroge sa vue d'export (filtrée par année et
   * id_base_site) ; sinon on appelle la route de monitoring
   */
  private loadSelectedSiteVisites(site: any) {
    this.selectedSiteVisites = [];

    const moduleConfig = this.selectedModuleConfig;
    if (!moduleConfig) {
      return;
    }

    const visites$: Observable<any[]> = moduleConfig.visit_export_name
      ? this._monitoringApi.getJsonExport(site.module_code, moduleConfig.visit_export_name, {
          annee: this.selectedYear,
          id_base_site: site.id_base_site,
        })
      : this._monitoringApi
          .getVisits(site.module_code, {
            id_base_site: site.id_base_site,
            visit_date_min: this.selectedYear,
          })
          .pipe(map((result: MonitoringPaginatedResult<any>) => result.items || []));

    visites$.subscribe((visites: any[]) => {
        this.selectedSiteVisites = visites;
    });
  }

  private loadSitesForYear(year: number) {
    this.loading = true;

    const perModule$ = this.pageConfig.modules.map((moduleConfig) =>
      this.loadSites(moduleConfig, year)
    );

    forkJoin(perModule$).subscribe((results: { moduleCode: string; sites: any[] }[]) => {
      this.siteLayersById.clear();

      this.sitesByModuleCode = {};
      const allFeatures: any[] = [];
      for (const result of results) {
        // La carte a besoin des features geojson complètes (geometry +
        // properties), la liste n'a besoin que des propriétés aplaties.
        this.sitesByModuleCode[result.moduleCode] = result.sites.map(
          (feature: any) => feature.properties
        );
        allFeatures.push(...result.sites);
      }

      this.geojsonSites = { type: 'FeatureCollection', features: allFeatures };
      this.loading = false;
    });
  }

  downloadModuleSites(moduleConfig: SubModuleConfig, filterYear: boolean = true) {
    const params = filterYear ? {annee: this.selectedYear} :  {}
    this._monitoringApi
      .downloadExport(moduleConfig.module_code, moduleConfig.site_export_name, params)
      .subscribe((blob: Blob) => {
        downloadBlob(blob, `${moduleConfig.module_code}_${moduleConfig.site_export_name}_${this.selectedYear}.csv`);
      });
  }


  downloadAllVisits() {
    for (const moduleConfig of this.pageConfig?.modules || []) {
      if (!moduleConfig.visit_export_name) {
        continue;
      }
      this._monitoringApi
        .downloadExport(moduleConfig.module_code, moduleConfig.visit_export_name, {
          annee: this.selectedYear,
        })
        .subscribe((blob: Blob) => {
          downloadBlob(
            blob,
            `${moduleConfig.module_code}_${moduleConfig.visit_export_name}_${this.selectedYear}.csv`
          );
        });
    }
  }

  private loadSites(
    moduleConfig: SubModuleConfig,
    year: number
  ): Observable<{ moduleCode: string; sites: any[] }> {
    const moduleCode = moduleConfig.module_code;

    return this._monitoringApi
      .getJsonExport(moduleCode, moduleConfig.site_export_name, { annee: year })
      .pipe(
        map((rows: any[]) => ({
          moduleCode,
          sites: rows.map((row) => ({
            type: 'Feature',
            geometry: JSON.parse(row.geom),
            properties: {
              id_base_site: Number(row.id_base_site),
              base_site_name: row.base_site_name,
              module_code: moduleCode,
              module_label: moduleConfig.module_label || moduleCode,
              result: this._legend.getSiteResult(row, moduleConfig),
            },
          })),
        }))
      );
  }
}
