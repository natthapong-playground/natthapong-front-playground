import { CanActivateFn, Router } from "@angular/router";
import { inject, Inject } from "@angular/core";
import { AuthService } from "../services/auth.service";

export const authGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    return auth.isAuthenticated() ? router.createUrlTree(['/profile']) : true;
};