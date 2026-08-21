import { Component, OnInit } from '@angular/core';
import { ReproConfigService } from '../services/repro-config.service';
import { ReproPageConfig } from '../interfaces/repro-config.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  pages: ReproPageConfig[] = [];

  constructor(private _reproConfig: ReproConfigService) {}

  ngOnInit() {
    this.pages = this._reproConfig.pages;
  }
}
