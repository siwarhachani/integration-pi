import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { JobOffer } from 'src/app/models/jobs/JobOffer';
import { JobOfferService } from 'src/app/services/jobs/job-offer.service';
import { ChangeDetectorRef } from '@angular/core';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-crud-job-offers',
  standalone:true,
  imports: [
     HttpClientModule,
     CommonModule,
     RouterModule,
     FormsModule,
    NgxSliderModule,
    ReactiveFormsModule
   ],
  templateUrl: './admin-crud-job-offers.component.html',
  styleUrls: ['./admin-crud-job-offers.component.css']
})
export class AdminCrudJobOffersComponent implements OnInit {

  jobOffers: any[] = [];
  newJobOffer = { title: '', description: '', company: 'WellU', location: '', status: 'Open' , keywords:'', remuneration:0,type:''};
  editingJobOffer: any = null;
  addingJobOffer: boolean = false;  // Initially hidden
  selectedOffer: JobOffer | null = null;
 jobForm: FormGroup;
 editJobForm!: FormGroup;

  
// Add these variables:
currentPage: number = 1;
itemsPerPage: number = 5; // Change as needed
paginatedjobOffers: any[] = [];
totalPages: number[] = [];


  constructor(private jobOfferService: JobOfferService,private cdRef: ChangeDetectorRef) {
    // Initialisation du formulaire avec FormGroup et FormControl
    const lettersOnly = Validators.pattern(/^[A-Za-zÀ-ÿ\s]+$/);

    // Form for adding a new job offer
     this.jobForm = new FormGroup({ title: new FormControl('',
       [ Validators.required, Validators.minLength(4), lettersOnly ]),
       description: new FormControl('', [Validators.required,lettersOnly]), 
         location: new FormControl('', [ Validators.required, lettersOnly ]), 
         type: new FormControl('', [ Validators.required, lettersOnly ]), 
         remuneration: new FormControl('', [Validators.required, Validators.min(0)]),
         status: new FormControl('', Validators.required), keywords: new FormControl('', Validators.required) });
    
    // Form for editing an existing job offer
     this.editJobForm = new FormGroup({ title: new FormControl('', [ Validators.required, Validators.minLength(4), lettersOnly ]),
       description: new FormControl('', [Validators.required,lettersOnly]), 
       company: new FormControl('', [ Validators.required, lettersOnly ]), 
       location: new FormControl('', [ Validators.required, lettersOnly ]), 
       type: new FormControl('', [ Validators.required, lettersOnly ]), 
    
       remuneration: new FormControl('', [Validators.required, Validators.min(0)]),
       status: new FormControl('', Validators.required) }); 
    
  }

  ngOnInit(): void {
    this.loadJobOffers();
    this.cdRef.detectChanges(); // Manually trigger change detection

    this.updatePaginatedApplications();//added this

  }






  
  // Load all job offers
  loadJobOffers(): void {
    this.jobOfferService.getJobOffers().subscribe((data) => {
      this.jobOffers = data;
      this.updatePaginatedApplications();// i added this line

    });
  }
  // Add a job offer
  addJobOffer(): void {
    if (this.jobForm.valid) {
      const formValue = this.jobForm.value;
      const newOffer = {
        ...formValue,
        company: 'WellU' // Add static company value if needed
      };
  
      this.jobOfferService.createJobOffer(newOffer).subscribe(() => {
        this.loadJobOffers();
        this.jobForm.reset(); // Reset the form after submission
        this.addingJobOffer = false; // Optionally close the form
      });
    }
  }
  

  toggleAddForm() {
    this.addingJobOffer = !this.addingJobOffer; // Toggle visibility

    }
  // Set a job offer for editing
  editJobOffer(jobOffer: any): void {
    this.editingJobOffer = jobOffer;
    // Populate the edit form with the selected job offer details
    this.editJobForm.patchValue({
      title: jobOffer.title,
      description: jobOffer.description,
      company: 'WellU',
      location: jobOffer.location,
      status: jobOffer.status,
      remuneration:jobOffer.remuneration,
      type:jobOffer.type
    });
  }

  // Update job offer
  updateJobOffer(): void {
    if (this.editJobForm.valid && this.editingJobOffer) {
      const updatedJobOffer = { ...this.editingJobOffer, ...this.editJobForm.value };
      this.jobOfferService.updateJobOffer(this.editingJobOffer.id, updatedJobOffer).subscribe(() => {
        this.loadJobOffers();
        this.editingJobOffer = null;
      });
    }
  }

  // Delete a job offer
  deleteJobOffer(id: number): void {
    if (confirm('Are you sure you want to delete this job offer?')) {
      this.jobOfferService.deleteJobOffer(id).subscribe(() => {
        this.loadJobOffers();
      });
    }
  }


  selectJobOffer(offer: JobOffer) {
    this.selectedOffer = { ...offer };
  }



  updatePaginatedApplications(): void {
    const total = Math.ceil(this.jobOffers.length / this.itemsPerPage);
    this.totalPages = Array.from({ length: total }, (_, i) => i + 1);

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedjobOffers = this.jobOffers.slice(start, end);
  }
  
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages.length) return;
    this.currentPage = page;
    this.updatePaginatedApplications();
  }
}
