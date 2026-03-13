import { Routes } from '@angular/router';
import { authGuard } from '../backend/authguard/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'pos',
    loadComponent: () => import('./pos/pos.component').then(m => m.PosComponent),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'pos',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'pos'
  }
];
