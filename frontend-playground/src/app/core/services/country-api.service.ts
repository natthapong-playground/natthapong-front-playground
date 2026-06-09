import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ClockSnapshot, Country } from '../models/country.model';

@Injectable({ providedIn: 'root' })
export class CountryApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  // GET /countries?search=&limit= > autocomplete
  searchCountries(search: string, limit = 10): Observable<Country[]> {
    let params = new HttpParams().set('limit', limit);
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<Country[]>(`${this.base}/countries`, { params });
  }

  // GET /countries/{code} > one country (404, if unknown).
  getCountry(code: string): Observable<Country> {
    return this.http.get<Country>(`${this.base}/countries/${code.toUpperCase()}`);
  }

  // GET /clock?codes=TH,GB,DE > snapshot for the whole list.
  getClock(codes: string[]): Observable<ClockSnapshot> {
    const params = new HttpParams().set('codes', codes.join(','));
    return this.http.get<ClockSnapshot>(`${this.base}/clock`, { params });
  }
}
