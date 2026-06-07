import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditLog, AuditLogQuery } from '../models/audit-log.model';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private http = inject(HttpClient);

  getLogs(query: AuditLogQuery = {}): Observable<AuditLog[]> {
    let params = new HttpParams();


    if (query.actor_user_id != null) {
      params = params.set('actor_user_id', query.actor_user_id);
    }
    if (query.method) {
      params = params.set('method', query.method);
    }
    if (query.status_code != null) {
      params = params.set('status_code', query.status_code);
    }
    if (query.skip != null) {
      params = params.set('skip', query.skip);
    }
    if (query.limit != null) {
      params = params.set('limit', query.limit);
    }

    return this.http.get<AuditLog[]>(`${environment.apiUrl}/audit-logs`, { params });
  }
}
