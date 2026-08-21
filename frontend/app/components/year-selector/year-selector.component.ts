import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'repro-year-selector',
  templateUrl: './year-selector.component.html',
  styleUrls: ['./year-selector.component.scss'],
})
export class YearSelectorComponent {
  @Input() years: number[] = [];
  @Input() selectedYear: number;
  @Output() yearChange = new EventEmitter<number>();

  onChange(year: string) {
    this.selectedYear = +year;
    this.yearChange.emit(this.selectedYear);
  }
}
