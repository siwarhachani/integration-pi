import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';

import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
@Component({
  selector: 'app-scheduleinterviewadmin',
   standalone:true,
     imports: [
        HttpClientModule,
        CommonModule,
        RouterModule,
        FormsModule,
       NgxSliderModule,
       FullCalendarModule
      ],
  templateUrl: './scheduleinterviewadmin.component.html',
  styleUrls: ['./scheduleinterviewadmin.component.css']
})
export class ScheduleinterviewadminComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() slotsSelected = new EventEmitter<any[]>();
  @Input() candidateEmail!: string;

  selectedSlots: any[] = [];
  selectedEvents: any[] = [];

  calendarOptions: CalendarOptions = {
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin],

    initialView: 'timeGridWeek',
    selectable: true,
    selectMirror: true,
    select: this.handleDateSelect.bind(this), // Callback on select
    unselectAuto: false,
    events: this.selectedEvents, // to display selected slots
    editable: false,
    nowIndicator: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridDay,timeGridWeek,dayGridMonth'
    }
    
  };
 constructor(private http: HttpClient

  ){}
  
  submitSlots() {
    const payload = {
      candidateEmail: this.candidateEmail,
      slots: this.selectedSlots.map(slot => {
        const localDate = new Date(slot.start);
        const adjusted = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000); // Fix timezone shift
        return adjusted.toISOString();
      })          };
    console.log("Payload being sent:", payload);
    this.http.post('http://localhost:9090/api/applications/confirm-slot', payload, { observe: 'response' })
    .subscribe({
      next: (response) => {
        if (response.status === 200) {
          alert('✅ Slots sent and email delivered to candidate!');
          this.slotsSelected.emit(this.selectedSlots); // Emit slots
          this.closeModal.emit(); // Close modal
        } else {
          alert(`⚠️ Server responded with status ${response.status}`);
        }
      },
      error: (error: any) => {
        console.error('❌ Error occurred while confirming slot:', error);
        const errorMsg = error?.error?.message || 'Something went wrong. Please try again.';
        alert(`❌ Failed to send slots.\n${errorMsg}`);
      }
    });
  
  }
  
  cancel() {
    this.closeModal.emit();
  }

  


handleDateSelect(selectInfo: any) {
  const calendarApi = selectInfo.view.calendar;
  calendarApi.unselect();

  const newSlot = {
    start: selectInfo.start,
    end: selectInfo.end,
    allDay: selectInfo.allDay
  };

  this.selectedSlots = [...this.selectedSlots, newSlot];

  const newEvent = {
    title: 'Available',
    start: selectInfo.start,
    end: selectInfo.end,
    allDay: selectInfo.allDay
  };

  this.selectedEvents = [...this.selectedEvents, newEvent];
  calendarApi.addEvent(newEvent);

  console.log('✅ Selected slots:', this.selectedSlots);
}


}
