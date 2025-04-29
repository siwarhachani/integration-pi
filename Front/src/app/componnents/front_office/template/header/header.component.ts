import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { AuthService } from 'src/app/services/user/auth.service';

@Component({
  selector: 'app-header',
  standalone:true,
   imports: [
        HttpClientModule,
        CommonModule,
        RouterModule,
        FormsModule,
        
        NgChartsModule
      ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
 isLoggedIn: boolean = false;
  username: string | null = null;
  role: string | null = null;
  userPhotoUrl: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }


  ngOnInit() {
    this.authService.authStatus$.subscribe((status: boolean) => {
      this.isLoggedIn = status;
      if (this.isLoggedIn) {
        this.username = this.authService.getCurrentUserUsername();  // Replace with actual field in the token
        this.role = this.authService.getRole();          // Replace with actual field in the token
        this.userPhotoUrl = this.authService.getCurrentUserPicture();
      }

    });
  }

  logout() {
    this.authService.logout();
    this.username = null;
    this.role = null;
    this.router.navigate(['/login']);
  }
}
