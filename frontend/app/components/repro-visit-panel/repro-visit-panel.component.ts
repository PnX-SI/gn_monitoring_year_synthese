import { Component, Input } from '@angular/core';

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

  /** Visites du site triées par date croissante (les plus anciennes en premier). */
  get sortedVisites(): any[] {
    const visites = this.site?.visites || [];
    return [...visites].sort(
      (a, b) => new Date(a.visit_date_min).getTime() - new Date(b.visit_date_min).getTime()
    );
  }

  /** Champs generic de la visite (colonnes de t_base_visits) */
  genericFields(visite: any): { key: string; value: any }[] {
    return this.entries(visite, EXCLUDED_GENERIC_FIELDS);
  }

  private entries(obj: any, excluded: string[]): { key: string; value: any }[] {
    if (!obj) {
      return [];
    }
    return Object.keys(obj)
      .filter((key) => !excluded.includes(key) && !key.startsWith("id_nomenclature"))
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
}
