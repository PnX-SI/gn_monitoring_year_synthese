import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../services/config.service';
import { PageConfig } from '../interfaces/config.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  pages: PageConfig[] = [];

  constructor(private _config: ConfigService) {}

  ngOnInit() {
    this.pages = this._config.pages;
  }
}
