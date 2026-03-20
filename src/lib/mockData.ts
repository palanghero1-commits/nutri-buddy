export interface Child {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female";
  weight: number; // kg
  height: number; // cm
  bmi: number;
  status: "Normal" | "Underweight" | "Overweight" | "Stunted";
  avatar: string;
  parentName: string;
}

export interface MealEntry {
  id: string;
  childId: string;
  date: string;
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface GrowthRecord {
  date: string;
  weight: number;
  height: number;
}

export interface Alert {
  id: string;
  childId: string;
  childName: string;
  type: "warning" | "critical" | "info";
  message: string;
  date: string;
  read: boolean;
}

export const children: Child[] = [
  { id: "1", name: "Maria Santos", age: 5, gender: "Female", weight: 17.2, height: 108, bmi: 14.7, status: "Normal", avatar: "MS", parentName: "Ana Santos" },
  { id: "2", name: "Juan dela Cruz", age: 3, gender: "Male", weight: 11.8, height: 92, bmi: 13.9, status: "Underweight", avatar: "JC", parentName: "Rosa dela Cruz" },
  { id: "3", name: "Sofia Reyes", age: 7, gender: "Female", weight: 28.5, height: 125, bmi: 18.2, status: "Overweight", avatar: "SR", parentName: "Elena Reyes" },
  { id: "4", name: "Miguel Garcia", age: 4, gender: "Male", weight: 14.1, height: 96, bmi: 15.3, status: "Normal", avatar: "MG", parentName: "Pedro Garcia" },
  { id: "5", name: "Isabella Cruz", age: 6, gender: "Female", weight: 16.5, height: 105, bmi: 15.0, status: "Stunted", avatar: "IC", parentName: "Lorna Cruz" },
  { id: "6", name: "Carlos Mendoza", age: 2, gender: "Male", weight: 10.2, height: 82, bmi: 15.2, status: "Normal", avatar: "CM", parentName: "Margie Mendoza" },
];

export const mealEntries: MealEntry[] = [
  { id: "m1", childId: "1", date: "2026-03-20", mealType: "Breakfast", foods: ["Rice porridge", "Boiled egg", "Banana"], calories: 320, protein: 12, carbs: 48, fat: 8 },
  { id: "m2", childId: "1", date: "2026-03-20", mealType: "Lunch", foods: ["Rice", "Chicken adobo", "Mung beans"], calories: 450, protein: 22, carbs: 55, fat: 14 },
  { id: "m3", childId: "2", date: "2026-03-20", mealType: "Breakfast", foods: ["Bread", "Milk"], calories: 200, protein: 8, carbs: 30, fat: 5 },
  { id: "m4", childId: "3", date: "2026-03-20", mealType: "Lunch", foods: ["Rice", "Fried chicken", "Soda"], calories: 680, protein: 25, carbs: 72, fat: 28 },
  { id: "m5", childId: "4", date: "2026-03-20", mealType: "Breakfast", foods: ["Oatmeal", "Papaya", "Milk"], calories: 280, protein: 10, carbs: 42, fat: 6 },
];

export const growthData: Record<string, GrowthRecord[]> = {
  "1": [
    { date: "2025-09", weight: 15.8, height: 104 },
    { date: "2025-11", weight: 16.2, height: 105 },
    { date: "2026-01", weight: 16.8, height: 107 },
    { date: "2026-03", weight: 17.2, height: 108 },
  ],
  "2": [
    { date: "2025-09", weight: 10.5, height: 88 },
    { date: "2025-11", weight: 11.0, height: 89 },
    { date: "2026-01", weight: 11.4, height: 91 },
    { date: "2026-03", weight: 11.8, height: 92 },
  ],
};

export const alerts: Alert[] = [
  { id: "a1", childId: "2", childName: "Juan dela Cruz", type: "warning", message: "Below expected weight for age. Consider calorie-rich foods.", date: "2026-03-20", read: false },
  { id: "a2", childId: "3", childName: "Sofia Reyes", type: "warning", message: "BMI above normal range. Review meal portions and snack habits.", date: "2026-03-19", read: false },
  { id: "a3", childId: "5", childName: "Isabella Cruz", type: "critical", message: "Height significantly below standard for age. Refer for medical evaluation.", date: "2026-03-18", read: true },
  { id: "a4", childId: "1", childName: "Maria Santos", type: "info", message: "Growth on track. Maintain current nutrition plan.", date: "2026-03-17", read: true },
];

export const dashboardStats = {
  totalChildren: 6,
  normalCount: 3,
  underweightCount: 1,
  overweightCount: 1,
  stuntedCount: 1,
  mealsLoggedToday: 5,
  pendingAlerts: 2,
};
