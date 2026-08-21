import { Injectable } from '@angular/core';
import { ReproModuleConfig, ReproSuccessValue } from '../interfaces/repro-config.interface';

/**
 * Évalue le résultat de reproduction d'une visite gn_module_monitoring à
 * partir de `visit_success_field`, sur les objets renvoyés par
 * /monitorings/refacto/<module_code>/visits (champs specific sous `data`,
 * champs generic à plat).
 *
 * TODO évolution future : remonter aux observations / observation_detail
 * quand le résultat n'est pas porté directement par la visite.
 */
@Injectable({ providedIn: 'root' })
export class ReproSuccessService {
  /** Résultat d'une visite, ou `null` si son champ ne correspond à aucune valeur de success_values. */
  getVisitResult(visit: any, config: ReproModuleConfig): ReproSuccessValue | null {
    if (!config.visit_success_field) {
      return null;
    }
    const rawValue = this.getFieldValue(visit, config.visit_success_field);
    if (rawValue === undefined || rawValue === null) {
      return null;
    }
    // success_values vient du TOML : v.value est une liste de chaînes, alors
    // que rawValue (issu de `data`) peut être un booléen, un nombre ou une
    // chaîne selon le type du champ en base.
    return (
      (config.success_values || []).find((v) =>
        v.value.some((value) => String(value) === String(rawValue))
      ) ?? null
    );
  }

  /**
   * Résultat d'un site pour une année, à partir de la liste de ses visites :
   * le résultat le plus prioritaire (le premier déclaré dans success_values),
   * ou `null` si aucune visite n'a de résultat connu.
   */
  getSiteResult(visits: any[], config: ReproModuleConfig): ReproSuccessValue | null {
    const values = config.success_values || [];
    let best: ReproSuccessValue | null = null;

    for (const visit of visits) {
      const result = this.getVisitResult(visit, config);
      if (result && (!best || values.indexOf(result) < values.indexOf(best))) {
        best = result;
      }
    }

    return best;
  }

  /** Un champ generic est à plat sur la visite, un champ specific est sous `data`. */
  private getFieldValue(visit: any, fieldName: string): any {
    if (visit[fieldName] !== undefined) {
      return visit[fieldName];
    }
    return visit.data ? visit.data[fieldName] : undefined;
  }
}
