import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Country } from '../../../../core/models/country.model';

// One row: flag · name · UTC offset · live local time · remove button.
@Component({
  selector: 'app-clock-list-item',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './clock-list-item.html',
  styleUrl: './clock-list-item.css'
})
export class ClockListItem {
  readonly country = input.required<Country>();
  readonly now = input.required<Date>();
  readonly remove = output<string>();

  // Render the shared "now" into this country's zone with Intl (24-hour).
  // The offset itself comes from the backend; we only format the instant here.
  protected readonly localTime = computed(() =>
    new Intl.DateTimeFormat(undefined, {
      timeZone: this.country().timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(this.now())
  );
}