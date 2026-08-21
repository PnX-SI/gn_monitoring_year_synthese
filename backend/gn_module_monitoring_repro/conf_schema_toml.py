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

    value = fields.List(fields.String(), required=True)
    label = fields.String(required=True)
    color = fields.String(required=True)


class ReproModuleConfigSchema(Schema):
    """
    Configuration d'un sous-module gn_module_monitoring (aigle, domaine_vital,
    gypaete, ...) dont les sites doivent être affichés sur une page.

    visit_success_field désigne le nom du champ (generic ou specific) qui
    porte le résultat de reproduction sur la visite, tel qu'il apparaît dans
    la réponse de /monitorings/refacto/<module_code>/visits.

    La valeur brute du champ (booléen, code de nomenclature, chaîne libre,
    ...) est comparée aux valeurs déclarées dans success_values pour
    déterminer la couleur et le libellé à afficher. Si aucune valeur ne
    correspond (champ vide, valeur non déclarée, ou aucune visite sur
    l'année), default_color / default_label sont utilisés.
    """

    module_code = fields.String(required=True)
    module_label = fields.String(load_default=None)
    visit_success_field = fields.String(load_default=None)
    success_values = fields.List(fields.Nested(ReproSuccessValueSchema), load_default=[])
    default_color = fields.String(load_default="#504e4eb7")
    default_label = fields.String(load_default="Pas de donnée")


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
