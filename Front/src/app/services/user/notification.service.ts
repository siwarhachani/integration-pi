// notification.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Notification } from 'src/app/models/user/notification.interface';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = 'http://localhost:9090/api/direct-notifications';

  constructor(private http: HttpClient) {}

  getNotifications(username: string): Observable<Notification[]> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<Notification[]>(`${this.baseUrl}/${username}`, { headers });
  }
}
