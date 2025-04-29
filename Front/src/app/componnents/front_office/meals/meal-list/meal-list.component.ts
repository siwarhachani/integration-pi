import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MealDetailsComponent } from '../meal-details/meal-details.component';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { IngredientService } from 'src/app/services/meals/ingredient.service';
import { Ingredient } from 'src/app/models/meals/ingredient.module';

@Component({
  selector: 'app-meal-list',
  standalone: true,
  imports: [MealDetailsComponent, FormsModule, CommonModule],
  templateUrl: './meal-list.component.html',
  styleUrls: ['./meal-list.component.css'],
})
export class MealListComponent implements OnInit {
  meals: Ingredient[] = [];
  selectedMealId: string | null = null;
  category: string = '';
  searchTerm: string = '';
  pageSize = 5; // Number of meals per page
  currentPage = 1;
  date: string = '';

  constructor(
    private ingredientService: IngredientService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.category = params.get('category') || '';
    });

    // Get the date from the query parameters
    this.route.queryParamMap.subscribe((queryParams) => {
      this.date = queryParams.get('date') || '';
    });

    // Fetch meals when the component initializes
    this.fetchMeals();
  }

  fetchMeals(): void {
    this.ingredientService.getIngredients().subscribe((data: Ingredient[]) => {
      console.log('Meals fetched:', data); // Log to check the data
      this.meals = data;
    });
  }

  filteredMeals() {
    return this.meals.filter((meal) =>
      meal.food.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  paginatedMeals() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredMeals().slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.filteredMeals().length / this.pageSize);
  }

  changePage(direction: number) {
    const newPage = this.currentPage + direction;
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.currentPage = newPage;
    }
  }

  toggleMealDetails(mealId: string): void {
    this.selectedMealId = this.selectedMealId === mealId ? null : mealId;
  }

  goBack(): void {
    this.location.back();
  }
}
