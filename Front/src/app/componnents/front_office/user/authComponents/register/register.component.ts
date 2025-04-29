import { Component } from '@angular/core';

import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { FooterComponent } from '../../../template/footer/footer.component';
import { HeaderComponent } from '../../../template/header/header.component';
import { AuthService } from 'src/app/services/user/auth.service';

@Component({
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username = '';
  password = '';
  email = '';
  firstName = '';  // New field
  lastName = '';   // New field
  birthdate: Date = new Date();  // New field (Date type)
  role = 'USER';
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(
      this.username,
      this.email,
      this.password,
      this.firstName, // Include firstName
      this.lastName,  // Include lastName
      this.birthdate, // Include birthdate
      this.role
    ).subscribe(
      response => {
        if (response.status === 200) {  // ✅ Check HTTP status code
          this.successMessage = 'Registration successful! Redirecting to the login page...';
          setTimeout(() => this.router.navigate(['/login']), 3000);
        } else {
          this.errorMessage = 'Unexpected response from server.';
        }
      },
      error => {
        console.error('Registration error:', error);
        this.errorMessage = error.error ? error.error.message : 'Registration failed!';
      }
    );
  }
}
