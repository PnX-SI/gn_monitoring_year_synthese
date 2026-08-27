export interface LegendValue {
  value: string[];
  label: string;
  color: string;
}

export interface SubModuleConfig {
  module_code: string;
  module_label?: string;
  legend_field?: string;
  visit_label_field: string;
  visit_fields?: string[];
  legend_values?: LegendValue[];
  site_geom_type?: string;

  site_export_name: string;

  visit_export_name: string;
}
export interface PageConfig {
  page_code: string;
  page_label?: string;
  modules: SubModuleConfig[];
}
