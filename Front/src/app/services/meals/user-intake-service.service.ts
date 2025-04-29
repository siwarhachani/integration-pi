import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MealIntake } from 'src/app/models/meals/meal-intake.module';
import { DailyCaloriesData } from 'src/app/models/meals/DailyCaloriesData.module';
import { User } from 'src/app/models/meals/user.module';

@Injectable({
  providedIn: 'root'
})
export class MealIntakeService {
  private apiUrl = 'http://localhost:9090/user-intake';
  private mealIntakes: MealIntake[] = [];

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    if (!token || token.split('.').length !== 3) {
      console.error('Token JWT invalide ou manquant');
      throw new Error('Token JWT manquant ou invalide');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  addMealIntake(mealIntake: MealIntake): Observable<MealIntake> {
    return this.http.post<MealIntake>(`${this.apiUrl}/add`, mealIntake, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError<MealIntake>('addMealIntake'))
    );
  }

  getMealsForToday(userId: number): Observable<MealIntake[]> {
    const formattedDate = new Date().toISOString().split('T')[0];
    const params = new HttpParams()
      .set('date', formattedDate)
      .set('userId', userId.toString());

    return this.http.get<MealIntake[]>(`${this.apiUrl}/meals`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      catchError(this.handleError<MealIntake[]>('getMealsForToday', []))
    );
  }

  getMealDetails(mealId: string): Observable<MealIntake> {
    return this.http.get<MealIntake>(`${this.apiUrl}/${mealId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError<MealIntake>('getMealDetails'))
    );
  }

  updateMealIntake(meal: MealIntake): Observable<MealIntake> {
    return this.http.put<MealIntake>(`${this.apiUrl}/${meal.id}`, meal, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError<MealIntake>('updateMealIntake'))
    );
  }

  deleteMealIntake(mealId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${mealId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError<void>('deleteMealIntake'))
    );
  }

  getAllMeals(): Observable<MealIntake[]> {
    return this.http.get<MealIntake[]>(`${this.apiUrl}/meals`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError<MealIntake[]>('getAllMeals', []))
    );
  }

  addMeal(meal: MealIntake): void {
    this.mealIntakes.push(meal);
  }

  getMealsByDate(date: string, userId: number): Observable<MealIntake[]> {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format');
    }

    const formattedDate = parsedDate.toISOString().split('T')[0];
    const params = new HttpParams()
      .set('date', formattedDate)
      .set('userId', userId.toString());

    return this.http.get<MealIntake[]>(`${this.apiUrl}/meals`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      catchError(this.handleError<MealIntake[]>('getMealsByDate', []))
    );
  }

  getMealsByDateAndUser(date: string, userId: number): Observable<MealIntake[]> {
    const params = new HttpParams()
      .set('date', date)
      .set('userId', userId.toString());

    return this.http.get<MealIntake[]>(`${this.apiUrl}/meals`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      catchError(this.handleError<MealIntake[]>('getMealsByDateAndUser', []))
    );
  }

  getStreak(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/streak/${userId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError<number>('getStreak', 0))
    );
  }

  getDailyCaloriesForMonth(year: number, month: number): Observable<DailyCaloriesData[]> {
    const url = `${this.apiUrl}/meals/daily-calories/${year}/${month}`;
    return this.http.get<DailyCaloriesData[]>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError<DailyCaloriesData[]>('getDailyCaloriesForMonth', []))
    );
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError<User>('getUserById'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
