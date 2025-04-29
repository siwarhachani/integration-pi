import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // ✅ Pour NgIf, NgFor, NgClass

@Component({
  selector: 'app-smart-planner',
  standalone: true,
  templateUrl: './smart-planner.component.html',
  styleUrls: ['./smart-planner.component.css'],
  imports: [
    CommonModule,         // ✅ obligatoire pour directives Angular
    HttpClientModule      // pour les appels API
  ]
})
export class SmartPlannerComponent implements OnInit {
  heatmapData: any = {};
  suggestion: string = '';
  loading = true;

  days: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  categories: string[] = [];
  matrix: number[][] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadHeatmap();
  }

  loadHeatmap(): void {
    this.http.get<any>('http://localhost:5007/api/events/heatmap').subscribe({
      next: (data) => {
        this.heatmapData = data;
        this.categories = Object.keys(data);
        this.matrix = this.categories.map(cat =>
          this.days.map(day => data[cat][day] || 0)
        );
        this.getAISuggestion();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getAISuggestion(): void {
    this.http.post<any>('http://localhost:5007/ai-weekly-advice', {
      heatmap: this.heatmapData
    }).subscribe({
      next: (res) => {
        this.suggestion = res.suggestion;
        this.loading = false;
      },
      error: () => {
        this.suggestion = '⚠️ Erreur lors de la génération de la suggestion.';
        this.loading = false;
      }
    });
  }
}
