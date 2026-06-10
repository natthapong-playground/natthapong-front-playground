import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/guards/auth.guard';
export const routes: Routes = [
    {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
    }, {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
    }, {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () => import('./features/dashboard/profile/profile').then(m => m.Profile)
    }, {
        path: 'audit-logs',
        canActivate: [authGuard, roleGuard('SuperAdmin')],
        loadComponent: () => import('./features/dashboard/audit-logs/audit-logs').then(m => m.AuditLogs)
    }, {
        path: 'world-clock',
        canActivate: [authGuard],
        loadComponent: () => import('./features/dashboard/world-clock/world-clock-page/world-clock-page').then(m => m.WorldClockPage)
    }, {
        path: '',
        pathMatch: 'full',
        redirectTo: 'profile'
    }, {
        path: '**',
        redirectTo: 'profile'
    }






];
