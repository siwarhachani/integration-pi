import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Ingredient } from 'src/app/models/meals/ingredient.module';


@Injectable({
  providedIn: 'root'
})
export class IngredientService {

   private apiUrl = 'http://localhost:9090/ingredients';  // Change this to your backend API URL
  
    constructor(private http: HttpClient) { }
  
    // Fetch meal names from the backend
   // Fetch meal names from the backend
   getIngredients(): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(this.apiUrl); // No need to use 'map' here, as Angular handles the JSON parsing
  }
  
 

  searchIngredient(name: string): Observable<Ingredient> {
    return this.http.get<Ingredient>(`${this.apiUrl}/search?food=${name}`);
  }

  updateIngredient(id: number, ingredient: Ingredient): Observable<Ingredient> {
    return this.http.put<Ingredient>(`${this.apiUrl}/${id}`, ingredient);  // Correct URL pattern
  }
  

  deleteIngredient(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
 }
  addIngredient(ingredient: Ingredient): Observable<Ingredient> {
    return this.http.post<Ingredient>(`${this.apiUrl}/add`, ingredient);
  }

  getCategories(ingredients: Ingredient[]): string[] {
    return [...new Set(ingredients.map(ingredient => ingredient.category))];
  }
// ingredient.service.ts
getIngredientByName(name: string): Observable<Ingredient> {
  return this.http.get<Ingredient>(`${this.apiUrl}/byname/${name}`);
}
getIngredientById(id: number): Observable<Ingredient> {
  return this.http.get<Ingredient>(`${this.apiUrl}/byid/${id}`);
}

 
}
