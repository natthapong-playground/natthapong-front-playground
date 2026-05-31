import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role } from '../models/user.model';
import { JwtPayload, TokenResponse } from '../models/auth.model';
import { switchMap } from 'rxjs';

const TOKEN_KEY = 'access_token';

@Injectable({ providedIn: 'root' })

export class AuthService {

    private http = inject(HttpClient);
    private router = inject(Router);
    private readonly _token = signal<string | null>(this.readToken());

    readonly token = this._token.asReadonly();

    readonly isAuthenticated = computed(() => {
        const current_token = this._token();

        if (!current_token)
            return false;

        const payload = this.decodeToken(current_token);

        if (!payload?.exp)
            return false;

        return payload.exp * 1000 > Date.now();
    });

    readonly currentRole = computed<Role | null>(() => {
        const current_token = this._token();

        if (!current_token)
            return null;

        return (this.decodeToken(current_token)?.role as Role) ?? null;
    });

    login(email: string, password: string): Observable<TokenResponse> {
        const body = new URLSearchParams();

        body.set('username', email);
        body.set('password', password);

        const headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded'
        });

        return this.http.post<TokenResponse>(`${environment.apiUrl}/login`, body.toString(), { headers })
            .pipe(tap(res => this.saveToken(res.access_token)));
    }

    logout(): void {
        this.clearToken();
        this.router.navigate(['/login']);
    }

    register(email: string, password: string, role: Role = 'Regular'): Observable<TokenResponse> {
        return this.http
            .post(`${environment.apiUrl}/users/register`, { email, password, role })
            .pipe(switchMap(() => this.login(email, password)));
    }

    private saveToken(token: string): void {
        try {
            localStorage.setItem(TOKEN_KEY, token);
        } catch {
            /* no-op */
        }
        this._token.set(token);
    }

    private clearToken(): void {
        try {
            localStorage.removeItem(TOKEN_KEY);
        } catch {
            /* no-op */
        }
        this._token.set(null);
    }

    private readToken(): string | null {
        try {
            return localStorage.getItem(TOKEN_KEY);
        } catch {
            return null;
        }
    }

    private decodeToken(token: string): JwtPayload | null {
        try {
            // console.log(token)
            const part = token.split('.')[1];
            const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
            const padded = normalized + '==='.slice((normalized.length + 3) % 4);

            return JSON.parse(atob(padded));
        } catch {
            return null;
        }
    }


}