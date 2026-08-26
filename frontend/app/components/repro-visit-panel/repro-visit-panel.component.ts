import { Component, Input } from '@angular/core';
import { ReproModuleConfig } from '../../interfaces/repro-config.interface';
import { MonitoringApiService } from '../../services/monitoring-api.service';
import { downloadBlob } from '../../utils/download.util';

/** Champs techniques sans intérêt pour l'affichage du détail d'une visite. */
const EXCLUDED_GENERIC_FIELDS = [
  'id_base_visit',
  'id_base_site',
  'id_module',
  'id_dataset',
  'id_digitiser',
  'uuid_base_visit',
  'meta_create_date',
  'meta_update_date',
  'id_import',
  'visit_date_min',
  'visit_date_max',
  'data',
  'module',
  'pk',
  "cruved",
  "medias"
];

@Component({
  selector: 'repro-visit-panel',
  templateUrl: './repro-visit-panel.component.html',
  styleUrls: ['./repro-visit-panel.component.scss'],
})
export class ReproVisitPanelComponent {
  /** Site sélectionné (propriétés aplaties, avec sa clé `visites` de l'année en cours). */
  @Input() site: any;

  /** Config du sous-module du site sélectionné, pour visit_label_field. */
  @Input() moduleConfig?: ReproModuleConfig;

  /** Année en cours, pour filtrer le téléchargement CSV des visites du site. */
  @Input() selectedYear: number | null = null;

  constructor(private _monitoringApi: MonitoringApiService) {}

  /** Téléchargement CSV des visites du site sélectionné (vue visit_export_name). */
  downloadSiteVisits() {
    const method = this.moduleConfig?.visit_export_name;
    if (!this.site || !method) {
      return;
    }
    this._monitoringApi
      .downloadExport(this.site.module_code, method, {
        id_base_site: this.site.id_base_site,
        annee: this.selectedYear,
      })
      .subscribe((blob: Blob) => {
        downloadBlob(blob, `${this.site.module_code}_${this.site.base_site_name}_${this.selectedYear}.csv`);
      });
  }

  /** Visites du site triées par date croissante (les plus anciennes en premier). */
  get sortedVisites(): any[] {
    const visites = this.site?.visites || [];
    return [...visites].sort(
      (a, b) => new Date(a.visit_date_min).getTime() - new Date(b.visit_date_min).getTime()
    );
  }

  /**
   * Libellé d'une visite affiché en titre de son panneau (visit_label_field,
   * "visit_date_min" par défaut cf. conf_schema_toml.py)
   */
  visitLabel(visite: any): any {
    const field = this.moduleConfig?.visit_label_field;
    return this.getFieldValue(visite, field);
  }

  /** Champs generic de la visite (colonnes de t_base_visits), filtrés par visit_fields si non vide. */
  genericFields(visite: any): { key: string; value: any }[] {
    const visitFields = this.moduleConfig?.visit_fields;    
    return this.entries(visite, EXCLUDED_GENERIC_FIELDS).filter(
      (entry) => !visitFields?.length || visitFields.includes(entry.key)
    );
  }

  /**
   * Champs specific (visite.data) à passer à *additionalFields, filtrés par
   * visit_fields si non vide : ne garde que les clés listées telles quelles.
   * Pour qu'un champ garde son libellé de nomenclature (résolu par
   * AdditionalFieldsDirective via `_label_<champ>`), visit_fields doit lister
   * explicitement les deux clés, `<champ>` et `_label_<champ>`.
   */
  additionalData(visite: any): { [key: string]: any } | undefined {
    if (!visite?.data) {
      return visite?.data;
    }
    const visitFields = this.moduleConfig?.visit_fields;
    const entries = this.entries(visite.data, []).filter(
      (entry) => !visitFields?.length || visitFields.includes(entry.key)
    );
    return Object.fromEntries(entries.map((entry) => [entry.key, entry.value]));
  }

  private entries(obj: any, excluded: string[]): { key: string; value: any }[] {
    if (!obj) {
      return [];
    }
    return Object.keys(obj)
      .filter((key) => !excluded.includes(key))
      .map((key) => ({ key, value: this.formatValue(obj[key]) }))
  }

  private formatValue(value: any): any {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return value;
  }

  /** Un champ generic est à plat sur la visite, un champ specific est sous `data`. */
  private getFieldValue(visite: any, fieldName: string): any {
    if (visite[fieldName] !== undefined) {
      return visite[fieldName];
    }
    return visite.data ? visite.data[fieldName] : undefined;
  }
}
