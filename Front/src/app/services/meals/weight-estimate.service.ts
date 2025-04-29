import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeightEstimateService {
  private apiUrl = 'http://localhost:9090/weight-estimate'; // Adjust URL as needed

  constructor(private http: HttpClient) {}

  // Send calories consumed and user info to the backend for weight estimation
 
  estimateWeightChange(body: any): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/estimate`, body);
  }
  
  getBMR(userId: number) {
    return this.http.get<number>(`${this.apiUrl}/bmr/${userId}`);
  }
  
  getTDEE(userId: number) {
    return this.http.get<number>(`${this.apiUrl}/tdee/${userId}`);
  }
  
  getBMI(userId: number) {
    return this.http.get<number>(`${this.apiUrl}/bmi/${userId}`);
  }
  getIdealWeight(userId: number) {
    return this.http.get<number>(`${this.apiUrl}/ideal-weight/${userId}`);
  }



  getBodyFatPercentage(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/body-fat/${userId}`);
  }

  getMuscleMass(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/muscle-mass/${userId}`);
  }

  getBoneMass(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/bone-mass/${userId}`);
  }

  getWaterPercentage(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/water-percentage/${userId}`);
  }

  getWaterMass(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/water-mass/${userId}`);
  }
  
  
  
}
