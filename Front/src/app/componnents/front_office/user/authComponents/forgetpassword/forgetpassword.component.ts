import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {Router, RouterModule} from "@angular/router";
import { NgChartsModule } from 'ng2-charts';
import { AuthService } from 'src/app/services/user/auth.service';
import { FooterComponent } from '../../../template/footer/footer.component';
import { HeaderComponent } from '../../../template/header/header.component';

@Component({
  selector: 'app-forgetpassword',
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
  templateUrl: './forgetpassword.component.html',
  styleUrls: ['./forgetpassword.component.css']
})
export class ForgetpasswordComponent {

  email: string = '';
  errorMessage: string = '';
  constructor(private authService: AuthService, private router: Router) {}

  submit() {
    this.errorMessage = ''; // Clear previous errors

    this.authService.forgotPassword(this.email).subscribe(
      () => {
        this.router.navigate(['/login']);
      },
      error => {
        this.errorMessage = error.error?.message || 'Email not found. Please try again.';
      }
    );
  }


}
