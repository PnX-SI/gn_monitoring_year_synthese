import { Injectable } from '@angular/core';
import { ConfigService as GnConfigService } from '@geonature/services/config.service';
import { ReproPageConfig } from '../interfaces/repro-config.interface';

@Injectable({ providedIn: 'root' })
export class ReproConfigService {
  constructor(private _appConfig: GnConfigService) {}

  get pages(): ReproPageConfig[] {
    return (this._appConfig as any)['MONITORING_REPRO']?.PAGES ?? [];
  }

  getPageConfig(pageCode: string): ReproPageConfig | undefined {
    return this.pages.find((p) => p.page_code === pageCode);
  }
}
