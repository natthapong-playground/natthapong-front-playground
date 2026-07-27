import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/services/auth.service';
import { AuditService } from '../../../core/services/audit.service';
import { UiThemeService } from '../../../core/services/ui-theme.service';
import { AuditLog, AuditLogQuery } from '../../../core/models/audit-log.model';


type ViewState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'loaded'; logs: AuditLog[] };

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
const PAGE_SIZE = 150;

const SERVER_ERRORS: Record<number, string> = {
  0: 'Cannot reach the server. Please try again.',
  403: 'You do not have permission to view audit logs.'
};
const FALLBACK_ERROR = 'Could not load audit logs.';

@Component({
  selector: 'app-audit-logs',
  imports: [
    FormsModule,
    DatePipe,
    MatToolbarModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './audit-logs.html',
  styleUrl: './audit-logs.css'
})
export class AuditLogs implements OnInit {
  private auditService = inject(AuditService);
  private auth = inject(AuthService);
  private router = inject(Router);
  protected readonly uiTheme = inject(UiThemeService);

  protected readonly methods = HTTP_METHODS;
  protected readonly columns = [
    'timestamp', 'actor', 'method', 'path', 'status', 'duration', 'client_ip'
  ];

  // Filter inputs (with ngModel).
  protected method = signal<string>('');
  protected statusCode = signal<number | null>(null);
  protected actorUserId = signal<number | null>(null);
  protected skip = signal<number>(0);

  protected readonly state = signal<ViewState>({ kind: 'loading' });
  protected readonly pageSize = PAGE_SIZE;

  protected readonly logs = computed<AuditLog[]>(() => {
    const s = this.state();
    return s.kind === 'loaded' ? s.logs : [];
  });

  protected readonly errorMessage = computed<string | null>(() => {
    const s = this.state();
    return s.kind === 'error' ? s.message : null;
  });

  protected readonly hasMore = computed(() => this.logs().length === PAGE_SIZE);

  // Counts for the rows currently shown (i.e. the active filtered search).
  // Note: reflects the loaded page, not the whole dataset across pages.
  protected readonly stats = computed(() => {
    const rows = this.logs();
    const counts = { total: rows.length, success: 0, redirect: 0, clientError: 0, serverError: 0 };
    for (const row of rows) {
      if (row.status_code >= 500) counts.serverError++;
      else if (row.status_code >= 400) counts.clientError++;
      else if (row.status_code >= 300) counts.redirect++;
      else counts.success++;
    }
    return counts;
  });

  ngOnInit(): void {
    this.load();
  }

  private buildQuery(): AuditLogQuery {
    return {
      method: this.method() || null,
      status_code: this.statusCode(),
      actor_user_id: this.actorUserId(),
      skip: this.skip(),
      limit: PAGE_SIZE
    };
  }

  protected load(): void {
    this.state.set({ kind: 'loading' });
    this.auditService.getLogs(this.buildQuery()).subscribe({
      next: (logs) => this.state.set({ kind: 'loaded', logs }),
      error: (err) => {
        if (err.status === 401) return;
        const message =
          SERVER_ERRORS[err.status] ?? err.error?.detail ?? FALLBACK_ERROR;
        this.state.set({ kind: 'error', message });
      }
    });
  }

  protected applyFilters(): void {
    this.skip.set(0);
    this.load();
  }

  protected clearFilters(): void {
    this.method.set('');
    this.statusCode.set(null);
    this.actorUserId.set(null);
    this.skip.set(0);
    this.load();
  }

  protected nextPage(): void {
    this.skip.update((s) => s + PAGE_SIZE);
    this.load();
  }

  protected prevPage(): void {
    this.skip.update((s) => Math.max(0, s - PAGE_SIZE));
    this.load();
  }

  // Colour coding (2xx / 3xx / 4xx / 5xx).
  protected statusClass(code: number): string {
    if (code >= 500) return 'status-5xx';
    if (code >= 400) return 'status-4xx';
    if (code >= 300) return 'status-3xx';
    return 'status-2xx';
  }

  protected onBack(): void {
    this.router.navigate(['/profile']);
  }

  protected onLogout(): void {
    this.auth.logout();
  }
}
