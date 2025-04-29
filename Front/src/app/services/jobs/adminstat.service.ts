import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminstatService {


  private apiUrl = 'http://localhost:9090/api/admin-stat';
  constructor(private http: HttpClient) { }
  getStats() {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }
 

  predictCompanyGrowth() {
    return this.http.get<any>(`${this.apiUrl}/application-trend-prediction`);
 }
 

}
