import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';

import { Router } from '@angular/router';
import { AuthService } from '../services/user/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get the user's role from the decoded JWT token
  const userRole = authService.getRole();
  const requiredRole = route.data['role'];

  console.log("User Role:", userRole);
  console.log("Required Role:", requiredRole);

  if (userRole && requiredRole) {
    if (userRole === requiredRole) {
      return true; // Allow access if roles match
    } else {
      router.navigate(['/not-authorized']);
      return false;
    }
  }

  // If no valid role, redirect to login
  router.navigate(['/login']);
  return false;
};
