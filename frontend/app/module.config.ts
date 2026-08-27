export const ModuleConfig = {
 "MODULE_API": "/monitoring_year_synthese",
 "MODULE_CODE": "MONITORING_YEAR_SYNTHESE",
 "MODULE_URL": "/monitoring_year_synthese",
 "PAGES": [
  {
   "modules": [
    {
     "legend_field": "cd_statut_reproduction",
     "legend_values": [
      {
       "color": "#c41313",
       "label": "\u00e9chec",
       "value": "9"
      },
      {
       "color": "#156b19",
       "label": "2 jeunes envol\u00e9s",
       "value": "4"
      },
      {
       "color": "#69cc6e",
       "label": "1 jeune envol\u00e9",
       "value": "3"
      },
      {
       "color": "#dfdb0d",
       "label": "reproduction en cours",
       "value": "2"
      },
      {
       "color": "#fdfdfd",
       "label": "pas de conclusion possible",
       "value": "1"
      },
      {
       "color": "#bdbdbd",
       "label": "pas de donn\u00e9es",
       "value": "0"
      },
      {
       "color": "#0e0d0de1",
       "label": "pas de reproduction constat\u00e9e",
       "value": "8"
      }
     ],
     "module_code": "domaine_vital",
     "module_label": "Domaines vitaux",
     "site_export_name": "repro_status",
     "site_geom_type": "polygon",
     "visit_export_name": "visits",
     "visit_fields": [
      "Dur\u00e9e visite",
      "Comportement(s)",
      "Nb jeune seul",
      "Nb jeune avec adulte",
      "Statut de reproduction",
      "commentaire"
     ],
     "visit_label_field": "visite_label"
    },
    {
     "legend_field": "activite_aire",
     "legend_values": [
      {
       "color": "#ff0000",
       "label": "\u00c9chec",
       "value": "\u00c9chec"
      },
      {
       "color": "#00ff0d",
       "label": "Activit\u00e9 not\u00e9 sur l'aire",
       "value": "Activit\u00e9 not\u00e9 sur l'aire"
      },
      {
       "color": "#ffb74d",
       "label": "Aucune activit\u00e9 constat\u00e9e",
       "value": "Aucune activit\u00e9 constat\u00e9e"
      },
      {
       "color": "#757575",
       "label": "Aucune visite",
       "value": "Aucune visite"
      }
     ],
     "module_code": "aigle",
     "module_label": "Aire",
     "site_export_name": "sites_bilan_annuel",
     "site_geom_type": "point",
     "visit_export_name": "visits",
     "visit_fields": [
      "Activit\u00e9 \u00e0 l'aire",
      "Dur\u00e9e visite",
      "Nb adulte",
      "Nb jeune blanc",
      "Nb jeune envol\u00e9",
      "commentaire"
     ],
     "visit_label_field": "label_visit"
    }
   ],
   "page_code": "aigle_domaine_vital",
   "page_label": "Suivi de la reproduction des aigles royaux"
  },
  {
   "modules": [
    {
     "legend_field": "_label_statut_reproduction",
     "legend_values": [
      {
       "color": "#c41313",
       "label": "\u00c9chec",
       "value": "\u00c9chec"
      },
      {
       "color": "#00ff0d",
       "label": "Succ\u00e8s de la reproduction",
       "value": "Succ\u00e8s de la reproduction"
      },
      {
       "color": "#dfdb0d",
       "label": "Reproduction en cours",
       "value": "Reproduction en cours"
      },
      {
       "color": "#ffb74d",
       "label": "Pas de reproduction ou pas d'activit\u00e9",
       "value": "Pas de reproduction ou pas d'activit\u00e9"
      },
      {
       "color": "#bdbdbd",
       "label": "pas de donn\u00e9es",
       "value": "*no_data"
      }
     ],
     "module_code": "nidif_gypa",
     "module_label": "Aire",
     "site_export_name": "sites",
     "site_geom_type": "point",
     "visit_export_name": "visits",
     "visit_fields": null,
     "visit_label_field": "visit_date_min"
    }
   ],
   "page_code": "nidif_gypa",
   "page_label": "Suivi de la reproduction des gypa\u00e8tes"
  }
 ]
}