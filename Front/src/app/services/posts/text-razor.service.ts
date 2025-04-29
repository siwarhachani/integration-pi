import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TextRazorService {
  private apiUrl = 'https://api.textrazor.com/';
  private apiKey = '9348a44a6ae34a089c204ed23d8274e33ac01ea9a43236fbe74b2d1f';  // 🔐 Clé API

  constructor(private http: HttpClient) {}

  extractEntities(description: string): Observable<any> {
    const headers = new HttpHeaders({
      'x-textrazor-key': this.apiKey,
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const body = new URLSearchParams();
    body.set('text', description);
    body.set('extractors', 'entities,topics,words');

    return this.http.post(this.apiUrl, body.toString(), { headers });
  }
}
