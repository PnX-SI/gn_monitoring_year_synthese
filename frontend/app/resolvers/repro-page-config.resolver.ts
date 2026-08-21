import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { ReproConfigService } from '../services/repro-config.service';
import { ReproPageConfig } from '../interfaces/repro-config.interface';

/**
 * Résout la config de la page (:pageCode) demandée dans l'URL.
 * Redirige vers l'accueil si ce page_code n'est pas listé dans la config
 * MONITORING_REPRO.PAGES.
 */
@Injectable({ providedIn: 'root' })
export class ReproPageConfigResolver implements Resolve<ReproPageConfig> {
  constructor(
    private _reproConfig: ReproConfigService,
    private _router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot): ReproPageConfig {
    const pageCode = route.paramMap.get('pageCode');
    const config = this._reproConfig.getPageConfig(pageCode);

    if (!config) {
      this._router.navigate(['/monitoring_repro']);
    }
    return config;
  }
}
