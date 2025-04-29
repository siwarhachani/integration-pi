import { Component, OnInit } from '@angular/core';
import { EventService, Event } from 'src/app/services/event/event.service';
import { EventCategory, EventCategoryService } from 'src/app/services/event/event-category.service';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SmartPlannerComponent } from '../smart-planner/smart-planner.component';
declare var bootstrap: any;


@Component({
  selector: 'app-event',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule, RouterModule, SmartPlannerComponent],
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {
  events: Event[] = [];
  categories: EventCategory[] = [];

  newEvent: Event = {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    category: null,
    isVirtual: false,
    location: ''
  };

  selectedEvent: Event = {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    category: null,
    isVirtual: false,
    location: ''
  };

  isEditing = false;
  errorMessage: string = '';
  modal: any;

  constructor(
    private eventService: EventService,
    private categoryService: EventCategoryService
  ) {}

  ngOnInit(): void {
    this.getAllEvents();
    this.getAllCategories();
  }

  getAllEvents(): void {
    this.eventService.getEvents().subscribe((data: Event[]) => {
      this.events = data;
    });
  }

  getAllCategories(): void {
    this.categoryService.getEventCategories().subscribe((categories: EventCategory[]) => {
      this.categories = categories;
    });
  }

  addEvent(): void {
    if (!this.validateEvent(this.newEvent)) return;

    const payload: Event = {
      ...this.newEvent,
      category: { id: this.newEvent.category!.id, name: '' }
    };

    this.eventService.create(payload).subscribe(() => {
      this.getAllEvents();
      this.resetForm();
      this.closeAddEventModal();
    });
  }

  editEvent(ev: Event): void {
    this.selectedEvent = JSON.parse(JSON.stringify(ev));
    this.isEditing = true;
    this.errorMessage = '';
  }

  updateEvent(): void {
    if (!this.validateEvent(this.selectedEvent)) return;

    const payload: Event = {
      ...this.selectedEvent,
      category: { id: this.selectedEvent.category!.id, name: '' }
    };

    this.eventService.update(this.selectedEvent.eventId!, payload).subscribe(() => {
      this.getAllEvents();
      this.cancelEdit();
    });
  }

  deleteEvent(id: number): void {
    this.eventService.delete(id).subscribe(() => {
      this.getAllEvents();
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newEvent = {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      category: null,
      isVirtual: false,
      location: ''
    };
    this.errorMessage = '';
  }

  validateEvent(event: Event): boolean {
    const today = new Date().toISOString().split('T')[0];

    if (!event.title.trim()) {
      this.errorMessage = 'Title is required';
      return false;
    }
    if (event.title.length > 30) {
      this.errorMessage = 'Title must be less than 30 characters';
      return false;
    }
    if (!event.description.trim()) {
      this.errorMessage = 'Description is required';
      return false;
    }
    if (event.description.length > 50) {
      this.errorMessage = 'Description must be less than 30 characters';
      return false;
    }
    if (!event.startDate || !event.endDate) {
      this.errorMessage = 'Start date and end date are required';
      return false;
    }
    if (event.startDate < today) {
      this.errorMessage = 'Start date must be today or in the future';
      return false;
    }
    if (new Date(event.startDate) > new Date(event.endDate)) {
      this.errorMessage = 'Start date must be before end date';
      return false;
    }
    if (!event.category || !event.category.id) {
      this.errorMessage = 'Category is required';
      return false;
    }
    if (!event.isVirtual && (!event.location || !event.location.trim())) {
      this.errorMessage = 'Location is required';
      return false;
    }
    if (!event.isVirtual && event.location!.length > 30) {
      this.errorMessage = 'Location must be less than 30 characters';
      return false;
    }

    this.errorMessage = '';
    return true;
  }

  openAddEventModal(): void {
    this.resetForm();
    this.modal = new bootstrap.Modal(document.getElementById('addEventModal'));
    this.modal.show();
  }

  closeAddEventModal(): void {
    this.modal.hide();
  }
}
