import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { ClockListItem } from '../clock-list-item/clock-list-item';
import { Country } from '../../../../core/models/country.model';


@Component({
  selector: 'app-clock-list',
  imports: [MatIconModule, ClockListItem],
  templateUrl: './clock-list.html',
  styleUrl: './clock-list.css'
})
export class ClockList {
  readonly countries = input<Country[]>([]);
  readonly now = input.required<Date>();
  readonly remove = output<string>();
}
