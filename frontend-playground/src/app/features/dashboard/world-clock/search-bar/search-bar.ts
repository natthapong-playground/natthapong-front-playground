import { Component, inject, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';

import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CountryApiService } from '../../../../core/services/country-api.service';
import { Country } from '../../../../core/models/country.model';

// Country search + add: debounced autocomplete over GET /countries;
const DEBOUNCE_MS = 250;
const MAX_RESULTS = 8;

@Component({
  selector: 'app-search-bar',
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css'
})
export class SearchBar {
  private readonly api = inject(CountryApiService);

  readonly add = output<string>();

  protected readonly query = new FormControl('', { nonNullable: true });
  protected readonly results = signal<Country[]>([]);
  protected readonly searching = signal(false);

  constructor() {
    this.query.valueChanges
      .pipe(
        debounceTime(DEBOUNCE_MS),
        map((v) => v.trim()),
        distinctUntilChanged(),
        tap((v) => this.searching.set(v.length > 0)),
        switchMap((v) =>
          v.length > 0
            ? this.api.searchCountries(v, MAX_RESULTS).pipe(catchError(() => of<Country[]>([])))
            : of<Country[]>([])
        ),
        takeUntilDestroyed()
      )
      .subscribe((list) => {
        this.results.set(list);
        this.searching.set(false);
      });
  }

  protected onSelected(event: MatAutocompleteSelectedEvent): void {
    this.add.emit(event.option.value as string);
    this.query.setValue('');
    this.results.set([]);
  }
}
