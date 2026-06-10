import { Component, computed, input } from '@angular/core';

import { Country } from '../../../../core/models/country.model';

// hover panel: name, timezone and the current local time of the country under the cursor.
@Component({
  selector: 'app-detail-panel',
  imports: [],
  templateUrl: './detail-panel.html',
  styleUrl: './detail-panel.css'
})
export class DetailPanel {
  readonly country = input<Country | null>(null);
  readonly now = input.required<Date>();

  protected readonly localTime = computed<string | null>(() => {
    const c = this.country();
    if (!c) {
      return null;
    }
    return new Intl.DateTimeFormat(undefined, {
      timeZone: c.timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(this.now());
  });
}