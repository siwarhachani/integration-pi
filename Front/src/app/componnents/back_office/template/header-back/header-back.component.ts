import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HomeComponent } from 'src/app/componnents/front_office/template/home/home.component';
import { AuthService } from 'src/app/services/user/auth.service';
import { HomeBackComponent } from '../home-back/home-back.component';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-back',
  standalone:true,
  imports:[
    HomeBackComponent,
    CommonModule,
    RouterLink,
    
    
  ],
  templateUrl: './header-back.component.html',
  styleUrls: ['./header-back.component.css']
})
export class HeaderBackComponent {
  
 
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
