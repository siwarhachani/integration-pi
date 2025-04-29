import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserProfile } from 'src/app/models/user/user-profile.model';
import { AuthService } from 'src/app/services/user/auth.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'ProfileUpdateComponent',
  templateUrl: './profile-update.component.html',
  styleUrls: ['./profile-update.component.css']
})
export class ProfileUpdateComponent implements OnInit {
  profileForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  user: UserProfile | undefined;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      birthdate: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]],
    });
  }

  ngOnInit(): void {
    const username = this.authService.getCurrentUserUsername();
    if (!username) {
      this.errorMessage = 'User not logged in.';
      return;
    }

    this.isLoading = true;

    this.userService.searchUserByUsername(username).subscribe({
      next: (userProfile) => {
        this.user = userProfile;
        this.profileForm.patchValue({
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          birthdate: userProfile.birthdate,
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load profile.';
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    if (file.size > 2 * 1024 * 1024) { // 2MB max
      this.errorMessage = "File size exceeds 2MB.";
      return;
    }

    this.selectedFile = file;

    // Preview the selected image
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
    };
    reader.readAsDataURL(file);
  }

  clearProfilePicture(): void {
    this.previewUrl = null;
    this.selectedFile = null;
    const fileInput = document.getElementById('profilePictureFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.markFormAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();
    formData.append('profileData', JSON.stringify(this.profileForm.value));

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.userService.updateProfileWithFile(
      this.profileForm.value,
      this.selectedFile
    ).subscribe({
      next: () => {
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => {
          const username = this.authService.getCurrentUserUsername();
          if (username) {
            this.router.navigate(['/profile', '@' + username]);
          }
        }, 1500);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.errorMessage = err.error?.message || 'Failed to update profile. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private markFormAsTouched(): void {
    Object.values(this.profileForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}
