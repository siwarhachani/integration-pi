import { Component, Input } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { JobApplicationService } from 'src/app/services/jobs/job-application.service';
import { DomSanitizer } from '@angular/platform-browser';
import { JobOffer } from 'src/app/models/jobs/JobOffer';
import { JobOfferService } from 'src/app/services/jobs/job-offer.service';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/user/auth.service';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ScheduleinterviewadminComponent } from '../scheduleinterviewadmin/scheduleinterviewadmin.component';
@Component({
  selector: 'app-admin-dashlistapplications',
  standalone:true,
  imports: [
     HttpClientModule,
     CommonModule,
     RouterModule,
     FormsModule,
    NgxSliderModule,
    ScheduleinterviewadminComponent
    
   ],
  templateUrl: './admin-dashlistapplications.component.html',
  styleUrls: ['./admin-dashlistapplications.component.css']
})
export class AdminDashlistapplicationsComponent {



  jobApplications: any[] = [];
  showScheduleModal: boolean = false;

  isDropdownOpen = false;

  
// Add these variables:
currentPage: number = 1;
itemsPerPage: number = 5; // Change as needed
paginatedApplications: any[] = [];
totalPages: number[] = [];

isLoggedIn: boolean = false;
username: string | null = null;
role: string | null = null;
userPhotoUrl: string | null = null;
  constructor(private jobApplicationService: JobApplicationService,private cdRef: ChangeDetectorRef,private sanitizer: DomSanitizer,private jobOfferService: 
    JobOfferService,private authService: AuthService, private router: Router

  ) {


  }

  ngOnInit(): void {
    this.fetchJobApplications();
    this.cdRef.detectChanges(); // Manually trigger change detection
    this.updatePaginatedApplications();//added this
    //for logging out
    this.authService.authStatus$.subscribe((status: boolean) => {
      this.isLoggedIn = status;
      if (this.isLoggedIn) {
        this.username = this.authService.getCurrentUserUsername();  // Replace with actual field in the token
        this.role = this.authService.getRole();          // Replace with actual field in the token
        this.userPhotoUrl = this.authService.getCurrentUserPicture();
      }

    });

  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {
    this.authService.logout();
    this.username = null;
    this.role = null;
    this.router.navigate(['/login']);
  }
  onStatusChange(application: any): void {
    this.jobApplicationService.updateApplicationStatus(application.id, application.status).subscribe({
      next: () => {
        console.log(`Status updated to ${application.status}`);
        // You can add a success notification here if you want!
      },
      error: err => {
        console.error('Failed to update status', err);
      }
    });
  }
  
  
  
// i aded those 2 methods
  updatePaginatedApplications(): void {
    const total = Math.ceil(this.jobApplications.length / this.itemsPerPage);
    this.totalPages = Array.from({ length: total }, (_, i) => i + 1);

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedApplications = this.jobApplications.slice(start, end);
  }
  
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages.length) return;
    this.currentPage = page;
    this.updatePaginatedApplications();
  }





  fetchJobApplications(): void {
    this.jobApplicationService.getJobApplications().subscribe({
      next: (data: any[]) => {
        this.jobApplications = data;
        console.log("Fetched Applications:", this.jobApplications);

        this.updatePaginatedApplications();// i added this line
        

      },
      error: (error: any) => {
        console.error('Error fetching job applications:', error);
      }
    });
  }
// Method to return the color based on match percentage
getMatchScoreColor(matchPercentage: number): string {
  if (matchPercentage > 75) {
    return '#00ef38';  // Green
  } else if (matchPercentage >= 50) {
    return '#fdc221';  // Orange
  } else {
    return '#ff1f0f';  // Red
  }
}
viewCV(id: number): void {
  console.log("Fetching CV for ID:", id); //  Add this

  this.jobApplicationService.getCVById(id).subscribe(
    (blob: Blob) => {
      const file = new Blob([blob], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL); // open in new tab
      // OR download:
      // saveAs(file, "cv.pdf");
    },
    (error: any) => {
      console.error('Error fetching CV', error);
    }
  );
  
}


selectedCandidateEmail: string = '';
//here we are passing the email to the scheduleinterviewadmin

scheduleInterview(email: string) {
  this.selectedCandidateEmail = email;

  this.showScheduleModal = true;
  console.log("the email is,",this.selectedCandidateEmail);
}

closeScheduleModal() {
  this.showScheduleModal = false;
}

handleAdminSlots(slots: any[]) {
  console.log("Selected time slots by admin:", slots);
  // TODO: send to backend or trigger email logic
}



}
