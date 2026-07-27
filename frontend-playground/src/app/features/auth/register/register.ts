import { Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AuthService } from '../../../core/services/auth.service';
import { UiThemeService } from '../../../core/services/ui-theme.service';
import { GoogleAuthButton } from '../google-auth-button/google-auth-button';

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  if (!password || !confirm) return null;
  return password === confirm ? null : { mismatch: true };
}

const VALIDATION_MESSAGES: Record<string, Record<string, string>> = {
  email: {
    required: 'Email is required.',
    email: 'Enter a valid email address.'
  },
  password: {
    required: 'Password is required.',
    minlength: 'Password must be at least 8 characters.'
  },
  confirmPassword: {
    required: 'Please confirm your password.',
    mismatch: "Passwords don't match."
  }
};

const SERVER_ERRORS: Record<number, string> = {
  0: 'Cannot reach the server. Please try again.',
  400: 'That email is already registered.',
  422: 'Please check your details and try again.'
};
const FALLBACK_ERROR = 'Registration failed. Please try again.';

interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: 'primary' | 'accent' | 'warn';
  percent: number;
}

const STRENGTH_LEVELS: Record<number, PasswordStrength> = {
  0: { score: 0, label: 'Weak',   color: 'warn',    percent: 25 },
  1: { score: 1, label: 'Weak',   color: 'warn',    percent: 25 },
  2: { score: 2, label: 'Fair',   color: 'accent',  percent: 50 },
  3: { score: 3, label: 'Good',   color: 'primary', percent: 75 },
  4: { score: 4, label: 'Strong', color: 'primary', percent: 100 }
};

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    GoogleAuthButton
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  protected readonly uiTheme = inject(UiThemeService);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  private readonly passwordValue = signal('');

  protected readonly form = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordsMatchValidator }
  );

  constructor() {
    this.form.controls.password.valueChanges.subscribe(v =>
      this.passwordValue.set(v ?? '')
    );
  }

  protected readonly strength = computed<PasswordStrength>(() => {
    const pwd = this.passwordValue();
    if (pwd.length < 8) {
      return { score: 0, label: 'Too short', color: 'warn', percent: 10 };
    }
    let score = 0;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd) || pwd.length >= 12) score++;
    const clamped = Math.min(4, score);
    return STRENGTH_LEVELS[clamped];
  });

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  getError(fieldName: 'email' | 'password' | 'confirmPassword'): string | null {
    const control: AbstractControl | null = this.form.get(fieldName);
    if (!control) return null;

    const messages = VALIDATION_MESSAGES[fieldName];

    if (
      fieldName === 'confirmPassword' &&
      this.form.hasError('mismatch') &&
      control.touched &&
      !control.hasError('required')
    ) {
      return messages['mismatch'];
    }

    if (!control.errors) return null;

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
    this.auth.register(email, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          SERVER_ERRORS[err.status] ?? err.error?.detail ?? FALLBACK_ERROR
        );
      }
    });
  }
}
