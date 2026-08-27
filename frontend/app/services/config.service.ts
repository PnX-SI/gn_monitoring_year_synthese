import { Injectable } from '@angular/core';
import { ConfigService as GnConfigService } from '@geonature/services/config.service';
import { PageConfig } from '../interfaces/config.interface';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  constructor(private _appConfig: GnConfigService) {}

  get pages(): PageConfig[] {
    return (this._appConfig as any)['MONITORING_YEAR_SYNTHESE']?.PAGES ?? [];
  }

  getPageConfig(pageCode: string): PageConfig | undefined {
    return this.pages.find((p) => p.page_code === pageCode);
  }
}
