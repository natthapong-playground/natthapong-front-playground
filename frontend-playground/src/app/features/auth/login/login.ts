import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/services/auth.service';
import { UiThemeService } from '../../../core/services/ui-theme.service';
import { GoogleAuthButton } from '../google-auth-button/google-auth-button';

const VALIDATION_MESSAGES: Record<string, Record<string, string>> = {
  email: {
    required: 'Email is required.',
    email: 'Enter a valid email address.'
  },
  password: {
    required: 'Password is required.',
    minlength: 'Password must be at least 8 characters.'
  }
};


const SERVER_ERRORS: Record<number, string> = {
  0: 'Cannot reach the server, Please try again.',
  401: 'Incorrect email or password.',
  403: 'Your account has been deactivated. Please contact support.',
  429: 'Too many failed attempts. Please wait a few minutes and try again.',
};
const FALLBACK_ERROR = 'Sign-in failed. Please try again.';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    GoogleAuthButton
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  protected readonly uiTheme = inject(UiThemeService);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  getError(fieldName: 'email' | 'password'): string | null {
    const control: AbstractControl | null = this.form.get(fieldName);
    if (!control || !control.errors) return null;

    const messages = VALIDATION_MESSAGES[fieldName];
    const firstErrorKey = Object.keys(control.errors).find(key => key in messages);
    return firstErrorKey ? messages[firstErrorKey] : null;
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(SERVER_ERRORS[err.status] ?? err.error?.detail ?? FALLBACK_ERROR);
      }
    });
  }
}
