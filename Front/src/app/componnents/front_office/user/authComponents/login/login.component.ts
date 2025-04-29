import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthResponseDTO } from 'src/app/models/user/auth-response.dto';
import { AuthService } from 'src/app/services/user/auth.service';
import { HeaderComponent } from '../../../template/header/header.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';



@Component({
  selector: 'app-login',
   standalone: true,
    imports: [
      HttpClientModule,
      CommonModule,
      RouterModule,
      FormsModule,
    HeaderComponent,
      
    ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    this.errorMessage = '';  // Reset error message on each attempt
  
    this.authService.login(this.username, this.password).subscribe({
      next: (response: AuthResponseDTO) => {
        this.authService.saveToken(response.token);
  
        const role = this.authService.getRole();
        if (role === 'USER') {
          this.router.navigate(['/home']);
        } else {
          this.router.navigate(['/Back']);
        }
      },
      error: (error) => {
        // Check if the error message is from the banned user case
        if (error.message === 'Your account is banned.') {
          this.errorMessage = 'Your account has been banned. Please contact support.';
        } else {
          this.errorMessage = 'Login failed! Check your credentials.';
        }
      }
    });
  }
  


}
