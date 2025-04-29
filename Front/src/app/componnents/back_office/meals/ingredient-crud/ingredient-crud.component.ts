import { Component, OnInit } from '@angular/core';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Ingredient } from 'src/app/models/meals/ingredient.module';
import { IngredientService } from 'src/app/services/meals/ingredient.service';
import { AuthService } from 'src/app/services/user/auth.service';

@Component({
  selector: 'app-ingredient-crud',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, RouterModule],
  templateUrl: './ingredient-crud.component.html',
  styleUrls: ['./ingredient-crud.component.css']
})
export class IngredientCrudComponent implements OnInit {

  searchQuery: string = '';
  searchedIngredient: any;
  searchText: string = '';
  ingredients: any[] = [];
  categories: string[] = [];
  categoryTemp: string = '';
  newIngredient: Ingredient = {
    ingId: 0,
    food: '',
    measure: '',
    grams: 0,
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    satFat: 0,
    fiber: 0,
    category: ''
  };

  // Flag to show/hide the ingredient list
  showList: boolean = true;

  // Flag to show/hide the add ingredient form
  showAddForm: boolean = false;
  ingredientForm: FormGroup;

  constructor(private ingredientService: IngredientService, private http: HttpClient,private fb: FormBuilder, private auth : AuthService,private router: Router) {
    this.ingredientForm = this.fb.group({
      food: ['', [Validators.required, Validators.pattern('^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$'), Validators.minLength(2), Validators.maxLength(50)]],
      measure: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(30)]],
      grams: [0, [Validators.required, Validators.min(1)]],
      calories: [0, [Validators.required, Validators.min(0)]],
      protein: [0, [Validators.required, Validators.min(0)]],
      carbs: [0, [Validators.required, Validators.min(0)]],
      fat: [0, [Validators.required, Validators.min(0)]],
      satFat: [0, [Validators.required, Validators.min(0)]],
      fiber: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchCategories();
    this.auth.authStatus$.subscribe((status: boolean) => {
      this.isLoggedIn = status;
      if (this.isLoggedIn) {
        this.username = this.auth.getCurrentUserUsername();  // Replace with actual field in the token
        this.role = this.auth.getRole();          // Replace with actual field in the token
        this.userPhotoUrl = this.auth.getCurrentUserPicture();
      }

    });
  }
  

  fetchCategories() {
    this.ingredientService.getIngredients().subscribe(
      (ingredients) => {
        this.categories = this.ingredientService.getCategories(ingredients);
      },
      (error) => {
        console.error('Error fetching ingredients:', error);
      }
    );
  }

  // Search for an ingredient by name
  searchIngredients() {
    if (this.searchText.trim().length > 0) {
      console.log('Searching for:', this.searchText);
      this.http.get<any[]>(`http://localhost:9090/ingredients/search?food=${this.searchText}`).subscribe(
        (data) => {
          console.log('Data received:', data);
          this.ingredients = data;
        },
        (error) => {
          console.error('Error fetching ingredients:', error);
          this.ingredients = [];
        }
      );
    } else {
      this.ingredients = [];
    }
  }

  selectIngredient(ingredient: any) {
    console.log('Selected ingredient:', ingredient);
    if (ingredient && ingredient.ingId) {
      this.searchedIngredient = { ...ingredient }; // Spread to avoid direct mutation
      console.log('Searched ingredient updated:', this.searchedIngredient); // Check the updated values
      this.showList = false;
    } else {
      alert('Ingredient ID is missing.');
    }
  }
  
  
  

  updateIngredient() {
    console.log('Ingredient before update:', this.searchedIngredient);
    
    // Ensure `grams` is correctly set
    this.searchedIngredient = {
      ...this.searchedIngredient,
      grams: this.searchedIngredient.grams ?? 0, // Ensure it’s not undefined
      calories: this.searchedIngredient.calories ?? 0,
      protein: this.searchedIngredient.protein ?? 0,
      fat: this.searchedIngredient.fat ?? 0,
      carbs: this.searchedIngredient.carbs ?? 0,
      satFat: this.searchedIngredient.satFat ?? 0,
      fiber: this.searchedIngredient.fiber ?? 0,
      category: this.searchedIngredient.category ?? ''
    };

    console.log('Ingredient after processing:', this.searchedIngredient);

    if (!this.searchedIngredient.ingId || this.searchedIngredient.ingId === 0) {
      console.error('Invalid ingredient ID:', this.searchedIngredient.ingId);
      alert('Invalid ingredient ID, cannot update.');
      return;
    }

    this.ingredientService.updateIngredient(this.searchedIngredient.ingId,this.searchedIngredient)
      .subscribe(
        (response) => {
          console.log('Ingredient updated successfully:', response);
          alert('Ingredient updated successfully');
          this.showList = true;
          this.searchedIngredient = null;
        },
        (error) => {
          console.error('Error updating ingredient:', error);
          alert('Failed to update ingredient. Please check the console for details.');
        }
      );
}

  
  
  getIngredientById(ingredientId: number) {
    this.ingredientService.getIngredientById(ingredientId)
      .subscribe(
        (response) => {
          console.log('Fetched updated ingredient:', response);
          this.searchedIngredient = response; // Update the local variable
        },
        (error) => {
          console.error('Error fetching ingredient:', error);
        }
      );
  }
  
  
  // Delete an ingredient
  deleteIngredient() {
    if (this.searchedIngredient) {
      // Call the delete service using the id of the ingredient
      this.ingredientService.deleteIngredient(this.searchedIngredient.ingId).subscribe(
        () => {
          
          this.goBackToList();
        },
      );
    }
  }
 // Add a new ingredient
 addIngredient() {
  // Create a new ingredient object without the 'ingId' field
  const ingredientToAdd = {
    food: this.newIngredient.food,
    measure: this.newIngredient.measure,
    grams: this.newIngredient.grams,
    calories: this.newIngredient.calories,
    protein: this.newIngredient.protein,
    fat: this.newIngredient.fat,
    satFat: this.newIngredient.satFat,
    fiber: this.newIngredient.fiber,
    carbs: this.newIngredient.carbs,
    category: this.newIngredient.category
  };

  console.log('Adding ingredient:', ingredientToAdd);

  this.ingredientService.addIngredient(ingredientToAdd)
    .subscribe(
      (response) => {
        console.log('Ingredient added successfully:', response);
        alert('Ingredient added successfully');
        this.hideAddIngredientForm();
      },
      (error) => {
        console.error('Error adding ingredient:', error);
        alert('Failed to add ingredient. Please check the console for details.');
      }
    );
}





  // Go back to ingredient list
  goBackToList() {
    this.showList = true;
    this.searchedIngredient = null;
  }

  // Show the add ingredient form
  showAddIngredientForm() {
    this.showAddForm = true;
  }

  // Hide the add ingredient form
  hideAddIngredientForm() {
    this.showAddForm = false;
  }

   isLoggedIn: boolean = false;
    username: string | null = null;
    role: string | null = null;
    userPhotoUrl: string | null = null;
  
   
  
    isDropdownOpen = false;
  
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    }
  
  
   
  
    logout() {
      this.auth.logout();
      this.username = null;
      this.role = null;
      this.router.navigate(['/login']);
    }
}
