# MonitoringRepro

Module GeoNature pour la visualisation cartographique des réussites de
reproduction issues des sous-modules gn_module_monitoring (aigle,
domaine_vital, gypaète, ...), année par année.

Ce module n'a pas de backend applicatif propre : il consomme directement
l'API HTTP de `gn_module_monitoring` (déjà installé) et ne fournit qu'une
configuration (`GnModuleSchemaConf`) et un frontend Angular.

## Configuration

Copier `module_code_config.toml.example` en
`config/monitoring_repro_config.toml` dans l'instance GeoNature, et déclarer
un bloc `[[PAGES]]` par page (route) du module. Une page peut combiner
plusieurs sous-modules gn_module_monitoring sur une même carte (ex: aigle +
domaine_vital) ; chaque sous-module garde ses propres critères de succès :

```toml
[[PAGES]]
page_code = "aigle_domaine_vital"
page_label = "Aigle & Domaines vitaux"

  [[PAGES.modules]]
  module_code = "AIGLE"
  module_label = "Aigle royal"
  visit_success_field = "resultat_reproduction"
  default_color = "#bdbdbd"
  default_label = "Pas de donnée"

    [[PAGES.modules.success_values]]
    value = "succes"
    label = "Succès"
    color = "#66bb6a"

  [[PAGES.modules]]
  module_code = "DOMAINE_VITAL"
  ...
```

- `page_code` : segment de route (`/monitoring_repro/<page_code>`).
- `page_label` : libellé affiché sur la page d'accueil (sinon `page_code`).
- `modules` : liste des sous-modules gn_module_monitoring affichés sur
  cette page. Pour chacun :
  - `module_code` : code du sous-module gn_module_monitoring (`t_modules.module_code`).
  - `module_label` : libellé de l'onglet et de la légende (sinon `module_code`).
  - `visit_success_field` : nom du champ (generic ou specific) qui porte le
    résultat de reproduction sur la visite, tel qu'il apparaît dans la
    réponse de `/monitorings/refacto/<module_code>/visits`.
  - `success_values` : liste des valeurs possibles de ce champ, chacune avec
    un `label` (légende affichée sur la carte) et une `color` (pastille de
    la liste + couleur du site sur la carte). La valeur brute du champ
    (booléen, code de nomenclature, chaîne libre, ...) est comparée à `value`.
  - `default_color` / `default_label` : utilisés quand aucune visite de
    l'année ne renvoie de valeur connue pour ce site (pas de visite, champ
    vide, ou valeur absente de `success_values`).

Sur une page à plusieurs sous-modules : la carte affiche tous les sites de
tous les sous-modules ensemble, la légende affiche un groupe par
sous-module (ses `success_values` propres), et la liste latérale affiche un
onglet par sous-module.

Seule la route `/monitorings/refacto/<module_code>/visits` est utilisée pour
l'instant : le résultat doit donc être directement porté par la visite.

## Structure

```
backend/gn_module_monitoring_repro/
  conf_schema_toml.py     # schéma de config (PAGES > modules > success_values)
  blueprint.py            # blueprint vide, module frontend only

frontend/app/
  gnModule.module.ts      # routes: '' -> accueil, ':pageCode' -> carte
  home/                    # page d'accueil, une carte par page configurée
  repro-map/               # carte combinée + sélecteur d'année pour une page
  components/
    year-selector/
    repro-site-list/        # tableau filtrable des sites d'un sous-module (un par onglet)
  services/
    repro-config.service.ts     # lecture de la config MONITORING_REPRO.PAGES
    monitoring-api.service.ts   # appels HTTP vers l'API de gn_module_monitoring
    repro-success.service.ts    # évaluation du résultat de reproduction (visit_success_field)
  resolvers/repro-page-config.resolver.ts
  interfaces/
```
