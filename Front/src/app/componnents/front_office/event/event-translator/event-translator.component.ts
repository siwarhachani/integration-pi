import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-translator',
  standalone: true,
  templateUrl: './event-translator.component.html',
  styleUrls: ['./event-translator.component.css'],
  imports: [CommonModule]
})
export class EventTranslatorComponent implements OnChanges {
  @Input() title = '';
  @Input() description = '';
  @Input() targetLang = 'fr';

  translatedTitle = '';
  translatedDescription = '';
  isLoading = false;

  constructor(private http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['title'] || changes['description'] || changes['targetLang']) {
      this.translateEvent();
    }
  }

  translateEvent(): void {
    this.isLoading = true;
    const payload = {
      title: this.title,
      description: this.description,
      lang: this.targetLang
    };

    this.http.post<any>('http://localhost:5005/translate-event', payload).subscribe({
      next: (res) => {
        this.translatedTitle = res.title;
        this.translatedDescription = res.description;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Translation error:', err);
        this.isLoading = false;
      }
    });
  }
}