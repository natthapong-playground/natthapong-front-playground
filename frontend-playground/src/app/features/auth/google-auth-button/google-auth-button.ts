import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdentity {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }): void;
  renderButton(
    parent: HTMLElement,
    options: {
      theme: 'outline';
      size: 'large';
      shape: 'rectangular';
      text: 'signin_with' | 'signup_with';
      width: number;
    },
  ): void;
}

interface GoogleAccounts {
  accounts: { id: GoogleIdentity };
}

declare global {
  interface Window {
    google?: GoogleAccounts;
  }
}

let googleScriptPromise: Promise<GoogleAccounts> | null = null;

function loadGoogleIdentity(): Promise<GoogleAccounts> {
  if (window.google?.accounts.id) {
    return Promise.resolve(window.google);
  }
  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts.id) {
        resolve(window.google);
      } else {
        googleScriptPromise = null;
        reject(new Error('Google Identity Services did not initialize.'));
      }
    };
    script.onerror = () => {
      googleScriptPromise = null;
      script.remove();
      reject(new Error('Google Identity Services could not be loaded.'));
    };
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

const SERVER_ERRORS: Record<number, string> = {
  0: 'Cannot reach the server. Please try again.',
  401: 'Google could not verify this account. Please try again.',
  403: 'Your account has been deactivated. Please contact support.',
  503: 'Google sign-in is not configured on the server.',
};

@Component({
  selector: 'app-google-auth-button',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './google-auth-button.html',
  styleUrl: './google-auth-button.css',
})
export class GoogleAuthButton {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly buttonHost = viewChild.required<ElementRef<HTMLElement>>('buttonHost');

  readonly text = input<'signin_with' | 'signup_with'>('signin_with');
  protected readonly configured = !!environment.googleClientId;
  protected readonly preparing = signal(true);
  protected readonly authenticating = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly retryable = signal(false);

  constructor() {
    afterNextRender(() => this.renderButton());
  }

  private async renderButton(): Promise<void> {
    if (!environment.googleClientId) {
      this.preparing.set(false);
      return;
    }

    try {
      const google = await loadGoogleIdentity();
      if (this.destroyRef.destroyed) return;

      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response) => {
          if (!this.destroyRef.destroyed) {
            this.authenticate(response.credential);
          }
        },
      });
      const host = this.buttonHost().nativeElement;
      google.accounts.id.renderButton(host, {
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        text: this.text(),
        width: Math.floor(Math.min(host.clientWidth || 320, 400)),
      });
      this.preparing.set(false);
      this.retryable.set(false);
    } catch {
      this.preparing.set(false);
      this.retryable.set(true);
      this.error.set('Google sign-in could not be loaded. Please try again.');
    }
  }

  protected retry(): void {
    this.error.set(null);
    this.retryable.set(false);
    this.preparing.set(true);
    void this.renderButton();
  }

  private authenticate(credential: string): void {
    if (!credential || this.authenticating() || this.destroyRef.destroyed) return;

    this.authenticating.set(true);
    this.retryable.set(false);
    this.error.set(null);
    this.auth
      .loginWithGoogle(credential)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigate(['/profile']),
        error: (err) => {
          this.authenticating.set(false);
          this.error.set(
            SERVER_ERRORS[err.status] ??
              err.error?.detail ??
              'Google sign-in failed. Please try again.',
          );
        },
      });
  }
}
