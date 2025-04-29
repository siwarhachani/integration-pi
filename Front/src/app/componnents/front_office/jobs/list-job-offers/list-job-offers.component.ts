import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { JobOffer } from 'src/app/models/jobs/JobOffer';
import { JobOfferService } from 'src/app/services/jobs/job-offer.service';
import * as bootstrap from 'bootstrap'; // <-- add this at the top
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { FooterComponent } from '../../template/footer/footer.component';
import { HeaderComponent } from '../../template/header/header.component';


@Component({
  selector: 'app-list-job-offers',
  standalone:true,
   imports: [
      HttpClientModule,
      CommonModule,
      RouterModule,
      FormsModule,
     NgxSliderModule,
     
    ],
  templateUrl: './list-job-offers.component.html',
  styleUrls: ['./list-job-offers.component.css']
})
export class ListJobOffersComponent {
  bootstrap: any;
  recommendedOffers: JobOffer[] = [];
  isShowingRecommendations: boolean = false;
  jobOffers: JobOffer[] = [];
  errorMessage: string = '';
  locationFilter: string = '';
  typeFilter: string = '';
  minSalary?: number;
  maxSalary?: number;
  filteredOffers: JobOffer[] = [];
  salaryRange: number[] = [0, 10000]; // [min, max]
  salaryRangeMax: number = 10000;
  salaryRangeMin: number=0;

  minValue: number = 50;
  maxValue: number = 200;
  options: Options = {
    floor: 0,
    ceil: 5000
  };

  constructor(private jobOfferService: JobOfferService, private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchJobOffers();
  }

  fetchJobOffers(): void {
    this.jobOfferService.getJobOffers().subscribe((data: JobOffer[]) => {
      this.jobOffers = data;//was this only
      //this.applyFilters(); // initialize filtered list new added
      console.log(this.jobOffers);
      // added :
      this.filteredOffers = [...this.jobOffers]; // initially, all offers

      // Dynamically set min and max based on data
      const salaries = this.jobOffers.map(o => parseFloat(o.remuneration?.toString() ?? '0'));
      this.minValue = Math.min(...salaries);
      this.maxValue = Math.max(...salaries);
  
      this.options = {
        floor: this.minValue,
        ceil: this.maxValue
      };


    });
  }



  cvText: string = '';
selectedCvFile: File | null = null;

openAiModal() {
  const modalElement = document.getElementById('aiModal');
  if (modalElement) {
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }
}

closeAiModal() {
  const modalElement = document.getElementById('aiModal');
  if (modalElement) {
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal?.hide();
  }
}

onCvFileSelected(event: any) {
  if (event.target.files.length > 0) {
    this.selectedCvFile = event.target.files[0];
  }
}
submitCvToAi() {
  const formData = new FormData();
  
  if (this.selectedCvFile) {
    formData.append('cvFile', this.selectedCvFile); // 💡 Important key name
  } else {
    alert('Please upload a file.');
    return;
  }

  this.http.post('http://localhost:9090/api/job-offers/recommend', formData).subscribe({
    next: (response: any) => {
      console.log(response);
      alert('Recommended jobs received! 🎯');
      
      this.recommendedOffers = response.recommended_jobs;
      this.isShowingRecommendations = true;
      this.closeAiModal();
    },
    error: (err: any) => {
      console.error(err);
      alert('Error sending CV to backend.');
    }
  });
}
goBackToAllOffers() {
  this.isShowingRecommendations = false;
}


applyFilters() {
  this.filteredOffers = this.jobOffers.filter((offer) => {
    const matchesLocation =
      !this.locationFilter ||
      (offer.location ?? '').toLowerCase().includes(this.locationFilter.toLowerCase());

    const matchesType =
      !this.typeFilter || offer.type === this.typeFilter;

    const salary = parseInt(offer.remuneration.toString(), 10);
    const matchesSalaryRange =
      salary >= this.minValue && salary <= this.maxValue;

    return matchesLocation && matchesType && matchesSalaryRange;
  });



}








}
