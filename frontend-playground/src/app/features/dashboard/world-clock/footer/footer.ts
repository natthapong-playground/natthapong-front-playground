import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

// "Last information updated". Shows the latest referenceUtc from /clock.
@Component({
  selector: 'app-world-clock-footer',
  imports: [MatIconModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class WorldClockFooter {
  readonly referenceUtc = input<string | null>(null);

  protected readonly lastUpdated = computed<string | null>(() => {
    const ref = this.referenceUtc();
    if (!ref) {
      return null;
    }
    const date = new Date(ref);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    // this runs inside a computed re-read every tick, floods the console). Use explicit fields instead.
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    }).format(date);
  });
}
