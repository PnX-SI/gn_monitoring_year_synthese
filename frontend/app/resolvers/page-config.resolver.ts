import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { ConfigService } from '../services/config.service';
import { PageConfig } from '../interfaces/config.interface';

/**
 * Résout la config de la page (:pageCode) demandée dans l'URL.
 * Redirige vers l'accueil si ce page_code n'est pas listé dans la config
 * MONITORING_YEAR_SYNTHESE.PAGES.
 */
@Injectable({ providedIn: 'root' })
export class PageConfigResolver implements Resolve<PageConfig> {
  constructor(
    private _config: ConfigService,
    private _router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot): PageConfig {
    const pageCode = route.paramMap.get('pageCode');
    const config = this._config.getPageConfig(pageCode);

    if (!config) {
      this._router.navigate(['/monitoring_year_synthese']);
    }
    return config;
  }
}
