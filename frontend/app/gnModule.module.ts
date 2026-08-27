import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { GN2CommonModule } from '@geonature_common/GN2Common.module';

import { HomeComponent } from './home/home.component';
import { MapComponent } from './map/map.component';
import { YearSelectorComponent } from './components/year-selector/year-selector.component';
import { SiteListComponent } from './components/site-list/site-list.component';
import { VisitPanelComponent } from './components/visit-panel/visit-panel.component';
import { PageConfigResolver } from './resolvers/page-config.resolver';

// my module routing
const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: ':pageCode',
    component: MapComponent,
    resolve: { pageConfig: PageConfigResolver },
  },
];

@NgModule({
  declarations: [
    HomeComponent,
    MapComponent,
    YearSelectorComponent,
    SiteListComponent,
    VisitPanelComponent,
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
