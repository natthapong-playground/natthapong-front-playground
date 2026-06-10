import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../../../core/services/auth.service';
import { ClockService } from '../../../../core/services/clock.service';
import { CountryApiService } from '../../../../core/services/country-api.service';
import { SelectionStore } from '../../../../core/services/selection-store.service';
import { Country } from '../../../../core/models/country.model';

import { ClockList } from '../clock-list/clock-list';
import { DetailPanel } from '../detail-panel/detail-panel';
import { SearchBar } from '../search-bar/search-bar';
import { WorldClockFooter } from '../footer/footer';
import { WorldMap } from '../world-map/world-map';

import { DragDropModule } from '@angular/cdk/drag-drop';
// The world map fills the screen; 
// the search box and the live list float over it; the hover panel and footer overlay the corners.
@Component({
  selector: 'app-world-clock-page',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    ClockList,
    DragDropModule,
    DetailPanel,
    SearchBar,
    WorldClockFooter,
    WorldMap
  ],
  templateUrl: './world-clock-page.html',
  styleUrl: './world-clock-page.css'
})
export class WorldClockPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly api = inject(CountryApiService);

  protected readonly selection = inject(SelectionStore);
  protected readonly clock = inject(ClockService);
  protected readonly isAuthenticated = this.auth.isAuthenticated;

  // View toggles (persisted so they survive a reload).
  protected readonly showSearch = signal<boolean>(this.loadPref('showSearch', true));
  protected readonly showGrid = signal<boolean>(this.loadPref('showGrid', false));

  // The country under the cursor on the map (drives the hover panel, F5).
  protected readonly hovered = signal<Country | null>(null);
  // Small lookup cache so re-hovering a country doesn't re-hit the API.
  private readonly cache = new Map<string, Country>();
  // The code currently under the cursor — guards against stale async responses.
  private pendingCode: string | null = null;

  protected toggleSearch(): void {
    this.showSearch.update((v) => !v);
    this.savePref('showSearch', this.showSearch());
  }

  protected toggleGrid(): void {
    this.showGrid.update((v) => !v);
    this.savePref('showGrid', this.showGrid());
  }

  protected onAdd(code: string): void {
    this.selection.add(code); // ClockService re-syncs via its selection effect
  }

  protected onRemove(code: string): void {
    this.selection.remove(code);
  }

  // Map hover → fetch (or reuse) the country and show the detail panel.
  protected onHover(code: string | null): void {
    this.pendingCode = code;
    if (!code) {
      this.hovered.set(null);
      return;
    }
    const cached = this.cache.get(code);
    if (cached) {
      this.hovered.set(cached);
      return;
    }
    this.api.getCountry(code).subscribe({
      next: (country) => {
        this.cache.set(code, country);
        // Only show it if the cursor is still on this country.
        if (this.pendingCode === code) {
          this.hovered.set(country);
        }
      },
      error: () => {
        if (this.pendingCode === code) {
          this.hovered.set(null);
        }
      }
    });
  }

  protected onProfile(): void {
    this.router.navigate(['/profile']);
  }

  protected onLogout(): void {
    this.auth.logout();
  }

  // ── View-preference persistence (localStorage, best-effort)
  private loadPref(key: string, fallback: boolean): boolean {
    try {
      const raw = localStorage.getItem(`world-clock.${key}`);
      return raw === null ? fallback : raw === 'true';
    } catch {
      return fallback;
    }
  }

  private savePref(key: string, value: boolean): void {
    try {
      localStorage.setItem(`world-clock.${key}`, String(value));
    } catch {
      /* storage may be unavailable; preference is then in-memory only */
    }
  }
}
