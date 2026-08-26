import { Injectable } from '@angular/core';
import { ReproModuleConfig, ReproSuccessValue } from '../interfaces/repro-config.interface';


/**
 * Résout la couleur/le libellé (legend_values) d'un enregistrement renvoyé
 * par la vue d'export SQL d'un site par année(site_export_name)
 */
@Injectable({ providedIn: 'root' })
export class ReproLegendService {
  /**
   * Résultat d'un site (un enregistrement de la vue d'export, déjà filtré
   * sur l'année sélectionnée), ou `null` si le module ne déclare pas de
   * legend_values qui match
   */
  getSiteResult(row: any, config: ReproModuleConfig): ReproSuccessValue | null {
    const legendItems = config.legend_values || [];
    const rawValue = config.legend_field ? row?.[config.legend_field] : undefined;

    return (
      legendItems.find((v) => String(v.value) === String(rawValue)) || null
    );
  }
}
