import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Endpoints whose own 401 means "bad credentials / dead refresh token", not
// "access token expired" — so we must NOT try to refresh-and-retry them.
const AUTH_ENDPOINTS = ['/login', '/refresh-token', '/users/register'];

function isAuthEndpoint(url: string): boolean {
  return AUTH_ENDPOINTS.some(path => url.includes(path));
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      const canRecover = err.status === 401 && !!token && !isAuthEndpoint(req.url);

      if (canRecover) {
        // Access token likely expired: silently refresh, then retry the request once.
        return auth.refreshToken().pipe(
          switchMap(res =>
            next(req.clone({ setHeaders: { Authorization: `Bearer ${res.access_token}` } }))
          ),
          catchError(refreshErr => {
            // Refresh failed (or the retry still 401'd) -> the session is over.
            auth.logout();
            return throwError(() => refreshErr);
          })
        );
      }

      // A 401 straight from an auth endpoint means the session can't be saved.
      if (err.status === 401 && token) {
        auth.logout();
      }
      return throwError(() => err);
    })
  );
};
