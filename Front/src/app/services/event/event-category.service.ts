import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EventCategory {
  id?: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class EventCategoryService {
  private baseUrl = 'http://localhost:9090/api/eventCategories';

  constructor(private http: HttpClient) {}

  getEventCategories(): Observable<EventCategory[]> {
    return this.http.get<EventCategory[]>(this.baseUrl);
  }

  createEventCategory(category: EventCategory): Observable<EventCategory> {
    return this.http.post<EventCategory>(this.baseUrl, category);
  }

  updateEventCategory(id: number, category: EventCategory): Observable<EventCategory> {
    return this.http.put<EventCategory>(`${this.baseUrl}/${id}`, category);
  }

  deleteEventCategory(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }
}
