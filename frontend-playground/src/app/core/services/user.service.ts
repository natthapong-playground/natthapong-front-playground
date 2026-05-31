import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getMyProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/myprofile`);
  }
}