import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { FooterComponent } from '../../template/footer/footer.component';
import { HeaderComponent } from '../../template/header/header.component';
import { Ingredient } from 'src/app/models/meals/ingredient.module';
import { IngredientService } from 'src/app/services/meals/ingredient.service';
import { GeminiService } from 'src/app/services/meals/gemini.service';
@Component({
  selector: 'app-mealgenerate',
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
  templateUrl: './mealgenerate.component.html',
  styleUrls: ['./mealgenerate.component.css']
})

export class MealgenerateComponent {
  groupedIngredients: { [category: string]: Ingredient[] } = {};
  selectedIngredients: Ingredient[] = [];

  constructor(private ingredientService: IngredientService,private geminisv : GeminiService) {}

  ngOnInit() {
    this.ingredientService.getIngredients().subscribe((ingredients) => {
      this.groupedIngredients = this.groupByCategory(ingredients);
    });
    
  }

  groupByCategory(ingredients: Ingredient[]): { [category: string]: Ingredient[] } {
    return ingredients.reduce((groups, ingredient) => {
      if (!groups[ingredient.category]) {
        groups[ingredient.category] = [];
      }
      groups[ingredient.category].push({ ...ingredient, selected: false });
      return groups;
    }, {} as { [category: string]: Ingredient[] });
  }

  toggleSelection(ingredient: Ingredient) {
    if (this.isSelected(ingredient)) {
      this.selectedIngredients = this.selectedIngredients.filter(i => i.ingId !== ingredient.ingId);
    } else {
      this.selectedIngredients.push(ingredient);
    }
  }

  isSelected(ingredient: Ingredient): boolean {
    return this.selectedIngredients.some(i => i.ingId === ingredient.ingId);
  }

  getSelectedCount(category: string): number {
    return this.groupedIngredients[category]?.filter(i => this.isSelected(i)).length || 0;
  }
  generatedMeals: string = '';
loading: boolean = false;

generateMeals() {
  if (this.selectedIngredients.length === 0) {
    this.generatedMeals = 'Please select at least one ingredient.';
    return;
  }

  this.loading = true;
  this.generatedMeals = '';

  this.geminisv.generateMealsAndInstructions(this.selectedIngredients, 3).subscribe(
    (result: string) => {
      this.generatedMeals = result;
      this.loading = false;
      console.log(this.generatedMeals)
    },
    (error) => {
      this.generatedMeals = 'Failed to generate meals.';
      this.loading = false;
    }
  );
}
expandedCategories: { [key: string]: boolean } = {};

visibleIngredients(ingredients: Ingredient[], categoryKey: string): Ingredient[] {
  return this.isExpanded(categoryKey) ? ingredients : ingredients.slice(0, 6); // show only 6 initially
}

toggleShowMore(categoryKey: string): void {
  this.expandedCategories[categoryKey] = !this.expandedCategories[categoryKey];
}

isExpanded(categoryKey: string): boolean {
  return !!this.expandedCategories[categoryKey];
}
copyToClipboard() {
  if (this.generatedMeals) {
    navigator.clipboard.writeText(this.generatedMeals).then(() => {
      alert('Copied to clipboard!');
    });
  }
}


}
