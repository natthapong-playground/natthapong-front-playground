import { Injectable, signal } from '@angular/core';


const STORAGE_KEY = 'world-clock.codes.v1';

@Injectable({ providedIn: 'root' })
export class SelectionStore {
  private readonly _codes = signal<string[]>(this.load());

  // Read-only view components subscribe to.
  readonly codes = this._codes.asReadonly();

  add(code: string): void {
    const c = code.toUpperCase();
    if (this._codes().includes(c)) {
      return; // no duplicates 
    }
    this._codes.update((list) => [...list, c]);
    this.persist();
  }

  remove(code: string): void {
    const c = code.toUpperCase();
    this._codes.update((list) => list.filter((x) => x !== c));
    this.persist();
  }

  has(code: string): boolean {
    return this._codes().includes(code.toUpperCase());
  }

  private load(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed)
        ? parsed.filter((x): x is string => typeof x === 'string').map((x) => x.toUpperCase())
        : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._codes()));
    } catch {
      /* storage may be unavailable; selection is then in-memory only */
    }
  }
}
