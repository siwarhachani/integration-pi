import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { Chart, ChartConfiguration } from 'chart.js';
import { canvas } from 'leaflet';
import { NgChartsModule } from 'ng2-charts';
import { AdminstatService } from 'src/app/services/jobs/adminstat.service';

@Component({
  selector: 'app-admin-stats',
   standalone:true,
     imports: [
        HttpClientModule,
        CommonModule,
        RouterModule,
        FormsModule,
       NgxSliderModule,
      NgChartsModule,
      FullCalendarModule
       
      ],
  templateUrl: './admin-stats.component.html',
  styleUrls: ['./admin-stats.component.css']
})
export class AdminStatsComponent implements OnInit {
  jobOffersData: any;
  applicationsData: any;
  mostPopularJobTitle: string = '';
  applicationTrendData: any;
  applicationsByJobTitleData: any;

  predictedApplications: any[] = [];
  myChart: any;



  constructor(private http: HttpClient,private statservice : AdminstatService) {}

  ngOnInit() {
    this.http.get<any>('http://localhost:9090/api/admin-stat/stats').subscribe((stats) => {
      this.jobOffersData = {
        labels: ['Open Offers', 'Closed Offers'],
        datasets: [
          {
            label: 'Job Offers',
            data: [stats.openOffers, stats.closedOffers],
            backgroundColor: ['#4CAF50', '#F44336'],
          },
        ],
      };

      this.applicationsData = {
        labels: ['Pending', 'Reviewed', 'Accepted'],
        datasets: [
          {
            label: 'Applications',
            data: [stats.pendingApplications, stats.reviewedApplications, stats.acceptedApplications],
            backgroundColor: ['#FFC107', '#03A9F4', '#8BC34A'],
          },
        ],
      };

      this.mostPopularJobTitle = stats.mostPopularJobTitle;
    });
    this.getApplicationTrend();
    this.getApplicationsByJobTitle();
    this.loadPredictedApplications();
  }

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
  };


  getApplicationTrend() {
    this.http.get<any[]>('http://localhost:9090/api/admin-stat/application-trend').subscribe(data => {
      this.applicationTrendData = {
        labels: data.map(d => d.date),
        datasets: [{
          label: 'Applications per day',
          data: data.map(d => d.count),
          borderColor: '#42A5F5',
          fill: false
        }]
      };
    });
  }
  
  getApplicationsByJobTitle() {
    this.http.get<{[key: string]: number}>('http://localhost:9090/api/admin-stat/applications-by-job-title').subscribe(data => {
      this.applicationsByJobTitleData = {
        labels: Object.keys(data),
        datasets: [{
          label: 'Applications per Job Title',
          data: Object.values(data),
          backgroundColor: '#66BB6A'
        }]
      };
    });
}

loadPredictedApplications() {
  this.statservice.predictCompanyGrowth().subscribe({
    next: (data) => {
      console.log('Prediction result:', data);
      this.predictedApplications = data.future_predictions; // assuming Flask returns { future_predictions: [...] }
      this.createChart(); // Create the chart now

    },
    error: (err) => {
      console.error('Error predicting applications:', err);
    }
  });
}
createChart() {
  const labels = this.predictedApplications.map(d => `Day ${d.day_offset}`);
  const counts = this.predictedApplications.map(d => d.predicted_count);

  if (this.myChart) {
    this.myChart.destroy(); // destroy previous chart if exists
  }

  this.myChart = new Chart('myChart', {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Predicted Applications',
        data: counts,
        borderColor: 'blue',
        backgroundColor: 'lightblue',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}



}
