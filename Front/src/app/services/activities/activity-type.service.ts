import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivityType } from 'src/app/models/activities/activityType.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityTypeService {

  

  
  private baseUrl = 'http://localhost:9090/api/activity-types'; // <- Adjust your backend URL if needed

  constructor(private http: HttpClient) { }

  // Create a new ActivityType
  createActivityType(activityType: ActivityType): Observable<ActivityType> {
    return this.http.post<ActivityType>(this.baseUrl, activityType);
  }

  // Get all ActivityTypes
  getAllActivityTypes(): Observable<ActivityType[]> {
    return this.http.get<ActivityType[]>(this.baseUrl);
  }

  // Get an ActivityType by ID
  getActivityTypeById(id: number): Observable<ActivityType> {
    return this.http.get<ActivityType>(`${this.baseUrl}/${id}`);
  }

  // Update an existing ActivityType
  updateActivityType(id: number, activityType: ActivityType): Observable<ActivityType> {
    return this.http.put<ActivityType>(`${this.baseUrl}/${id}`, activityType);
  }

  // Delete an ActivityType
  deleteActivityType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
