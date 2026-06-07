import { CanActivateFn, Router } from "@angular/router";
import { inject, Inject } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { Role } from "../models/user.model";

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

export const roleGuard = (...roles: Role[]): CanActivateFn => () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated())
        return router.createUrlTree(['/login']);

    const role = auth.currentRole();
    return role && roles.includes(role) ? true : router.createUrlTree(['/profile']);
};