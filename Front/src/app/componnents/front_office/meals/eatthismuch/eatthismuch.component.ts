import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { FooterComponent } from '../../template/footer/footer.component';
import { HeaderComponent } from '../../template/header/header.component';
import { IngredientService } from 'src/app/services/meals/ingredient.service';
import { Ingredient } from 'src/app/models/meals/ingredient.module';
import { GeminiService } from 'src/app/services/meals/gemini.service';

@Component({
  selector: 'app-eatthismuch',
  standalone : true,
   imports: [
      HttpClientModule,
      CommonModule,
      RouterModule,
      FormsModule,
      HeaderComponent,
      FooterComponent,
      NgChartsModule,
      ReactiveFormsModule
    ],
  templateUrl: './eatthismuch.component.html',
  styleUrls: ['./eatthismuch.component.css']
})
export class EatthismuchComponent {
  macroForm!: FormGroup;
  macroKeys: Array<'carbs' | 'protein' | 'fat'> = ['carbs', 'protein', 'fat'];
  
  ingredients: Ingredient[] = [];
 
  

  colors = {
    carbs: '#f44336',
    protein: '#3f51b5',
    fat: '#ffc107'
  };

  grams = {
    carbs: 0,
    protein: 0,
    fat: 0
  };

  percentages = {
    carbs: 0,
    protein: 0,
    fat: 0
  };

  get totalCalories(): number {
    return this.macroForm.value.totalCalories || 1;
  }

  get usedCalories(): number {
    return this.macroForm.value.carbsCalories +
           this.macroForm.value.proteinCalories +
           this.macroForm.value.fatCalories;
  }

  get remainingCalories(): number {
    return this.totalCalories - this.usedCalories;
  }

  get isOverLimit(): boolean {
    return this.remainingCalories < 0;
  }

  constructor(private fb: FormBuilder,private ingredientService :IngredientService, private  geminiService : GeminiService ) {}

  ngOnInit(): void {
    const defaultTotal = 2000;
    this.macroForm = this.fb.group({
      totalCalories: [defaultTotal],
      carbsCalories: [defaultTotal * 0.5],
      proteinCalories: [defaultTotal * 0.2],
      fatCalories: [defaultTotal * 0.3]
    });
  
    // Recalculate macros when any field changes
    this.macroForm.valueChanges.subscribe(val => this.updateStats());
  
    // Special handling: recalculate macros when totalCalories alone changes
    this.macroForm.get('totalCalories')?.valueChanges.subscribe(total => {
      this.recalculateMacrosFromPercentages(total);
    });
  
    this.updateStats();
   
  }
  
  

  updateStats() {
    const { totalCalories, carbsCalories, proteinCalories, fatCalories } = this.macroForm.value;

    this.percentages.carbs = (carbsCalories / totalCalories) * 100;
    this.percentages.protein = (proteinCalories / totalCalories) * 100;
    this.percentages.fat = (fatCalories / totalCalories) * 100;

    this.grams.carbs = carbsCalories / 4;
    this.grams.protein = proteinCalories / 4;
    this.grams.fat = fatCalories / 9;
  }

  barHeight(macro: 'carbs' | 'protein' | 'fat'): string {
    return `${this.percentages[macro]}%`;
  }
  get totalPercent(): number {
  return (this.usedCalories / this.totalCalories) * 100;
}
recalculateMacrosFromPercentages(total: number) {
  const carbs = total * 0.5;
  const protein = total * 0.2;
  const fat = total * 0.3;

  this.macroForm.patchValue({
    carbsCalories: carbs,
    proteinCalories: protein,
    fatCalories: fat
  }, { emitEvent: false }); // Avoid recursion, we already subscribed to totalCalories
  this.updateStats(); // Update UI
}

loadIngredients(): void {
  this.ingredientService!.getIngredients().subscribe(
    (data: Ingredient[]) => {
      this.ingredients = data;
      console.log(this.ingredients); // Check if ingredients are being fetched
    },
    (error) => {
      console.error('Error fetching ingredients', error);
    }
  );
}
parsedIngredients: Ingredient[] = [];

mealplan :any;
groupedIngredients: { [category: string]: Ingredient[] } = {};

generateMealPlan() {
  this.ingredientService!.getIngredients().subscribe((ingredients: Ingredient[]) => {
    this.ingredients = ingredients;

    const totalCalories = this.macroForm.value.totalCalories;
    const macroRatios = {
      carbs: this.percentages.carbs,
      protein: this.percentages.protein,
      fat: this.percentages.fat
    };

    this.geminiService.generateMealPlanFromIngredients(
      ingredients,
      totalCalories,
      macroRatios
    ).subscribe(plan => {
      this.mealplan = plan;
    
      this.geminiService.extractIngredientsByCategory(plan).subscribe(grouped => {
        this.groupedIngredients = grouped;
        console.log('Grouped Ingredients:', this.groupedIngredients);
      });
    });
    
  });
}




}
