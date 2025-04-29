import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/services/user/notification.service';
import { Notification } from 'src/app/models/user/notification.interface';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    RouterModule,
    FormsModule,
    
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  dropdownOpen = false;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwtToken');
    let username: string | null = null;

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        username = payload.username;
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
        if (username) {
      this.notificationService.getNotifications(username).subscribe({
        next: (data) => this.notifications = data,
        error: (err) => console.error('Failed to load notifications:', err)
      });
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }
}
