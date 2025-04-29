import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService, Event } from 'src/app/services/event/event.service';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import {
  ChartOptions,
  ChartData,
  ChartType
} from 'chart.js';

@Component({
  selector: 'app-event-stats',
  standalone: true,
  imports: [CommonModule, RouterModule, NgChartsModule],
  templateUrl: './event-stats.component.html',
  styleUrls: ['./event-stats.component.css']
})
export class EventStatsComponent implements OnInit {

  publicStats: any = {};
  mostPopularEvent: Event | null = null;
  nextUpcomingEvent: Event | null = null;
  eventsThisWeek: number = 0;
  upcomingEvents: Event[] = [];   // ✅ added this

  // Pie Chart: Event Category Distribution
  pieChartData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#FF9800']
      }
    ]
  };
  pieChartType: ChartType = 'pie';

  // Bar Chart: Monthly Trend
  monthlyTrendChart: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadStats();

    // ✅ Load Upcoming Events for Timeline
    this.eventService.getEvents().subscribe(events => {
      this.upcomingEvents = events
        .filter(ev => new Date(ev.startDate) > new Date())
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 5); // Show 5 upcoming events max
    });
  }

  loadStats(): void {
    this.eventService.getPublicStats().subscribe(stats => {
      this.publicStats = stats;

      if (stats.eventsByCategory) {
        const labels = Object.keys(stats.eventsByCategory);
        const values = Object.values(stats.eventsByCategory);

        this.pieChartData = {
          labels: labels,
          datasets: [{
            data: values as number[],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#FF9800']
          }]
        };
      }
    });

    this.eventService.getMostPopularEvent().subscribe(event => {
      this.mostPopularEvent = event;
    });

    this.eventService.getNextUpcomingEvent().subscribe(event => {
      this.nextUpcomingEvent = event;
    });

    this.eventService.getEventsThisWeek().subscribe(count => {
      this.eventsThisWeek = count;
    });

    this.eventService.getMonthlyEventTrend().subscribe(trend => {
      this.monthlyTrendChart = {
        labels: Object.keys(trend),
        datasets: [{
          data: Object.values(trend),
          label: 'Events per Month',
          backgroundColor: '#90caf9'
        }]
      };
    });
  }
}
