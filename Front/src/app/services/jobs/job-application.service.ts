import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { JobApplication } from 'src/app/models/jobs/JobApplication';


@Injectable({
  providedIn: 'root'
})
export class JobApplicationService {
  private apiUrl = 'http://localhost:9090/api/applications';

  constructor(private http: HttpClient) { }
 // Add a new job application
 applyForJob(jobApplication: FormData): Observable<any> {
  return this.http.post(`${this.apiUrl}/create`, jobApplication);
}
getJobApplications(): Observable<any[]> {
  return this.http.get<JobApplication[]>(`${this.apiUrl}`);
}
getCVById(id: number): any {
  return this.http.get(`${this.apiUrl}/cv/${id}`, { responseType: 'blob' });
}
updateApplicationStatus(id: number, status: string) {
  return this.http.put(`${this.apiUrl}/${id}/status`, { status });
}
}
