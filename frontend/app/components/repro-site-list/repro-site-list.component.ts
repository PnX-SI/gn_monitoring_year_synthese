import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReproModuleConfig, ReproSuccessValue } from '../../interfaces/repro-config.interface';

/**
 * Tableau filtrable des sites d'un sous-module, avec ligne de détail
 * dépliable listant ses contrôles (visites) de l'année. Une instance par
 * onglet (un onglet = un sous-module de la page).
 */
@Component({
  selector: 'repro-site-list',
  templateUrl: './repro-site-list.component.html',
  styleUrls: ['./repro-site-list.component.scss'],
})
export class ReproSiteListComponent {
  @Input() moduleConfig: ReproModuleConfig;
  @Input() sites: any[] = [];
  @Input() selectedSiteId: number | null = null;
  /** Le composant parent gère le clic : recentrer la carte + afficher le détail des visites. */
  @Output() siteClick = new EventEmitter<any>();

  filterText = '';
  displayedColumns = ['success', 'base_site_name', 'detail', 'add'];

  get filteredSites(): any[] {
    // `sites` peut valoir undefined tant que le chargement n'est pas
    // terminé côté parent (le binding [sites] écrase alors la valeur par
    // défaut du @Input).
    const sites = this.sites || [];
    const filter = this.filterText.trim().toLowerCase();
    if (!filter) {
      return sites;
    }
    return sites.filter((site) => site.base_site_name?.toLowerCase().includes(filter));
  }

  resultColor(result: ReproSuccessValue | null): string {
    return result?.color || this.moduleConfig.default_color || '#bdbdbd';
  }

  resultLabel(result: ReproSuccessValue | null): string {
    return result?.label || this.moduleConfig.default_label || 'Pas de donnée';
  }

  onRowClick(site: any) {
    this.siteClick.emit(site);
  }
}
