import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map } from 'rxjs';
import { Ingredient } from 'src/app/models/meals/ingredient.module';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private apiKey = 'AIzaSyCgXH5ee3Y1Wslo4JDI71rzKBBKnvk67x0';  // Replace with your Gemini API key
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor(private http: HttpClient) {}

  generateContent(prompt: string) {
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    return this.http.post(`${this.apiUrl}?key=${this.apiKey}`, body);
  }

  extractIngredientsAsJson(text: string) {
    const prompt = `
    Extract the following food ingredients and their nutritional information from the text below:
  
    Format:
     food: <ingredient_name>
     calories: <calories>
     protein: <protein>
     fat: <fat>
     carbs: <carbs>
     fiber: <fiber>
     quantity: <quantity>
     category:<category>
  
    Input:
    ${text}
    `;
  
    const body = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };
  
    return this.http.post(`${this.apiUrl}?key=${this.apiKey}`, body).pipe(
      map((response: any) => {
        // Log the entire response to see what we're working with
        console.log('Raw response from Gemini:', response);
  
        const rawContent = response?.candidates?.[0]?.content?.parts?.[0]?.text;
  
        if (!rawContent) {
          console.error('No content found in response:', response);
          return [];
        }
  
        // Remove unwanted code block markers (e.g., ```json or markdown formatting)
        const cleanResponse = rawContent.replace(/```(?:json|markdown)?/g, '')  // Removes both json and markdown code blocks
          .replace(/```/g, '');  // Remove closing code block markers
  
        // Log the cleaned response to debug
        console.log('Cleaned response before parsing:', cleanResponse);
  
        // Parse the cleaned response into structured JSON
        const ingredients = this.parseIngredientsToJson(cleanResponse);
  
        return ingredients;
      })
    );
  }
  
  parseIngredientsToJson(text: string) {
    const ingredientsArray: any[] = [];
  
    // Split the text by "food:" to get individual ingredients
    const items = text.split('food:').filter(item => item.trim() !== '');
  
    items.forEach(item => {
      const lines = item
        .split('\n')
        .map(line => line.trim())
        .filter(line => line !== '');
  
      const ingredient: any = {};
  
      // Loop through the lines and extract nutritional data
      lines.forEach(line => {
        if (line.startsWith('calories:')) {
          ingredient.calories = parseFloat(line.replace('calories:', '').trim());
        } else if (line.startsWith('protein:')) {
          ingredient.protein = parseFloat(line.replace('protein:', '').trim());
        } else if (line.startsWith('fat:')) {
          ingredient.fat = parseFloat(line.replace('fat:', '').trim());
        } else if (line.startsWith('carbs:')) {
          ingredient.carbs = parseFloat(line.replace('carbs:', '').trim());
        } else if (line.startsWith('fiber:')) {
          ingredient.fiber = parseFloat(line.replace('fiber:', '').trim());
        }
        else if (line.startsWith('category:')) {
          ingredient.category = line.replace('category:', '').trim();
        } else if (line.startsWith('quantity:')) {
          ingredient.measure = line.replace('quantity:', '').trim();
        
        } else if (!ingredient.food) {
          ingredient.food = line.trim(); // The first line is always the food name
        }
      });
  
      if (ingredient.food) {
        ingredientsArray.push(ingredient);
      }
    });
  
    return ingredientsArray;
  }
  
  parseIngredientsToJson2(text: string): Ingredient[] {
    const ingredientsArray: Ingredient[] = [];
  
    // Match entries like:
    // "Oatmeal: 50g (approx. 75 kcal, 2g protein, 1g fat, 16g carbs)"
    const regex = /[-*•]?\s*([\w\s,()\-]+?):\s*([\d.]+)\s*(g|ml|slice|slices|medium|small|large)?\s*\(approx\.\s*([\d.]+)\s*kcal(?:,\s*([\d.]+)g protein)?(?:,\s*([\d.]+)g fat)?(?:,\s*([\d.]+)g carbs)?/gi;
  
    let match;
    while ((match = regex.exec(text)) !== null) {
      const food = match[1].trim();
      const quantity = parseFloat(match[2]);
      const unit = match[3]?.toLowerCase() || ''; // e.g., "g", "ml", "slice"
      const calories = parseFloat(match[4]);
      const protein = match[5] ? parseFloat(match[5]) : 0;
      const fat = match[6] ? parseFloat(match[6]) : 0;
      const carbs = match[7] ? parseFloat(match[7]) : 0;
  
      const grams = (unit === 'g' || unit === 'ml') ? quantity : 100; // default to 100g if unit isn't weight-based
  
      const ingredient: Ingredient = {
        food,
        grams,
        measure: `${quantity} ${unit}`.trim(), // This gives "50 g", "1 slice", etc.
        calories,
        protein,
        fat,
        satFat: 0,
        fiber: 0,
        carbs,
        category: '' // Optional: assign based on meal type if needed
      };
  
      ingredientsArray.push(ingredient);
    }
  
    return ingredientsArray;
  }
  
  
  
  generateMealPlanFromIngredients(
    ingredients: Ingredient[],
    totalCalories: number,
    macroRatios: { carbs: number; protein: number; fat: number }
  ) {
    const ingredientList = ingredients.map(ing => 
      `- ${ing.food} (kcal: ${ing.calories}, protein: ${ing.protein}, fat: ${ing.fat}, carbs: ${ing.carbs})`
    ).join('\n');
  
    const prompt = `
    You are a meal planner AI. Create a full-day meal plan using ONLY the ingredients listed below.
    
    ### INGREDIENTS:
    ${ingredientList}
    
    ### GOALS:
    - Total Daily Calories: ~${totalCalories} kcal
    - Macronutrient Split:
      - Carbohydrates: ${macroRatios.carbs}% (~${(totalCalories * macroRatios.carbs / 100 / 4).toFixed(0)}g)
      - Protein: ${macroRatios.protein}% (~${(totalCalories * macroRatios.protein / 100 / 4).toFixed(0)}g)
      - Fat: ${macroRatios.fat}% (~${(totalCalories * macroRatios.fat / 100 / 9).toFixed(0)}g)
    
    ### INSTRUCTIONS:
    - Include: **Breakfast**, **Lunch**, **Dinner**, and **Snacks**
    - Only use the ingredients provided
    - For each meal, follow this format:
      
      **Meal Name: <e.g., "Oatmeal with Banana">**
      - **Ingredients:**
        - <Ingredient>: <quantity in grams or clear unit> (approx. <calories> kcal, <protein>g protein, <fat>g fat, <carbs>g carbs)
      - **Total Meal Nutrition:** <calories> kcal, <protein>g protein, <fat>g fat, <carbs>g carbs
    
    - Use consistent formatting and units for easy parsing.
    - Avoid excessive commentary. Focus on structure and nutritional data.
    
    Now, generate the meal plan.
    `;
    
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
    };
  
    return this.http.post(`${this.apiUrl}?key=${this.apiKey}`, body).pipe(
      map((response: any) => {
        const rawContent = response?.candidates?.[0]?.content?.parts?.[0]?.text;
        return rawContent || 'No response received from Gemini.';
      })
    );
  }
  
  /*
  extractIngredientsAsJsonByMeal(text: string) {
    const categories = ['breakfast', 'lunch', 'dinner', 'snacks'];
    const lowerText = text.toLowerCase();
    const results: Ingredient[] = [];
  
    categories.forEach((category, index) => {
      const start = lowerText.indexOf(category);
      const end = index < categories.length - 1 ? lowerText.indexOf(categories[index + 1]) : text.length;
  
      if (start !== -1) {
        const section = text.slice(start, end).trim();
  
        const ingredients = this.parseIngredientsToJson2(section);
        ingredients.forEach(i => i.category = category);
        results.push(...ingredients);
      }
    });
  
    return results;
  }
  */
  extractIngredientsByCategory(mealPlan: string) {
    const categories = ['breakfast', 'lunch', 'dinner', 'snack'];
    const categoryBlocks: { [key: string]: string } = {};
    const result: { [key: string]: Ingredient[] } = {};
  
    const lowerText = mealPlan.toLowerCase();
    
    // Step 1: Split the meal plan by categories
    categories.forEach((category, index) => {
      const start = lowerText.indexOf(category);
      const end = index < categories.length - 1 
        ? lowerText.indexOf(categories[index + 1]) 
        : mealPlan.length;
  
      if (start !== -1) {
        const block = mealPlan.substring(start, end).replace(new RegExp(category, 'i'), '').trim();
        categoryBlocks[category] = block;
      }
    });
  
    // Step 2: Process each block and extract ingredients
    const observables = Object.entries(categoryBlocks).map(([category, block]) =>
      this.extractIngredientsAsJson(block).pipe(
        map(ingredients => ({ category, ingredients }))
      )
    );
  
    // Step 3: Combine all into one observable result
    return forkJoin(observables).pipe(
      map(results => {
        results.forEach(({ category, ingredients }) => {
          result[category] = ingredients;
        });
        return result;
      })
    );
  }
  
  generateMealsAndInstructions(ingredients: Ingredient[], numberOfMeals: number = 3) {
    const ingredientList = ingredients.map(ing =>
      `- ${ing.food} (kcal: ${ing.calories}, protein: ${ing.protein}, fat: ${ing.fat}, carbs: ${ing.carbs})`
    ).join('\n');
  
    const prompt = `
  You are a smart meal planning and cooking assistant.
  
  Using ONLY the selected ingredients below, generate ${numberOfMeals} balanced meals. For each meal, provide:
  
  1. **Meal Name**
  2. **Ingredients**: with quantity, calories, protein, fat, and carbs
  3. **Total Nutrition** (per meal): total kcal, protein, fat, carbs
  4. **Step-by-step recipe instructions**: beginner-friendly, numbered steps, concise, and clear
  
  Keep the format structured and easy to read. Do not add extra commentary or repetition.
  
  ### SELECTED INGREDIENTS:
  ${ingredientList}
  
  ### EXAMPLE OUTPUT FORMAT:
  
  Meal Name: Chicken Rice Bowl
  
  - Ingredients:
    - Chicken breast: 100g (165 kcal, 31g protein, 3.6g fat, 0g carbs)
    - Cooked rice: 150g (200 kcal, 4g protein, 1g fat, 45g carbs)
    - Olive oil: 1 tsp (40 kcal, 0g protein, 5g fat, 0g carbs)
  
  - Total Nutrition: 405 kcal, 35g protein, 9.6g fat, 45g carbs
  
  - Instructions:
    Step 1: Heat a pan over medium heat and add olive oil.  
    Step 2: Cook chicken breast for 5–7 minutes on each side until golden.  
    Step 3: In a bowl, add cooked rice and top with sliced chicken.  
    Step 4: Serve warm and enjoy.
  
  Now generate the meals and instructions.
    `;
  
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
    };
  
    return this.http.post(`${this.apiUrl}?key=${this.apiKey}`, body).pipe(
      map((response: any) => {
        const rawContent = response?.candidates?.[0]?.content?.parts?.[0]?.text;
        return rawContent || 'No response received from Gemini.';
      })
    );
  }
  
  
}  
