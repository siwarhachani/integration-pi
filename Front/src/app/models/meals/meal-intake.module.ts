import { Ingredient } from "./ingredient.module";
import { User } from "./user.module";

export interface MealIntake {
id?: number;  // Make 'id' optional
category: string;
mealName:string;
username :string;
date:Date;
grams :number;
calories : number;
protein :number;
fat :number;
satFat :number;
fiber :number;
carbs: number;
ingredient: Ingredient;
user: Partial<User>;




  }
  