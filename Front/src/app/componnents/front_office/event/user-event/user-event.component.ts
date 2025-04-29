import { Component, OnInit } from '@angular/core';
import { EventService, Event as MyEvent } from 'src/app/services/event/event.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from 'src/app/componnents/front_office/template/header/header.component';
import { FooterComponent } from 'src/app/componnents/front_office/template/footer/footer.component';
import { EventTranslatorComponent } from '../event-translator/event-translator.component';
import { AuthService } from 'src/app/services/user/auth.service';



declare var bootstrap: any;



@Component({
  selector: 'app-user-event',
  standalone: true,
  templateUrl: './user-event.component.html',
  styleUrls: ['./user-event.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    EventTranslatorComponent
   
  ]
})
export class UserEventComponent implements OnInit {
  selectedLang: string = 'fr';


  events: MyEvent[] = [];
  recommendedEvents: MyEvent[] = [];

  searchTerm = '';
  filterType: 'all' | 'virtual' | 'physical' = 'all';
  currentPage = 1;
  itemsPerPage = 5;

  selectedEventId: number | null = null;
  selectedEventTitle = '';
  formData = { username: '', email: '' };
  responseMessage = '';
  modal: any;

  userId? :number; // à remplacer plus tard par l'user connecté
  publicStats: any;

  constructor(private eventService: EventService, private auth:AuthService) {}

  ngOnInit(): void {
    this.loadEvents();
    this.loadPublicStats();
    
    console.log(this.auth.getCurrentUserUsername());
  
    this.auth.getUserIdByCurrentUsername().subscribe({
      next: (id) => {
        this.userId = id;
        console.log('User ID: ', this.userId);
  
        if (this.userId) {
          this.loadRecommendedEvents();
        }
      },
      error: (err) => {
        console.error('Failed to load user ID', err);
      }
    });
  }
  
  

  loadEvents(): void {
    this.eventService.getEvents().subscribe(events => {
      this.events = events;
    });
    console.log('User ID :', this.userId);
  }

  loadRecommendedEvents(): void {
    this.eventService.getRecommendedEvents(this.userId!).subscribe({
      next: (data: any) => {
        console.log("Recommended Events = ", data);
        this.recommendedEvents = data.map((ev: any) => ({
          eventId: ev.event_id,
          title: ev.title,
          description: "Recommended for you!",
          location: ev.location,
          category: { id: 0, name: ev.category },
          isVirtual: false,
          startDate: '',
          endDate: '',
          distanceKm: ev.distance_km
        }));
      },
      error: (err) => {
        console.error('Erreur lors du chargement des recommandations:', err);
      }
    });
  }
  

  get filteredEvents(): MyEvent[] {
    const today = new Date().toISOString().split('T')[0];
    return this.events.filter(ev => {
      const isFutureEvent = ev.endDate >= today;
      const matchSearch = ev.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        ev.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchFilter =
        this.filterType === 'all' ||
        (this.filterType === 'virtual' && ev.isVirtual) ||
        (this.filterType === 'physical' && !ev.isVirtual);
      return isFutureEvent && matchSearch && matchFilter;
    });
  }

  get paginatedEvents(): MyEvent[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredEvents.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredEvents.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  setFilter(type: 'all' | 'virtual' | 'physical') {
    this.filterType = type;
    this.currentPage = 1;
  }

  openParticipationModal(ev: MyEvent) {
    this.selectedEventId = ev.eventId!;
    this.selectedEventTitle = ev.title;
    this.formData = { username: '', email: '' };
    this.responseMessage = '';
    this.modal = new bootstrap.Modal(document.getElementById('participationModal'));
    this.modal.show();
  }

  closeModal() {
    this.modal.hide();
  }

  submitParticipation() {
    if (!this.selectedEventId || !this.formData.username.trim() || !this.formData.email.trim()) {
      this.responseMessage = 'Please fill all fields.';
      return;
    }

    this.eventService.subscribeToEvent(this.selectedEventId, this.formData).subscribe({
      next: (res: string) => {
        this.responseMessage = res;
        setTimeout(() => this.closeModal(), 2000);
      },
      error: (err) => {
        this.responseMessage = err.error || 'Subscription failed.';
      }
    });
  }

  //i added these publicStats: any = {};


// Ajoute cette méthode pour récupérer les statistiques publiques depuis le backend
loadPublicStats(): void {
  this.eventService.getPublicStats().subscribe({
    next: (stats: any) => {
      console.log("📊 Public Stats:", stats);
      this.publicStats = stats;
    },
    error: (err) => {
      console.error('Erreur lors du chargement des statistiques publiques:', err);
    }
  });
}

}
