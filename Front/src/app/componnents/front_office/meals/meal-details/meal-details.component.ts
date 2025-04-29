import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ingredient } from 'src/app/models/meals/ingredient.module';
import { IngredientService } from 'src/app/services/meals/ingredient.service';
import { MealIntakeService } from 'src/app/services/meals/user-intake-service.service';
import { MealIntake } from 'src/app/models/meals/meal-intake.module';
import { AuthService } from 'src/app/services/user/auth.service';
import { User } from 'src/app/models/meals/user.module';

@Component({
  selector: 'app-meal-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './meal-details.component.html',
  styleUrls: ['./meal-details.component.css'],
})
export class MealDetailsComponent implements OnInit {
  @Input() meal: Ingredient | null = null;
  originalMeal: Ingredient | null = null;
  selectedDate!: Date;
  category: string = '';
  quantity: number = 1;

  userId!: number;
  user!: User;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ingredientService: IngredientService,
    private mealIntakeService: MealIntakeService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const mealId = Number(this.route.snapshot.paramMap.get('mealId'));
    const categoryParam = this.route.snapshot.paramMap.get('category');
    this.category = categoryParam ?? '';

    this.route.queryParams.subscribe(params => {
      this.selectedDate = new Date(params['date']);
    });

    // Fetch meal details
    this.fetchMealDetails(mealId);

    // Fetch user ID and user object
    this.authService.getUserIdByCurrentUsername().subscribe({
      next: (id) => {
        console.log('Retrieved User ID:', id);
        this.userId = id;

        this.mealIntakeService.getUserById(id).subscribe({
          next: (userData) => {
            this.user = userData;
            console.log('Fetched user:', this.user);
          },
          error: (err) => {
            console.error('Error fetching user details:', err);
          }
        });
      },
      error: (err) => {
        console.error('Error fetching user ID:', err);
      }
    });
  }

  fetchMealDetails(mealId: number) {
    this.ingredientService.getIngredients().subscribe((data) => {
      const foundMeal = data.find((_, index) => index + 1 === mealId);
      if (foundMeal) {
        this.meal = foundMeal;
        this.updateMealValues();
      }
    });
  }

  updateMealValues(): void {
    if (!this.meal || this.quantity <= 0 || isNaN(this.quantity) || this.meal.grams <= 0) {
      console.warn('Invalid meal or quantity. Skipping update.');
      return;
    }

    const scalingFactor = this.quantity / this.meal.grams;

    this.meal = {
      ...this.meal,
      calories: parseFloat((this.meal.calories * scalingFactor).toFixed(0)),
      protein: parseFloat((this.meal.protein * scalingFactor).toFixed(1)),
      fat: parseFloat((this.meal.fat * scalingFactor).toFixed(1)),
      carbs: parseFloat((this.meal.carbs * scalingFactor).toFixed(1)),
      satFat: parseFloat((this.meal.satFat * scalingFactor).toFixed(1)),
      fiber: parseFloat((this.meal.fiber * scalingFactor).toFixed(2)),
      grams: this.quantity,
      food: this.meal.food || '',
    };

    console.log('Updated Meal:', this.meal);
  }

  handleBlur(): void {
    const quantityValue = Number(this.quantity);
    this.quantity = isNaN(quantityValue) || quantityValue <= 0 ? 1 : quantityValue;
    this.updateMealValues();
  }

  addMeal(): void {
    if (!this.meal || !this.user) {
      console.error('Meal or user not loaded yet. Cannot add meal.');
      return;
    }

    const mealIntake: MealIntake = {
      category: this.category,
      mealName: this.meal.food,
      username: this.user.username, // Now using real user data
      date: this.selectedDate,
      grams: this.quantity,
      calories: this.meal.calories,
      protein: this.meal.protein,
      fat: this.meal.fat,
      satFat: this.meal.satFat,
      fiber: this.meal.fiber,
      carbs: this.meal.carbs,
      ingredient: this.meal,
      user: { id: this.user.id}
    };

    this.mealIntakeService.addMealIntake(mealIntake).subscribe({
      next: (response) => {
        console.log('Meal successfully added to intake:', response);
        this.router.navigate(['/ingredient']);
      },
      error: (error) => {
        console.error('Error adding meal intake:', error);
      }
    });
  }
}
