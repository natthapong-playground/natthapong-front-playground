import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, finalize, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role } from '../models/user.model';
import { JwtPayload, TokenResponse } from '../models/auth.model';
import { switchMap } from 'rxjs';

const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

@Injectable({ providedIn: 'root' })

export class AuthService {

    private http = inject(HttpClient);
    private router = inject(Router);
    private readonly _token = signal<string | null>(this.readToken());

    // A single in-flight refresh shared by every request that hit 401 at once.
    private refresh$: Observable<TokenResponse> | null = null;

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
            .pipe(tap(res => this.saveTokens(res)));
    }

    /**
     * Swap the stored refresh token for a fresh access+refresh pair. Concurrent
     * callers share one round-trip; the backend rotates (revokes) the old refresh
     * token, so this works at most once per stored token.
     */
    refreshToken(): Observable<TokenResponse> {
        const refresh_token = this.readRefreshToken();
        if (!refresh_token) {
            return throwError(() => new Error('No refresh token available'));
        }

        if (!this.refresh$) {
            this.refresh$ = this.http
                .post<TokenResponse>(`${environment.apiUrl}/refresh-token`, { refresh_token })
                .pipe(
                    tap(res => this.saveTokens(res)),
                    finalize(() => { this.refresh$ = null; }),
                    shareReplay(1)
                );
        }

        return this.refresh$;
    }

    logout(): void {
        const token = this._token();
        const refresh_token = this.readRefreshToken();
        this.clearTokens();
        this.router.navigate(['/login']);
        if (token) {
            const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
            // Send the refresh token too so the server revokes the whole session.
            const body = refresh_token ? { refresh_token } : null;
            this.http.post(`${environment.apiUrl}/logout`, body, { headers })
                .subscribe({ next: () => { }, error: () => { } });
        }
    }

    register(email: string, password: string, role: Role = 'Regular'): Observable<TokenResponse> {
        return this.http
            .post(`${environment.apiUrl}/users/register`, { email, password, role })
            .pipe(switchMap(() => this.login(email, password)));
    }

    private saveTokens(res: TokenResponse): void {
        try {
            localStorage.setItem(TOKEN_KEY, res.access_token);
            localStorage.setItem(REFRESH_KEY, res.refresh_token);
        } catch {
            /* no-op */
        }
        this._token.set(res.access_token);
    }

    private clearTokens(): void {
        try {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_KEY);
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

    private readRefreshToken(): string | null {
        try {
            return localStorage.getItem(REFRESH_KEY);
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
