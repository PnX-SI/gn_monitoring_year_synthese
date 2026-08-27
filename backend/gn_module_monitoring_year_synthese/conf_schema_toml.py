"""
   Spécification du schéma toml des paramètres de configurations
   La classe doit impérativement s'appeller GnModuleSchemaConf
   Fichier spécifiant les types des paramètres et leurs valeurs par défaut
   Fichier à ne pas modifier. Paramètres surcouchables dans config/monitoring_year_synthese_config.toml
"""

from marshmallow import Schema, fields


class LegendValueSchema(Schema):
    """
    Une valeur possible du champ de résultat, avec son affichage : couleur
    (carte + pastille de la liste) et libellé (légende de la carte).
    """

    value = fields.String(required=True)
    label = fields.String(required=True)
    color = fields.String(required=True)


class SubModuleConfigSchema(Schema):
    module_code = fields.String(required=True)
    module_label = fields.String(load_default=None)
    legend_field = fields.String(load_default=None)
    visit_label_field = fields.String(load_default="visit_date_min")
    visit_fields = fields.List(fields.String(), load_default=None, allow_none=True)
    legend_values = fields.List(fields.Nested(LegendValueSchema), load_default=[])
    site_geom_type = fields.Str(load_default="point") # poitnt ou polygone, sert à construire la légende
    site_export_name = fields.String(required=True)
    visit_export_name = fields.String()
    dispay_add_button = fields.Boolean(load_default=True)  # afficher le bouton 'ajouter une visite' dans les listes


class PageConfigSchema(Schema):
    """
    Une page du module, affichant sur une même carte les sites d'un
    ou plusieurs sous-modules gn_module_monitoring. Chaque
    sous-module garde ses propres critères de lègende
    """

    page_code = fields.String(required=True)
    page_label = fields.String(load_default=None)
    modules = fields.List(fields.Nested(SubModuleConfigSchema), required=True)


class GnModuleSchemaConf(Schema):
    PAGES = fields.List(fields.Nested(PageConfigSchema), load_default=[])
