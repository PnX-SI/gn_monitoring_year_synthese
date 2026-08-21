import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MapService } from '@geonature_common/map/map.service';

import { MonitoringApiService } from '../services/monitoring-api.service';
import { ReproSuccessService } from '../services/repro-success.service';
import { ReproModuleConfig, ReproPageConfig } from '../interfaces/repro-config.interface';

@Component({
  selector: 'repro-map',
  templateUrl: './repro-map.component.html',
  styleUrls: ['./repro-map.component.scss'],
})
export class ReproMapComponent implements OnInit {
  pageConfig!: ReproPageConfig;
  years: number[] = [];
  selectedYear: number;
  geojsonSites: any = null;
  loading = false;

  /** Sites de chaque sous-module de la page, pour l'onglet qui lui correspond. */
  sitesByModuleCode: { [moduleCode: string]: any[] } = {};

  selectedSiteId: number | null = null;
  private selectedModuleCode: string | null = null;

  private siteLayersById = new Map<number, any>();

  /**
   * Dérivé de sitesByModuleCode plutôt que stocké à part : évite de garder
   * une référence périmée vers l'ancienne année quand sitesByModuleCode est
   * recalculé (changement d'année).
   */
  get selectedSite(): any | null {
    if (this.selectedSiteId === null || !this.selectedModuleCode) {
      return null;
    }
    return (this.sitesByModuleCode[this.selectedModuleCode] || []).find(
      (site) => site.id_base_site === this.selectedSiteId
    );
  }

  onEachSiteFeature = (feature: any, layer: any) => {
    const { result, default_color, default_label } = feature.properties;
    const color = result?.color || default_color;
    const isPoint = feature.geometry?.type === 'Point' || feature.geometry?.type === 'MultiPoint';

    // Points : couleur sur le contour, fond transparent. Polygones : couleur sur le fond.
    layer.setStyle(
      isPoint
        ? {
            color,
            weight: 4,
            fillOpacity: 0,
            radius: 6,
          }
        : {
            color: '#000',
            weight: 1,
            fillColor: color,
            fillOpacity: result ? 0.7 : 0.3,
          }
    );

    const label = result?.label || default_label;
    layer.bindPopup(`<b>${feature.properties.base_site_name}</b><br>${this.selectedYear} : ${label}`);
    layer.on('click', () => this.selectSite(feature.properties));
    this.siteLayersById.set(feature.properties.id_base_site, layer);
  };

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _monitoringApi: MonitoringApiService,
    private _reproSuccess: ReproSuccessService,
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

  private loadSitesForYear(year: number) {
    this.loading = true;

    // Un sous-module = un appel identique aux autres, juste avec sa propre
    // config de succès. On agrège ensuite tout pour la carte, et on garde
    // le détail par sous-module pour les onglets de la liste.
    const perModule$ = this.pageConfig.modules.map((moduleConfig) =>
      this.loadModuleSites(moduleConfig, year)
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

  /** Sites (en features geojson) d'un sous-module, avec leur résultat de reproduction de l'année. */
  private loadModuleSites(
    moduleConfig: ReproModuleConfig,
    year: number
  ): Observable<{ moduleCode: string; sites: any[] }> {
    const moduleCode = moduleConfig.module_code;

    return forkJoin({
      sitesGeojson: this._monitoringApi.getSitesGeometries(moduleCode),
      visits: this._monitoringApi.getVisitsByYear(moduleCode, year),
    }).pipe(
      map(({ sitesGeojson, visits }: { sitesGeojson: any; visits: any[] }) => {
        const sites = (sitesGeojson.features || []).map((feature: any) => {
          // id_base_site vient de 2 endpoints différents (geometries vs
          // visits) : on compare en Number() au cas où l'un des deux le
          // sérialise en chaîne.
          const siteVisits = visits.filter(
            (visit: any) => Number(visit.id_base_site) === Number(feature.properties.id_base_site)
          );
          return {
            ...feature,
            properties: {
              ...feature.properties,
              module_code: moduleCode,
              module_label: moduleConfig.module_label || moduleCode,
              default_color: moduleConfig.default_color,
              default_label: moduleConfig.default_label,
              visites: siteVisits,
              result: this._reproSuccess.getSiteResult(siteVisits, moduleConfig),
            },
          };
        });
        return { moduleCode, sites };
      })
    );
  }
}
