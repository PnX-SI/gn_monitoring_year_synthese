import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { GN2CommonModule } from '@geonature_common/GN2Common.module';

import { HomeComponent } from './home/home.component';
import { ReproMapComponent } from './repro-map/repro-map.component';
import { YearSelectorComponent } from './components/year-selector/year-selector.component';
import { ReproSiteListComponent } from './components/repro-site-list/repro-site-list.component';
import { ReproVisitPanelComponent } from './components/repro-visit-panel/repro-visit-panel.component';
import { ReproPageConfigResolver } from './resolvers/repro-page-config.resolver';

// my module routing
const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: ':pageCode',
    component: ReproMapComponent,
    resolve: { pageConfig: ReproPageConfigResolver },
  },
];

@NgModule({
  declarations: [
    HomeComponent,
    ReproMapComponent,
    YearSelectorComponent,
    ReproSiteListComponent,
    ReproVisitPanelComponent,
  ],
  imports: [
    GN2CommonModule,
    CommonModule,
    FormsModule,
    MatTableModule,
    MatTabsModule,
    RouterModule.forChild(routes),
  ],
  providers: [],
  bootstrap: [HomeComponent],
})
export class GeonatureModule {}
