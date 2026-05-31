import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { Role, User } from '../../../core/models/user.model';

// ─── Page state machine ──────────────────────────────────────────
// Mutually-exclusive states the page can be in.
type ViewState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'loaded'; user: User };

// ─── Role display config ─────────────────────────────────────────
// Add a new role to `Role` and TypeScript will require an entry here.
interface RoleDisplay {
  icon: string;
  description: string;
}

const ROLE_DISPLAY: Record<Role, RoleDisplay> = {
  Guest:      { icon: 'visibility',           description: 'Read-only access' },
  Regular:    { icon: 'person',               description: 'Standard user' },
  Admin:      { icon: 'admin_panel_settings', description: 'Administrative privileges' },
  SuperAdmin: { icon: 'shield',               description: 'Full system access' }
};

// ─── Server error messages ───────────────────────────────────────
const SERVER_ERRORS: Record<number, string> = {
  0: 'Cannot reach the server. Please try again.',
  403: 'You do not have permission to view this profile.',
  404: 'Profile not found.'
};
const FALLBACK_ERROR = 'Could not load profile.';

@Component({
  selector: 'app-profile',
  imports: [
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatToolbarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  private userService = inject(UserService);
  private auth = inject(AuthService);
  private router = inject(Router);

  // The single source of truth for what the page is doing.
  protected readonly state = signal<ViewState>({ kind: 'loading' });

  // ─── Narrowed accessors ──────────────────────────────────────
  // Angular's template type checker doesn't narrow discriminated unions
  // inside @switch/@case blocks. We narrow in TypeScript instead, and
  // the template uses these typed views.
  protected readonly loadedUser = computed<User | null>(() => {
    const s = this.state();
    return s.kind === 'loaded' ? s.user : null;
  });

  protected readonly errorMessage = computed<string | null>(() => {
    const s = this.state();
    return s.kind === 'error' ? s.message : null;
  });

  // ─── Derived display values ──────────────────────────────────
  protected readonly initial = computed(() => {
    const user = this.loadedUser();
    return user ? user.email.charAt(0).toUpperCase() : '?';
  });

  protected readonly roleInfo = computed<RoleDisplay | null>(() => {
    const user = this.loadedUser();
    return user ? ROLE_DISPLAY[user.role] : null;
  });

  ngOnInit(): void {
    this.userService.getMyProfile().subscribe({
      next: (user) => this.state.set({ kind: 'loaded', user }),
      error: (err) => {
        // 401 is handled globally by the interceptor (auto-logout); skip here.
        if (err.status === 401) return;
        const message =
          SERVER_ERRORS[err.status] ?? err.error?.detail ?? FALLBACK_ERROR;
        this.state.set({ kind: 'error', message });
      }
    });
  }

  onLogout(): void {
    this.auth.logout();
  }
}