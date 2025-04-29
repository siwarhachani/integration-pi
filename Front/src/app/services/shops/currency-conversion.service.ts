import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrencyConversionService {

  private apiUrl = 'https://v6.exchangerate-api.com/v6/c96d6af3ba30ecd9ffe75f83/pair/';

  constructor(private http: HttpClient) { }

  // Méthode pour convertir une valeur de TND à USD
  convertCurrency(amount: number): Observable<any> {
    const url = `${this.apiUrl}USD/TND/${amount}`;  // L'API nous donne la conversion de TND vers USD
    return this.http.get<any>(url);
  }
}
