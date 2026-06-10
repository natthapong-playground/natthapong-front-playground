import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';

import { CountryApiService } from './country-api.service';
import { ClockSnapshot, Country } from '../models/country.model';
import { SelectionStore } from './selection-store.service';


const TICK_MS = 1_000; // tick clock every 1 s
const RESYNC_MS = 60_000; // re-sync with GET every 60 s

@Injectable({ providedIn: 'root' })
export class ClockService {
  private readonly api = inject(CountryApiService);
  private readonly selection = inject(SelectionStore);
  private readonly destroyRef = inject(DestroyRef);

  private readonly snapshot = signal<ClockSnapshot | null>(null);
  private referenceUtcMs = 0; // server "now" of the last snapshot
  private fetchedAtMs = 0;    // browser wall-clock when we stored it

  private readonly ticker = signal(0);

  readonly syncing = signal(false);
  readonly error = signal<string | null>(null);

  readonly countries = computed<Country[]>(() => this.snapshot()?.countries ?? []);
  readonly referenceUtc = computed<string | null>(() => this.snapshot()?.referenceUtc ?? null);

  // Recomputes every tick so every clock advances together.
  readonly now = computed<Date>(() => {
    this.ticker();
    if (!this.referenceUtcMs) {
      return new Date();
    }
    return new Date(this.referenceUtcMs + (Date.now() - this.fetchedAtMs));
  });

  constructor() {
    // Re-sync whenever the selected list changes (also runs once on startup).
    effect(() => {
      const codes = this.selection.codes();
      this.resync(codes);
    });

    const tickTimer = setInterval(() => this.ticker.update((t) => t + 1), TICK_MS);

    const pollTimer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.resync(this.selection.codes());
      }
    }, RESYNC_MS);

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        this.resync(this.selection.codes());
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    this.destroyRef.onDestroy(() => {
      clearInterval(tickTimer);
      clearInterval(pollTimer);
      document.removeEventListener('visibilitychange', onVisible);
    });
  }

  // Force an immediate authoritative re-sync.
  refresh(): void {
    this.resync(this.selection.codes());
  }

  private resync(codes: string[]): void {
    // Empty list: no need to hit the API — stamp a local reference instant so the
    // footer still updates (the backend would return an empty list anyway).
    if (codes.length === 0) {
      this.applySnapshot({ referenceUtc: new Date().toISOString(), countries: [] });
      this.error.set(null);
      return;
    }

    this.syncing.set(true);
    this.api.getClock(codes).subscribe({
      next: (snap) => {
        this.applySnapshot(snap);
        this.error.set(null);
        this.syncing.set(false);
      },
      error: () => {
        // Keep showing the last known times; just surface that we're stale.
        this.error.set('Could not sync clocks — showing the last known times.');
        this.syncing.set(false);
      }
    });
  }

  private applySnapshot(snap: ClockSnapshot): void {
    this.referenceUtcMs = new Date(snap.referenceUtc).getTime();
    this.fetchedAtMs = Date.now();
    this.snapshot.set(snap);
  }
}