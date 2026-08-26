"""
   Spécification du schéma toml des paramètres de configurations
   La classe doit impérativement s'appeller GnModuleSchemaConf
   Fichier spécifiant les types des paramètres et leurs valeurs par défaut
   Fichier à ne pas modifier. Paramètres surcouchables dans config/monitoring_repro_config.toml
"""

from marshmallow import Schema, fields


class ReproSuccessValueSchema(Schema):
    """
    Une valeur possible du champ de résultat, avec son affichage : couleur
    (carte + pastille de la liste) et libellé (légende de la carte).
    """

    value = fields.String(required=True)
    label = fields.String(required=True)
    color = fields.String(required=True)


class ReproModuleConfigSchema(Schema):
    """
    Configuration d'un sous-module gn_module_monitoring (aigle, domaine_vital,
    gypaete, ...) dont les sites doivent être affichés sur une page.

    Les sites et les visites sont chargés via les vues SQL d'export de
    gn_module_monitoring (route /exports/csv/<module_code>/<method>) :
    - site_export_name désigne le suffixe de la vue
      gn_monitoring.v_export_<module_code>_<site_export_name>, qui doit renvoyer
      un enregistrement par site et par année, déjà accompagné du résultat de
      reproduction (colonne legend_field, cf. ci-dessous) ;
    - visit_export_name désigne le suffixe de la vue
      gn_monitoring.v_export_<module_code>_<visit_export_name>, qui renvoie le
      détail des visites d'un site (panneau de droite).

    legend_field désigne le nom de la colonne, dans la vue
    site_export_name, qui porte le résultat de reproduction du site pour une
    année.

    visit_label_field désigne le label utilisé pour la visite sur le panneau latéral de droite

    visit_fields, si renseigné, restreint les champs d'une visite affichés
    dans ce panneau (generic et specific confondus) à cette liste de noms de
    champs. Absent (None), tous les champs sont affichés (comportement par
    défaut).
    """

    module_code = fields.String(required=True)
    module_label = fields.String(load_default=None)
    legend_field = fields.String(load_default=None)
    visit_label_field = fields.String(load_default="visit_date_min")
    visit_fields = fields.List(fields.String(), load_default=None, allow_none=True)
    legend_values = fields.List(fields.Nested(ReproSuccessValueSchema), load_default=[])
    site_geom_type = fields.Str(load_default="point") # poitnt ou polygone, sert à construire la légende
    site_export_name = fields.String(required=True)
    visit_export_name = fields.String()


class ReproPageConfigSchema(Schema):
    """
    Une page (route) du module, affichant sur une même carte les sites d'un
    ou plusieurs sous-modules gn_module_monitoring (ex: "aigle" +
    "domaine_vital" sur une page, "gypaete" seul sur une autre). Chaque
    sous-module garde ses propres critères de succès (cf.
    ReproModuleConfigSchema) : la carte affiche tous les sites de tous les
    sous-modules de la page, la liste latérale et la légende restent
    séparées par sous-module (un onglet chacune).
    """

    page_code = fields.String(required=True)
    page_label = fields.String(load_default=None)
    modules = fields.List(fields.Nested(ReproModuleConfigSchema), required=True)


class GnModuleSchemaConf(Schema):
    PAGES = fields.List(fields.Nested(ReproPageConfigSchema), load_default=[])
