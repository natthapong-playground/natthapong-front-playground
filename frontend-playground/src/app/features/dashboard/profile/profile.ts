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
import { UiThemeService } from '../../../core/services/ui-theme.service';
import { Role, User } from '../../../core/models/user.model';


type ViewState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'loaded'; user: User };


interface RoleDisplay {
  icon: string;
  description: string;
}

const ROLE_DISPLAY: Record<Role, RoleDisplay> = {
  Guest: { icon: 'visibility', description: 'Read-only access' },
  Regular: { icon: 'person', description: 'Standard user' },
  Admin: { icon: 'admin_panel_settings', description: 'Administrative privileges' },
  SuperAdmin: { icon: 'shield', description: 'Full system access' }
};

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
  protected readonly uiTheme = inject(UiThemeService);

  protected readonly state = signal<ViewState>({ kind: 'loading' });

  protected readonly loadedUser = computed<User | null>(() => {
    const s = this.state();
    return s.kind === 'loaded' ? s.user : null;
  });

  protected readonly errorMessage = computed<string | null>(() => {
    const s = this.state();
    return s.kind === 'error' ? s.message : null;
  });


  protected readonly initial = computed(() => {
    const user = this.loadedUser();
    return user ? user.email.charAt(0).toUpperCase() : '?';
  });

  protected readonly roleInfo = computed<RoleDisplay | null>(() => {
    const user = this.loadedUser();
    return user ? ROLE_DISPLAY[user.role] : null;
  });

  // Show admin-only navigation, when user is a SuperAdmin.
  protected readonly isSuperAdmin = computed(() => this.auth.currentRole() === 'SuperAdmin');

  ngOnInit(): void {
    this.userService.getMyProfile().subscribe({
      next: (user) => this.state.set({ kind: 'loaded', user }),
      error: (err) => {
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

  onViewAuditLogs(): void {
    this.router.navigate(['/audit-logs']);
  }

  onViewWorldClock(): void {
    this.router.navigate(['/world-clock']);
  }
}
