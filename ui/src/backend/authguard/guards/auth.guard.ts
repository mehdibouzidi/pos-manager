import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../service/admin/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.checkIsLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }
  const requiredPrivileges = route.data['privileges'] as Array<string>;

  if (requiredPrivileges && !authService.hasRoles(requiredPrivileges)) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
