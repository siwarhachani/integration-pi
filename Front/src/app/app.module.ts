import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HomeComponent } from './componnents/front_office/template/home/home.component';


import { FooterComponent } from './componnents/front_office/template/footer/footer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HomeBackComponent } from './componnents/back_office/template/home-back/home-back.component';
import { HeaderBackComponent } from './componnents/back_office/template/header-back/header-back.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { NotAuthorizedComponent } from './componnents/front_office/user/authComponents/not-authorized/not-authorized.component';
import { HeaderComponent } from './componnents/front_office/template/header/header.component';
import { AdminCrudJobOffersComponent } from './componnents/back_office/jobs/admin-crud-job-offers/admin-crud-job-offers.component';
import { AdminDashlistapplicationsComponent } from './componnents/back_office/jobs/admin-dashlistapplications/admin-dashlistapplications.component';
import { AdminStatsComponent } from './componnents/back_office/jobs/admin-stats/admin-stats.component';
import { ScheduleInterviewCandidateComponent } from './componnents/back_office/jobs/schedule-interview-candidate/schedule-interview-candidate.component';
import { ScheduleinterviewadminComponent } from './componnents/back_office/jobs/scheduleinterviewadmin/scheduleinterviewadmin.component';
import { ApplyJobComponent } from './componnents/front_office/jobs/apply-job/apply-job.component';
import { ListJobOffersComponent } from './componnents/front_office/jobs/list-job-offers/list-job-offers.component';
import { ForgetpasswordComponent } from './componnents/front_office/user/authComponents/forgetpassword/forgetpassword.component';
import { LoginComponent } from './componnents/front_office/user/authComponents/login/login.component';
import { RegisterComponent } from './componnents/front_office/user/authComponents/register/register.component';
import { ResetpasswordComponent } from './componnents/front_office/user/authComponents/resetpassword/resetpassword.component';
import { ProfileUpdateComponent } from './componnents/front_office/user/user/profile-update/profile-update.component';
import { ProfileComponent } from './componnents/front_office/user/user/profile/profile.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgChartsModule } from 'ng2-charts';
import { AddPostComponent } from './componnents/front_office/posts/add-post/add-post.component';
import { PostListComponent } from './componnents/front_office/posts/post-list/post-list.component';
import { NotificationsComponent } from './componnents/front_office/user/notifications/notifications.component';



@NgModule({
  declarations: [
    
   AppComponent
    
    
   
  
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterLink,
    AppRoutingModule,
    HttpClientModule,
    HeaderComponent,
    FooterComponent,
    ReactiveFormsModule,
    NgxSliderModule,
    FullCalendarModule,
    NgChartsModule, // ✅ Add this,,
    AddPostComponent,
    PostListComponent,
    NotificationsComponent,
    HomeComponent,
    
    HeaderBackComponent,
    ListJobOffersComponent,
    ApplyJobComponent,
    AdminCrudJobOffersComponent,
    AdminDashlistapplicationsComponent,
    ScheduleinterviewadminComponent,
    ScheduleInterviewCandidateComponent,
    AdminStatsComponent, 
    RouterLink
    
    
  ],
 
  providers: [], 
  bootstrap: [AppComponent]
})
export class AppModule { }
