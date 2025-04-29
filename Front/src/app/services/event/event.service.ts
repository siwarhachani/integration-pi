import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventCategory } from './event-category.service';

// ✅ Interface complète pour les événements
export interface Event {
  eventId?: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isVirtual: boolean;
  location?: string;
  category: EventCategory | null;
  distanceKm?: number;
}

@Injectable({ providedIn: 'root' })
export class EventService {

  private springUrl = 'http://localhost:9090/api/events';  // Backend Spring Boot
  private flaskUrl = 'http://localhost:5000';              // Backend Flask (AI only)

  constructor(private http: HttpClient) {}

  // ✅ CRUD
  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.springUrl);
  }

  create(event: Event): Observable<any> {
    return this.http.post<Event>(`${this.springUrl}`, event);
  }

  update(id: number, event: Event): Observable<Event> {
    return this.http.put<Event>(`${this.springUrl}/${id}`, event);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.springUrl}/${id}`, { responseType: 'text' });
  }

  // ✅ Participer à un événement
  subscribeToEvent(eventId: number, data: { username: string, email: string }): Observable<string> {
    return this.http.post(`${this.springUrl}/${eventId}/subscribe`, data, {
      responseType: 'text'
    });
  }

  // ✅ Recommandations AI (via Flask)
  getRecommendedEvents(userId: number): Observable<any> {
    return this.http.get(`${this.flaskUrl}/recommendations/${userId}`);
  }

  // ✅ Statistiques publiques
  getPublicStats(): Observable<any> {
    return this.http.get(`${this.springUrl}/public-stats`);
  }

  getMostPopularEvent(): Observable<Event> {
    return this.http.get<Event>(`${this.springUrl}/popular-event`);
  }

  getNextUpcomingEvent(): Observable<Event> {
    return this.http.get<Event>(`${this.springUrl}/next-upcoming-event`);
  }

  getEventsThisWeek(): Observable<number> {
    return this.http.get<number>(`${this.springUrl}/events-this-week`);
  }

  getMonthlyEventTrend(): Observable<{ [month: string]: number }> {
    return this.http.get<{ [month: string]: number }>(`${this.springUrl}/monthly-event-trend`);
  }

  // ✅ Distribution par catégorie (pie chart)
  getEventCategoryDistribution(): Observable<{ [category: string]: number }> {
    return this.http.get<{ [category: string]: number }>(`${this.springUrl}/public-stats`);
    // ⚠️: tu peux extraire eventsByCategory du JSON dans le .ts si besoin
  }
}
