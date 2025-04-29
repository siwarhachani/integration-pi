import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from "@angular/router";
import { AuthService } from 'src/app/services/user/auth.service';


@Component({
  selector: 'app-resetpassword',
   standalone: true,
    imports: [
      HttpClientModule,
      CommonModule,
      RouterModule,
      FormsModule,
     
    ],
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.css']
})
export class ResetpasswordComponent {
  token: string = '';
  newPassword: string = '';
  isValid: boolean = false;
  confirmPassword: string = '';
  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router) {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    this.authService.validateResetToken(this.token).subscribe(() => {
      this.isValid = true;
    }, () => {
      alert('Invalid or expired token');
      this.router.navigate(['/forgot-password']);
    });
  }

  onSubmit() {
    if (this.newPassword == this.confirmPassword) {
      this.authService.resetPassword(this.token, this.newPassword).subscribe(() => {
        alert('Password reset successful');
        this.router.navigate(['/login']);
      }, error => alert('Error: ' + error.message));
    }

  }

}
