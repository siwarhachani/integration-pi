
export interface Ingredient {
ingId?: number;
food :string;
measure: string;
grams :number;
calories : number;
protein :number;
fat :number;
satFat :number;
fiber :number;
carbs: number;
category :string;
selected?: boolean;
}

export interface NutrientInfo {
    name: string;
    value: string;
  }