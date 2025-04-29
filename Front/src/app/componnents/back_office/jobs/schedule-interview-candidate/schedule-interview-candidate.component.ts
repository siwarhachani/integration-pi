import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-schedule-interview-candidate',
  standalone:true,
  imports: [
     HttpClientModule,
     CommonModule,
     RouterModule,
     FormsModule,
    NgxSliderModule,
    
   ],
  templateUrl: './schedule-interview-candidate.component.html',
  styleUrls: ['./schedule-interview-candidate.component.css']
})
export class ScheduleInterviewCandidateComponent  {

}
