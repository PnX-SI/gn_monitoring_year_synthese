import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SubModuleConfig } from '../../interfaces/config.interface';

/**
 * Tableau filtrable des sites d'un sous-module, avec ligne de détail
 * dépliable listant ses contrôles (visites) de l'année. Une instance par
 * onglet (un onglet = un sous-module de la page).
 */
@Component({
  selector: 'mys-site-list',
  templateUrl: './site-list.component.html',
  styleUrls: ['./site-list.component.scss'],
})
export class SiteListComponent {
  @Input() moduleConfig: SubModuleConfig;
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

  onRowClick(site: any) {
    this.siteClick.emit(site);
  }
}
