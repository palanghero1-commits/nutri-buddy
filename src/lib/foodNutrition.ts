export type NutritionPer100g = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

// Approximate cooked/plain food values per 100 g based on USDA FoodData Central reference foods.
// Actual values vary with ingredients, cooking method, and portion size.
const foods: Record<string, NutritionPer100g> = {
  rice: { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3 },
  "white rice": { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3 },
  "cooked rice": { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3 },
  "brown rice": { calories: 123, protein: 2.7, carbs: 25.6, fat: 1 },
  egg: { calories: 155, protein: 12.6, carbs: 1.1, fat: 10.6 },
  "boiled egg": { calories: 155, protein: 12.6, carbs: 1.1, fat: 10.6 },
  banana: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3 },
  "ripe banana": { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3 },
  milk: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
  "whole milk": { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
  chicken: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  "chicken breast": { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  fish: { calories: 128, protein: 26, carbs: 0, fat: 2.7 },
  "white bread": { calories: 266, protein: 8.9, carbs: 49.4, fat: 3.3 },
  bread: { calories: 266, protein: 8.9, carbs: 49.4, fat: 3.3 },
  "mung beans": { calories: 105, protein: 7, carbs: 19.2, fat: 0.4 },
  "boiled potato": { calories: 87, protein: 1.9, carbs: 20.1, fat: 0.1 },
  potato: { calories: 87, protein: 1.9, carbs: 20.1, fat: 0.1 },
  papaya: { calories: 43, protein: 0.5, carbs: 10.8, fat: 0.3 },
  mango: { calories: 60, protein: 0.8, carbs: 15, fat: 0.4 },
  oatmeal: { calories: 71, protein: 2.5, carbs: 12, fat: 1.5 },
};

export type NutritionEstimate = NutritionPer100g & {
  recognizedFoods: string[];
  unrecognizedFoods: string[];
};

export function estimateMealNutrition(foodNames: string[], servingGrams: number): NutritionEstimate {
  const estimate: NutritionEstimate = { calories: 0, protein: 0, carbs: 0, fat: 0, recognizedFoods: [], unrecognizedFoods: [] };
  if (!Number.isFinite(servingGrams) || servingGrams <= 0) {
    estimate.unrecognizedFoods = foodNames.map((name) => name.trim()).filter(Boolean);
    return estimate;
  }
  const multiplier = servingGrams / 100;

  for (const foodName of foodNames) {
    const normalized = foodName.trim().toLowerCase().replace(/\s+/g, " ");
    if (!normalized) continue;
    const nutrition = foods[normalized];
    if (!nutrition) {
      estimate.unrecognizedFoods.push(foodName.trim());
      continue;
    }
    estimate.recognizedFoods.push(foodName.trim());
    estimate.calories += nutrition.calories * multiplier;
    estimate.protein += nutrition.protein * multiplier;
    estimate.carbs += nutrition.carbs * multiplier;
    estimate.fat += nutrition.fat * multiplier;
  }

  estimate.calories = Math.round(estimate.calories);
  estimate.protein = Number(estimate.protein.toFixed(1));
  estimate.carbs = Number(estimate.carbs.toFixed(1));
  estimate.fat = Number(estimate.fat.toFixed(1));
  return estimate;
}
