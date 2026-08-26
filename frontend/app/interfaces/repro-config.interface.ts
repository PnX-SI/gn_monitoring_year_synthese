export interface ReproSuccessValue {
  value: string[];
  label: string;
  color: string;
}

export interface ReproModuleConfig {
  module_code: string;
  module_label?: string;
  legend_field?: string;
  /** Champ (generic ou specific) affiché en titre d'une visite dans le panneau de droite. */
  visit_label_field: string;
  /** Restreint les champs affichés pour une visite (generic + specific) à cette liste ; absent = tous. */
  visit_fields?: string[];
  legend_values?: ReproSuccessValue[];
  site_geom_type?: string;
  /**
   * Suffixe de la vue SQL gn_monitoring.v_export_<module_code>_<site_export_name>
   * (route /exports/csv/<module_code>/<site_export_name>) qui renvoie les sites
   * du module, un enregistrement par site et par année, déjà accompagnés de
   * leur résultat de reproduction (colonne `legend_field`).
   */
  site_export_name: string;
  /**
   * Suffixe de la vue SQL gn_monitoring.v_export_<module_code>_<visit_export_name>
   * (route /exports/csv/<module_code>/<visit_export_name>) qui renvoie le détail
   * des visites d'un site.
   */
  visit_export_name: string;
}

/** Une page (route) du module, combinant les sites d'un ou plusieurs sous-modules. */
export interface ReproPageConfig {
  page_code: string;
  page_label?: string;
  modules: ReproModuleConfig[];
}
