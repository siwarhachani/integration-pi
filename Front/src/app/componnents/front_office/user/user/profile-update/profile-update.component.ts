import { Component, OnInit } from '@angular/core';

import { Router, RouterModule } from '@angular/router';

import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { finalize } from 'rxjs/operators';
import { AuthService } from 'src/app/services/user/auth.service';
import { UserService } from 'src/app/services/user/user.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'ProfileUpdateComponent',
   standalone: true,
    imports: [
      HttpClientModule,
      CommonModule,
      RouterModule,
      FormsModule,
      ReactiveFormsModule,
     
    ],
  templateUrl: './profile-update.component.html',
  styleUrls: ['./profile-update.component.css']
})
export class ProfileUpdateComponent {
  profileForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: [authService.getCurrentUserUsername(), [Validators.required, Validators.minLength(2)]],
      birthdate: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]],
      // Remove profilePictureUrl from form as we'll handle it separately
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    if (file.size > 2 * 1024 * 1024) {
      this.errorMessage = "File size exceeds 2MB";
      return;
    }

    this.selectedFile = file;

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
    };
    reader.readAsDataURL(file);
  }

  clearProfilePicture() {
    this.previewUrl = null;
    this.selectedFile = null;
    const fileInput = document.getElementById('profilePictureFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      this.markFormAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();

    // Append profile data
    formData.append('profileData', JSON.stringify({
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      birthdate: this.profileForm.value.birthdate
    }));

    // Append file if selected
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.userService.updateProfileWithFile(
      this.profileForm.value,  // Profile data
      this.selectedFile        // Optional file
    ).subscribe({

      next: () => {
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => this.router.navigate(['/profile', '@' + this.authService.getCurrentUserUsername()]), 1500);
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.errorMessage = err.error?.message || 'Failed to update profile. Please try again.';
      }
    });
  }

  private markFormAsTouched() {
    Object.values(this.profileForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}
