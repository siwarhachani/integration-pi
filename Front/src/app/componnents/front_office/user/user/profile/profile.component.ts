import { Component, OnInit } from '@angular/core';
import {HttpClient, HttpClientModule, HttpHeaders} from "@angular/common/http";

import { ActivatedRoute, RouterModule } from "@angular/router";
import { AuthService } from 'src/app/services/user/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { HeaderComponent } from '../../../template/header/header.component';
import { FooterComponent } from '../../../template/footer/footer.component';

@Component({
  selector: 'app-profile',
   standalone: true,
    imports: [
      HttpClientModule,
      CommonModule,
      RouterModule,
      FormsModule,
      HeaderComponent,
      FooterComponent,
      NgChartsModule
    ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userProfile: any = {};
  isLoading: boolean = true;
  errorMessage: string = '';
  isOwner: boolean = false;
  profileUsername: string | null = null;

  private apiUrl = 'http://localhost:9090';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.profileUsername = params.get('username');
      if (this.profileUsername) {
        this.checkOwnership();
        this.loadUserProfile(this.profileUsername);
      }
    });
  }

  private checkOwnership(): void {
    if (!this.profileUsername) {
      this.isOwner = false;
      return;
    }

    // Add debug logs to help troubleshoot
    console.log('Profile username:', this.profileUsername);
    const currentUsername = this.authService.getCurrentUserUsername();
    console.log('Current username:', currentUsername);

    this.isOwner = this.authService.isCurrentUser(this.profileUsername);
    console.log('Is owner:', this.isOwner);
  }

  loadUserProfile(username: string) {
    this.isLoading = true;
    this.errorMessage = '';

    const token = this.authService.getToken();
    const headers: any = token ? { Authorization: `Bearer ${token}` } : {};

    this.http.get(`${this.apiUrl}/api/user/profile/${username}`, { headers })
      .subscribe({
        next: (response) => {
          this.userProfile = response;
          this.isLoading = false;
          // Check ownership again after profile loads in case of delays
          this.checkOwnership();
        },
        error: (err) => {
          console.error('Error loading profile', err);
          this.errorMessage = err.error?.message || 'Could not fetch the profile. It may not exist.';
          this.isLoading = false;
        }
      });
  }

  retryLoadProfile() {
    if (this.profileUsername) {
      this.loadUserProfile(this.profileUsername);
    }
  }

  deleteProfile(): void {
    const username = this.profileUsername;
    if (!username) return;

    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const url = `${this.apiUrl}/api/user/profile/delete/${username}`;
    this.http.delete(url, { headers }).subscribe({
      next: () => {
        alert('Your profile has been deleted.');
        this.authService.logout(); // optional: clear session, redirect, etc.
        window.location.href = '/'; // or use the Router to navigate elsewhere
      },
      error: (error) => {
        console.error('Failed to delete profile:', error);
        alert('Failed to delete your profile. Try again.');
      }
    });
  }
}
