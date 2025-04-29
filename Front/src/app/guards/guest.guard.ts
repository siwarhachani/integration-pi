import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/user/auth.service';

@Injectable({
  providedIn: 'root'
})
export class guestGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      // Redirect authenticated users to the dashboard
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
