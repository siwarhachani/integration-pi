import { Component, OnInit } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartType, ChartOptions } from 'chart.js';
import { AuthService } from 'src/app/services/user/auth.service';

@Component({
  standalone: true,
  selector: 'app-emotion-dashboard',
  templateUrl: './emotion-dashboard.component.html',
  styleUrls: ['./emotion-dashboard.component.css'],
  imports: [CommonModule, HttpClientModule, NgChartsModule]
})
export class EmotionDashboardComponent implements OnInit {

 user = 'admin'; // ← This matches what is actually stored in emotion_log.json
 //user = localStorage.getItem('userId');
 


  apiUrl = 'http://localhost:5001';

  moodChartType: ChartType = 'bar';
  distributionChartType: ChartType = 'pie';
  timelineChartType: ChartType = 'bar';

  moodChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  distributionChartData: ChartData<'pie'> = { labels: [], datasets: [] };
  timelineChartData: ChartData<'bar'> = { labels: [], datasets: [] };

  colorsByEmotion: any = {
    joy: '#f87171',
    sadness: '#fbbf24',
    anger: '#60a5fa',
    surprise: '#34d399',
    neutral: '#a3a3a3',
    fear: '#f472b6',
    disgust: '#c084fc'
  };
  userid! :number;

  constructor(private http: HttpClient,private authService: AuthService) {}

  ngOnInit(): void {
    this.loadMoodGraph();
    this.loadDistribution();
    this.loadTimeline();
    this.authService.getUserIdByCurrentUsername().subscribe({
      next: (id) => {
        this.userid = id;
        console.log('User ID:', this.userid);
      }});
  }

  loadMoodGraph() {
    this.http.get<any[]>(`${this.apiUrl}/mood-graph/${this.user}`).subscribe(data => {
      const labels = data.map(d => d.timestamp);
      const values = data.map(d => d.score);

      this.moodChartData = {
        labels,
        datasets: [
          {
            label: 'Mood Score',
            data: values,
            backgroundColor: '#93c5fd'
          }
        ]
      };
    });
  }

  loadDistribution() {
    this.http.get<any>(`${this.apiUrl}/emotion-distribution/${this.user}`).subscribe(data => {
      const labels = Object.keys(data);
      const values = Object.values(data).map(v => Number(v));


      this.distributionChartData = {
        labels,
        datasets: [
          {
            label: 'Emotion Distribution',
            data: values,
            backgroundColor: labels.map(label => this.colorsByEmotion[label] || '#ccc')
          }
        ]
      };
    });
  }

  loadTimeline() {
    this.http.get<any[]>(`${this.apiUrl}/emotion-timeline/${this.user}`).subscribe(data => {
      const labels = data.map(d => d.timestamp);
      const emotionGroups: any = {};

      data.forEach(d => {
        if (!emotionGroups[d.emotion]) {
          emotionGroups[d.emotion] = Array(data.length).fill(0);
        }
      });

      data.forEach((d, index) => {
        emotionGroups[d.emotion][index] = 1;
      });

      const datasets = Object.entries(emotionGroups).map(([emotion, values]: any) => ({
        label: emotion,
        data: values,
        backgroundColor: this.colorsByEmotion[emotion] || '#ccc'
      }));

      this.timelineChartData = {
        labels,
        datasets
      };
    });
  }
}
