import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MealIntake } from 'src/app/models/meals/meal-intake.module';
import { MealIntakeService } from 'src/app/services/meals/user-intake-service.service';

@Component({
  selector: 'app-update-intake',
  standalone:true,
  imports: [HttpClientModule,FormsModule],
  templateUrl: './update-intake.component.html',
  styleUrls: ['./update-intake.component.css']
})
export class UpdateIntakeComponent implements OnInit {
  meal: MealIntake = {} as MealIntake;
  categories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
  category: string = '';
  selectedDate: string = '';

  constructor(
    private route: ActivatedRoute,
    private mealIntakeService: MealIntakeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get the mealId, category, and selectedDate from the route params
    const mealId = this.route.snapshot.paramMap.get('mealId')!;
    this.category = this.route.snapshot.paramMap.get('category')!;
    this.selectedDate = this.route.snapshot.paramMap.get('selectedDate')!;

    // Fetch the meal details by ID
    this.loadMealDetails(mealId);
  }

  loadMealDetails(mealId: string): void {
    this.mealIntakeService.getMealDetails(mealId).subscribe(
      (meal: MealIntake) => {
        this.meal = meal;
      },
      (error) => {
        console.error('Error fetching meal details:', error);
        alert('Error loading meal details');
      }
    );
  }

  saveMeal(): void {
    this.mealIntakeService.updateMealIntake(this.meal).subscribe(
      (response) => {
        console.log('Meal updated successfully:', response);
        this.router.navigate(['/ingredient']); // Redirect to the ingredient page after saving
      },
      (error) => {
        console.error('Error saving meal:', error);
        alert('Failed to update meal');
      }
    );
  }

  cancel(): void {
    // Navigate back to the ingredient page without saving
    this.router.navigate(['/ingredient']);
  }
}
