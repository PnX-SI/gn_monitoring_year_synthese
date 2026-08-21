export interface ReproSuccessValue {
  value: string[];
  label: string;
  color: string;
}

export interface ReproModuleConfig {
  module_code: string;
  module_label?: string;
  visit_success_field?: string;
  success_values?: ReproSuccessValue[];
  default_color?: string;
  default_label?: string;
}

/** Une page (route) du module, combinant les sites d'un ou plusieurs sous-modules. */
export interface ReproPageConfig {
  page_code: string;
  page_label?: string;
  modules: ReproModuleConfig[];
}
