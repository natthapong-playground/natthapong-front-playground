import { Injectable, computed, signal } from '@angular/core';

export type UiTheme = 'ocean' | 'light';

const STORAGE_KEY = 'ui.theme.v1';

@Injectable({ providedIn: 'root' })
export class UiThemeService {
  private readonly _theme = signal<UiTheme>(this.load());

  readonly theme = this._theme.asReadonly();
  readonly isLight = computed(() => this._theme() === 'light');

  toggle(): void {
    const nextTheme: UiTheme = this.isLight() ? 'ocean' : 'light';
    this._theme.set(nextTheme);
    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      /* The selected theme remains available for the current session. */
    }
  }

  private load(): UiTheme {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'ocean';
    } catch {
      return 'ocean';
    }
  }
}
