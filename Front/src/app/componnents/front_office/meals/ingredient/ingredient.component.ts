import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MealIntake } from 'src/app/models/meals/meal-intake.module';
import { MealIntakeService } from 'src/app/services/meals/user-intake-service.service';
import { HeaderComponent } from '../../template/header/header.component';
import { FooterComponent } from '../../template/footer/footer.component';
import { WeightEstimateService } from 'src/app/services/meals/weight-estimate.service';
import { IngredientService } from 'src/app/services/meals/ingredient.service';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { DailyCaloriesData } from 'src/app/models/meals/DailyCaloriesData.module';
import { Ingredient, NutrientInfo } from 'src/app/models/meals/ingredient.module';
import { GeminiService } from 'src/app/services/meals/gemini.service';
import { AuthService } from 'src/app/services/user/auth.service';
import { User } from 'src/app/models/meals/user.module';


@Component({
  selector: 'app-ingredient',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    RouterModule,
    FormsModule,
    HeaderComponent,
    FooterComponent,
    NgChartsModule
  ],
  templateUrl: './ingredient.component.html',
  styleUrls: ['./ingredient.component.css'],
})
export class IngredientComponent {
  mealCategories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
  selectedMeals: any = {};
  selectedDate: Date = new Date();
  meals: MealIntake[] = [];
  searchTerm: string = '';
  selectedMealForEdit: MealIntake | null = null;
  showNutritionSummary = false;


  macroChartLabels: string[] = ['Carbohydrates', 'Fat', 'Protein'];
  macroChartData: ChartData<'pie', number[], string> = {
    labels: this.macroChartLabels,
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#3BA3A0', '#9A4FB0', '#EF6C6C']
      }
    ]
  };
  macroBreakdown: any[] = [];
  // Options for Category Breakdown Bar Chart
categoryChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  scales: {
    y: {
      beginAtZero: true,
      max: 100
    }
  }
};

// Options for Macro Bar Chart
macroBarOptions: ChartOptions<'bar'> = {
  responsive: true,
  indexAxis: 'y',
  scales: {
    x: {
      beginAtZero: true
    }
  }
};
macroChartOptions = {
  responsive: true,
  scales: {
    y: {
      beginAtZero: true,
      title: { display: true, text: 'Grams' }
    },
    x: {
      title: { display: true, text: 'Meal Category' }
    }
  }
};

dailyProgressLineChartData: ChartData<'line'> = {
  labels: [],
  datasets: [
    {
      label: 'Calories Consumed',
      data: [],
      borderColor: '#42A5F5', // Line color
      backgroundColor: 'rgba(66, 165, 245, 0.2)', // Area under the line
      fill: true, // Fill the area under the line
      tension: 0.4, // Smooth curve
      pointRadius: 5, // Size of the points
      pointBackgroundColor: '#42A5F5', // Point color
      pointBorderColor: '#fff', // Point border color
      pointBorderWidth: 2, // Point border width
    },
  ],
};

showNutritionModal = false;
selectedChartTab: 'pie' | 'category' | 'bar' = 'pie';
  streak=0;



  constructor(
    private router: Router,
    private mealIntakeService: MealIntakeService,
    private weightEstimateService: WeightEstimateService,
    private ingredientService: IngredientService,
    private geminiService: GeminiService,
    private authService: AuthService  ) {}

  bodyFat = 0;
  muscleMass = 0;
  boneMass = 0;
  waterPercentage = 0;
  waterMass = 0;

  muscleOpacity = 0;
  fatOpacity = 0;
  boneOpacity = 0;
  waterOpacity = 0;
  userId!: number;



    ngOnInit(): void {
      console.log(this.authService.getCurrentUserUsername(),"ingredient")

      this.authService.getUserIdByCurrentUsername().subscribe({
        next: (id) => {
          this.userId = id;
          console.log('User ID in ingredient :', this.userId);
    
          // Now call the other methods that depend on userId
          this.weightEstimateService.getBodyFatPercentage(this.userId).subscribe(val => {
            this.bodyFat = val;
            this.fatOpacity = 1;
          });
           // Now it's safe to use userId
    this.mealIntakeService.getStreak(this.userId).subscribe(val => {
      this.streak = val;
      console.log('Streak:', this.streak);
    });
    
          this.weightEstimateService.getMuscleMass(this.userId).subscribe(val => {
            this.muscleMass = val;
            this.muscleOpacity = 1;
          });
    
          this.weightEstimateService.getBoneMass(this.userId).subscribe(val => {
            this.boneMass = val;
            this.boneOpacity = 1;
          });
    
          this.weightEstimateService.getWaterMass(this.userId).subscribe(val => {
            this.waterMass = val;
            this.waterOpacity = 1;
          });
          this.loadMeals();
        },
        error: (err: any) => {
          console.error('Error fetching user ID', err);
        }
      });
    
      this.authService.getUserIdByCurrentUsername().subscribe({
        next: (id) => {
          this.userId = id;
          this.mealIntakeService.getUserById(this.userId).subscribe({
            next: (userData) => {
              this.user = userData;
              console.log('Fetched user:', this.user);
            },
            error: (err) => {
              console.error('Error fetching user details:', err);
            }
          });
        },
        error: (err) => console.error('Error fetching user ID:', err)
      });

//const username = this.authService.getCurrentUserUsername();




    }      
    getOpacity(value: number, max: number): number {
      return Math.min(value / max, 1);
    }
  
  isToday(date: Date): boolean {
    const today = new Date();
    return (
      today.getDate() === date.getDate() &&
      today.getMonth() === date.getMonth() &&
      today.getFullYear() === date.getFullYear()
    );
    
  
  }

  loadMeals() {
    const formattedDate = this.selectedDate.toISOString().split('T')[0];
    this.mealIntakeService.getMealsByDateAndUser(formattedDate,this.userId).subscribe(
      (meals: MealIntake[]) => {
        this.meals = meals || [];
       
        this.updateNutritionChart(); // Calls macroChartData update
        this.updateCategoryChartData(); // Calls categoryChartData update
        this.updateMacroBarChart(); 
        this.openCalculationsModal();
        this.fetchStreak();
       console.log( this.userId)
        
      },
      (error) => {
        console.error('Error fetching meals:', error);
        this.meals = [];
      }
    );
  }

  filteredMeals(category: string): MealIntake[] {
    if (!this.meals) return [];
    return this.meals
      .filter(meal => meal.category === category &&
                      new Date(meal.date).toLocaleDateString() === this.selectedDate.toLocaleDateString())
      .filter(meal => meal.mealName.toLowerCase().includes(this.searchTerm.toLowerCase()));
  }

 

  getMealsForDate(category: string): MealIntake[] {
    return this.meals.filter(
      meal => meal.category === category &&
      new Date(meal.date).toLocaleDateString() === this.selectedDate.toLocaleDateString()
    );
  }

  navigateToMealDetails(category: string) {
    const formattedDate = this.selectedDate.toISOString();
    this.router.navigate(['/meal-details', category, { selectedDate: formattedDate }]);
  }

  changeDate(direction: number): void {
    const newDate = new Date(this.selectedDate);
    newDate.setDate(this.selectedDate.getDate() + direction);
    this.selectedDate = newDate;
    this.loadMeals();
  }

  navigateToMealList(category: string) {
    const formattedDate = this.selectedDate.toISOString().split('T')[0];
    this.router.navigate(['/meal-list', category], {
      queryParams: { date: formattedDate }
    });
  }

  deleteMealIntake(mealId: number): void {
    if (confirm('Are you sure you want to delete this meal?')) {
      this.mealIntakeService.deleteMealIntake(mealId).subscribe({
        next: () => this.loadMeals(),
        error: (err) => alert('Failed to delete meal. Please try again.')
      });
    }
  }
  getTotalCaloriesForCategory(category: string): number {
    return this.getMealsForDate(category).reduce((total, meal) => total + (meal.calories || 0), 0);
  }

  getTotalCarbsForCategory(category: string): number {
    return this.filteredMeals(category).reduce((total, meal) => total + (meal.carbs || 0), 0);
  }

  getTotalFatsForCategory(category: string): number {
    return this.filteredMeals(category).reduce((total, meal) => total + (meal.fat || 0), 0);
  }

  getTotalProteinForCategory(category: string): number {
    return this.filteredMeals(category).reduce((total, meal) => total + (meal.protein || 0), 0);
  }
  totalCalories: number = 0;
  
 
  getTotalNutrientsForDay() {
    let totalCalories = 0, totalCarbs = 0, totalFats = 0, totalProteins = 0;
    for (let category of this.mealCategories) {
      let meals = this.filteredMeals(category);
      for (let meal of meals) {
        totalCalories += meal.calories;
        totalCarbs += meal.carbs;
        totalFats += meal.fat;
        totalProteins += meal.protein;
      }
    }
    return {
      calories: totalCalories.toFixed(0),
      carbs: totalCarbs.toFixed(0),
      fats: totalFats.toFixed(0),
      proteins: totalProteins.toFixed(0)
    };
  }

  

  weightChangeMessage: string = '';
  estimateWeightChange() {
    const totalCalories = this.getTotalNutrientsForDay().calories;
    const days = 28;
    const requestBody = {
      calories: totalCalories,
      user: { id: this.userId }
    };
    this.weightEstimateService.estimateWeightChange(requestBody).subscribe(
      (weightChange: number) => {
        const formattedChange = Math.abs(weightChange).toFixed(2);
        this.weightChangeMessage = weightChange < 0
        ? `You're going to lose approximately ${formattedChange} kg over ${days} days.`
        : weightChange > 0
          ? `You're going to gain approximately ${formattedChange} kg over ${days} days.`
          : "Your weight is likely to remain the same.";
      },
      (error) => {
        console.error('Error estimating weight change:', error);
        this.weightChangeMessage = '';
      }
    );
  }

  openEditModal(meal: MealIntake): void {
    this.selectedMealForEdit = { ...meal };
  }

  closeEditModal(): void {
    this.selectedMealForEdit = null;
  }

  submitUpdatedMeal(): void {
    if (!this.selectedMealForEdit || !this.selectedMealForEdit.id) {
      alert('Something went wrong. Please try again.');
      return;
    }
    this.mealIntakeService.updateMealIntake(this.selectedMealForEdit).subscribe({
      next: () => {
        this.loadMeals();
        this.closeEditModal();
      },
      error: () => alert('Failed to update the meal. Please try again later.')
    });
  }

  updateNutritionChart() {
    const totals = this.getTotalNutrientsForDay();
    const totalMacros = +totals.carbs + +totals.fats + +totals.proteins;
    if (totalMacros === 0) return;

    const carbPercent = ((+totals.carbs / totalMacros) * 100).toFixed(0);
    const fatPercent = ((+totals.fats / totalMacros) * 100).toFixed(0);
    const proteinPercent = ((+totals.proteins / totalMacros) * 100).toFixed(0);

    this.macroChartData = {
      labels: this.macroChartLabels,
      datasets: [
        {
          data: [+totals.carbs, +totals.fats, +totals.proteins],
          backgroundColor: ['#3BA3A0', '#9A4FB0', '#EF6C6C']
        }
      ]
    };

    this.macroBreakdown = [
      { label: 'Carbohydrates', grams: totals.carbs, percent: carbPercent, color: '#3BA3A0' },
      { label: 'Fat', grams: totals.fats, percent: fatPercent, color: '#9A4FB0' },
      { label: 'Protein', grams: totals.proteins, percent: proteinPercent, color: '#EF6C6C' },
    ];
  }
  categoryChartData: ChartData<'bar', number[], string> = {
    labels: [],
    datasets: []
  };
  
  updateCategoryChartData() {
    const categoryTotals = this.mealCategories.map(category => {
      const meals = this.filteredMeals(category);
      let total = 0;
      for (let meal of meals) {
        total += meal.calories || 0;
      }
      return total;
    });
  
    const totalCalories = categoryTotals.reduce((a, b) => a + b, 0);
    const categoryPercents = categoryTotals.map(c => totalCalories ? ((c / totalCalories) * 100).toFixed(0) : 0);
  
    this.categoryChartData = {
      labels: this.mealCategories,
      datasets: [
        {
          label: 'Calories %',
          data: categoryPercents.map(Number),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#81C784']
        }
      ]
    };
  }
  macroBarData: ChartData<'bar', number[], string> = {
    labels: [],
    datasets: []
  };
  
  updateMacroBarChart() {
    const macroPercentagesPerCategory = this.mealCategories.map(category => {
      const meals = this.filteredMeals(category);
  
      let carbs = 0, fats = 0, proteins = 0;
  
      for (let meal of meals) {
        carbs += meal.carbs || 0;
        fats += meal.fat || 0;
        proteins += meal.protein || 0;
      }
  
      const total = carbs + fats + proteins || 1;  // avoid divide-by-zero
  
      return {
        category,
        carbsPercent: +(carbs / total * 100).toFixed(1),
        fatsPercent: +(fats / total * 100).toFixed(1),
        proteinsPercent: +(proteins / total * 100).toFixed(1)
      };
    });
  
    this.macroBarData = {
      labels: this.mealCategories,
      datasets: [
        {
          label: 'Carbs (%)',
          data: macroPercentagesPerCategory.map(m => m.carbsPercent),
          backgroundColor: '#42A5F5'
        },
        {
          label: 'Fats (%)',
          data: macroPercentagesPerCategory.map(m => m.fatsPercent),
          backgroundColor: '#FFA726'
        },
        {
          label: 'Protein (%)',
          data: macroPercentagesPerCategory.map(m => m.proteinsPercent),
          backgroundColor: '#66BB6A'
        }
      ]
    };
  }
  
  
  showCalculationsModal = false;

  bmr: number = 0;
  tdee: number = 0;
  bmi: number = 0;
  bmiCategory: string = '';
  

    // Replace with actual user ID
   

  openCalculationsModal(): void {
    
    

    this.weightEstimateService.getBMR(this.userId).subscribe(bmr => {
      console.log("weight estimate",this.userId)
      this.bmr = bmr;

      // After getting BMR, fetch TDEE
      this.weightEstimateService.getTDEE(this.userId).subscribe(tdee => {
        this.tdee = tdee;
      });
    });

    this.weightEstimateService.getBMI(this.userId).subscribe(bmi => {
      this.bmi = bmi;
      this.bmiCategory = this.getBMICategory(bmi);
    });
    this.weightEstimateService.getIdealWeight(this.userId).subscribe(weight => {
      this.idealWeight = weight;
    });

  }

  getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Underweight';
    else if (bmi < 24.9) return 'Normal weight';
    else if (bmi < 29.9) return 'Overweight';
    else return 'Obese';
  }
  getBMIPercent(bmi: number): number {
    if (bmi <= 15) return 0;
    if (bmi >= 40) return 100;
    return ((bmi - 15) / (40 - 15)) * 100;
  }

  idealWeight: number = 0;

  streakCount: number = 0;


  fetchStreak(): void {
    this.mealIntakeService.getStreak(this.userId).subscribe(

      (count: number) => this.streakCount = count,
      error => console.error('Error fetching streak:', error)
    );
    console.log(" getStreak",this.userId)

  }
  dailyProgressChartOptions: ChartOptions<'line'> = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Day of the Month'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Calories'
        },
        beginAtZero: true
      }
    }
  };
  

  loadDailyCalories() {
    const year = this.selectedDate.getFullYear();
    const month = this.selectedDate.getMonth() + 1; // Get current month (1-based)
  
    // Call the service to get daily calories for the month
    this.mealIntakeService.getDailyCaloriesForMonth(year, month).subscribe(
      (dailyData: DailyCaloriesData[]) => {
        const daysInMonth = new Date(year, month, 0).getDate(); // Get the number of days in the month
        const dailyCalories = new Array(daysInMonth).fill(0); // Initialize array to store calories for each day
  
        // Aggregate data and fill the dailyCalories array
        dailyData.forEach((data) => {
          const day = new Date(data.date).getDate();
          dailyCalories[day - 1] = data.calories; // Store calories for the corresponding day
        });
  
        // Prepare chart data
        const labels = Array.from({ length: daysInMonth }, (_, index) => `Day ${index + 1}`);
        this.dailyProgressLineChartData = {
          labels: labels,
          datasets: [
            {
              label: 'Calories Consumed',
              data: dailyCalories,
              borderColor: '#42A5F5', // Line color
              backgroundColor: 'rgba(66, 165, 245, 0.2)', // Area under the line
              fill: true, // Fill the area under the line
              tension: 0.4, // Smooth curve
              pointRadius: 5, // Size of the points
              pointBackgroundColor: '#42A5F5', // Point color
              pointBorderColor: '#fff', // Point border color
              pointBorderWidth: 2, // Point border width
            },
          ],
        };
      },
      (error) => {
        console.error('Error fetching daily calorie data:', error);
      }
    );
  }

  showClap = false;

  onCompleteDay() {
    this.estimateWeightChange();
    this.showClap = true;
  
    setTimeout(() => {
      this.showClap = false;
    }, 5000); // Show for 5 seconds
  }
  
 
  selectedFile: File | null = null;  // Holds the selected file
  result: string = ``;
    // To store the result


  
  

  // This method is triggered when the user clicks the 'Analyze' button
  async uploadImage(): Promise<void> {
    if (!this.selectedFile) {
      alert('Please select an image!');
      return;
    }
  
    const formData = new FormData();
    formData.append('image', this.selectedFile);
  
    try {
      const res = await fetch('http://localhost:3000/analyze-image', {
        method: 'POST',
        body: formData
      });
  
      if (!res.ok) {
        const errorBody = await res.text();
        console.error('Error response from server:', errorBody);
        throw new Error('Failed to analyze image');
      }
  
      const textResult = await res.text(); // Get the result as plain text
      this.result = textResult; // Store the result as plain text
  
    } catch (error) {
      console.error('Error:', error);
      this.result = 'Error analyzing the image. Please try again.';
    }
    console.log(this.result)
    console.log(this.geminiService)
    this.geminiService.extractIngredientsAsJson(this.result).subscribe({
      next: (res: any) => {
        console.log('Response from Gemini:', res);
    
        const content = res?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        this.ingredients = res;
        
        console.log(this.ingredients)
    
        try {
          
          console.log('Parsed ingredients from Gemini:', this.ingredients);
        } catch (err) {
          console.error('Failed to parse Gemini response:', err);
          this.ingredients = [];
        }
      },
      error: (err) => {
        console.error('Error from Gemini:', err);
      }
    });
    
    
    
    
    
  }
   
  showDescription = false;

  toggleDescription() {
    this.showDescription = !this.showDescription;
  }

  showAddMenu: { [category: string]: boolean } = {};


  toggleAddMenu(category: string): void {
    // Ensure only one dropdown is open at a time
    for (const key in this.showAddMenu) {
      if (this.showAddMenu.hasOwnProperty(key)) {
        this.showAddMenu[key] = false;
      }
    }
    // Toggle the current one
    this.showAddMenu[category] = !this.showAddMenu[category];
  }
  
  handleFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
  
      // ✅ Store the file name
      this.selectedFileName = this.selectedFile.name;
  
      this.uploadImage(); // Call your image upload method
    }
  }
  
 
  
  selectedCategory: string  = '';
  showImageUploadModal: boolean = false;
  
  openImageUploadModal(category: string): void {
    this.selectedCategory = category;
    this.showImageUploadModal = true;
  }
  

  selectedFileName: string = '';

 
  
  ingredients:Ingredient[] | undefined ;
 
  
 
  user!: User;
  
  
  i!: Ingredient;
  addMeal(ingredient: Ingredient): void {
    
    // 1. First, check if the ingredient already exists in the database
    this.ingredientService.getIngredientByName(ingredient.food).subscribe(
      (existingIngredient: Ingredient) => {
        if (!existingIngredient) {
          // 2. Ingredient doesn't exist – add it to the ingredient DB
          const ingredientToAdd: Ingredient = {
            food: ingredient.food,
            measure: ingredient.measure,
            grams: ingredient.grams,
            calories: ingredient.calories,
            protein: ingredient.protein,
            fat: ingredient.fat,
            satFat: ingredient.satFat,
            fiber: ingredient.fiber,
            carbs: ingredient.carbs,
            category: ingredient.category,
           // or handle ID logic in the backend
          };
  
          this.ingredientService.addIngredient(ingredientToAdd).subscribe(
            (response) => {
              console.log('Ingredient added successfully:', response);
            },
            (error) => {
              console.error('Error adding ingredient:', error);
            }
          );
        } else {
          console.log('Ingredient already exists:', existingIngredient);
          console.log(existingIngredient.ingId)
          
        }
        
        
        // 3. Proceed to add the meal intake (in both cases)
        const mealIntake: MealIntake = {
          category: this.selectedCategory,
          mealName: ingredient.food,
          username: 'currentUser', // Replace with actual user info
          date: this.selectedDate,
          grams: 100,
          calories: ingredient.calories,
          protein: ingredient.protein,
          fat: ingredient.fat,
          satFat: ingredient.satFat,
          fiber: ingredient.fiber,
          carbs: ingredient.carbs,
          ingredient: existingIngredient,
          user: { id: this.userId}
          
        };
        
       
        this.mealIntakeService.addMealIntake(mealIntake).subscribe(
          (response: any) => {
            console.log('Meal successfully added to intake:', response);
            this.ingredients = this.ingredients!.filter(item => item !== ingredient);
          },
          (error: any) => {
            console.error('Error adding meal intake:', error);
          }
        );
      
      },
      (error) => {
        console.error('Error checking ingredient existence:', error);
      }
    );
  }
  
  addAllMeals(ingredients: Ingredient[]): void {
    for (const ingredient of ingredients) {
      this.addMeal(ingredient);
      this.router.navigate(['/ingredient']);
    }
  }
  
  
}


