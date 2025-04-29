import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { JobOffer } from 'src/app/models/jobs/JobOffer';

@Injectable({
  providedIn: 'root'
})
export class JobOfferService {
  

  private apiUrl = 'http://localhost:9090/api/job-offers';

  constructor(private http: HttpClient) { }

  // Get all job offers
  getJobOffers(): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(this.apiUrl);
  }

  // Create a new job offer
  createJobOffer(jobOffer: JobOffer): Observable<JobOffer> {
    return this.http.post<JobOffer>(this.apiUrl, jobOffer);
  }

  //update
   // Update an existing job offer
   updateJobOffer(id: number, jobOffer: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, jobOffer);
  }

  // Delete a job offer
  deleteJobOffer(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }


 
  

}
