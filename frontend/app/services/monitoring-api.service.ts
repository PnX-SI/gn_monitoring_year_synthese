import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { ConfigService } from '@geonature/services/config.service';
import { ModuleService } from '@geonature/services/module.service';
import { MonitoringPaginatedResult } from '../interfaces/monitoring.interface';

/** module_code du module gn_module_monitoring dont on consomme l'API */
const MONITORING_MODULE_CODE = 'MONITORINGS';

/** Nombre de visites récupérées par page lors du parcours de toutes les pages. */
const VISITS_PAGE_SIZE = 1000;

/**
 * Client HTTP vers l'API générique de gn_module_monitoring (sous-modules
 * aigle, domaine_vital, gypaete, ...). Ce module n'ayant pas de backend
 * propre, toutes les données viennent de là.
 */
@Injectable({ providedIn: 'root' })
export class MonitoringApiService {
  constructor(
    private _http: HttpClient,
    private _config: ConfigService,
    private _moduleService: ModuleService
  ) {}

  private baseUrl(): string {
    const monitoringModule = this._moduleService.getModule(MONITORING_MODULE_CODE);
    const modulePath = monitoringModule ? monitoringModule.module_path : 'monitorings';
    return `${this._config['API_ENDPOINT']}/${modulePath}`;
  }

  getSitesGeometries(moduleCode: string, params: { [key: string]: any } = {}): Observable<any> {
    return this._http.get<any>(`${this.baseUrl()}/refacto/${moduleCode}/sites/geometries`, {
      params,
    });
  }

  getVisits(
    moduleCode: string,
    params: { [key: string]: any } = {}
  ): Observable<MonitoringPaginatedResult<any>> {
    return this._http.get<MonitoringPaginatedResult<any>>(
      `${this.baseUrl()}/refacto/${moduleCode}/visits`,
      { params }
    );
  }

  /**
   * Toutes les visites d'une année (`visit_date_min` est une colonne date :
   * le filtre générique de gn_module_monitoring compare la date formatée
   * "YYYY-MM-DD" avec un ILIKE "%valeur%", donc passer l'année suffit).
   * La liste étant paginée côté API, on parcourt toutes les pages.
   */
  getVisitsByYear(
    moduleCode: string,
    year: number,
    params: { [key: string]: any } = {}
  ): Observable<any[]> {
    return from(this.fetchAllVisitPages(moduleCode, { ...params, visit_date_min: year }));
  }

  private async fetchAllVisitPages(
    moduleCode: string,
    params: { [key: string]: any }
  ): Promise<any[]> {
    const items: any[] = [];
    let page = 1;

    while (true) {
      const result = await this.getVisits(moduleCode, {
        ...params,
        page,
        limit: VISITS_PAGE_SIZE,
      }).toPromise();
      items.push(...(result.items || []));
      if (items.length >= result.count) {
        break;
      }
      page++;
    }

    return items;
  }
}
