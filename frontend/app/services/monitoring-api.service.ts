import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '@geonature/services/config.service';
import { ModuleService } from '@geonature/services/module.service';
import { MonitoringPaginatedResult } from '../interfaces/monitoring.interface';

/** module_code du module gn_module_monitoring dont on consomme l'API */
const MONITORING_MODULE_CODE = 'MONITORINGS';

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

  /**
   * Sites d'un module
   */
  getJsonExport(
    moduleCode: string,
    method: string,
    params: { [key: string]: any } = {}
  ): Observable<any[]> {
    return this._http.get<any[]>(`${this.baseUrl()}/exports/csv/${moduleCode}/${method}`, {
      params: { ...params, format: 'json' },
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

  /** Téléchargement CSV d'une vue d'export (site_export_name ou visit_export_name). */
  downloadExport(
    moduleCode: string,
    method: string,
    params: { [key: string]: any } = {}
  ): Observable<Blob> {
    return this._http.get(`${this.baseUrl()}/exports/csv/${moduleCode}/${method}`, {
      params: { ...params, format: 'csv' },
      responseType: 'blob',
    });
  }
}
