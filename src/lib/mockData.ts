export type ChildStatus = "Normal" | "Underweight" | "Overweight" | "Stunted";

export interface Child {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  name: string;
  birthDate: string;
  age: number;
  ageDisplay: string;
  gender: "Male" | "Female";
  weight: number;
  height: number;
  bmi: number;
  status: ChildStatus;
  avatar: string;
  parentName: string;
  createdByEmail?: string;
  updatedAt?: string;
}

export function getChildAgeParts(birthDate: string, today = new Date()) {
  const parsedBirthDate = new Date(`${birthDate}T00:00:00`);

  if (Number.isNaN(parsedBirthDate.getTime()) || parsedBirthDate > today) {
    return { years: 0, months: 0, isValid: false };
  }

  let totalMonths =
    (today.getFullYear() - parsedBirthDate.getFullYear()) * 12 +
    today.getMonth() -
    parsedBirthDate.getMonth();

  if (today.getDate() < parsedBirthDate.getDate()) {
    totalMonths -= 1;
  }

  totalMonths = Math.max(totalMonths, 0);

  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    isValid: true,
  };
}

export function formatChildAge(birthDate: string, today = new Date()) {
  const { years, months, isValid } = getChildAgeParts(birthDate, today);

  if (!isValid) return "";
  if (years === 0 && months === 0) return "Less than 1 month old";
  if (years === 0) return `${months} ${months === 1 ? "month" : "months"} old`;
  if (months === 0) return `${years} ${years === 1 ? "year" : "years"} old`;

  return `${years} ${years === 1 ? "year" : "years"} & ${months} ${months === 1 ? "month" : "months"}`;
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

export const seedChildren: Child[] = [
  {
    id: "1",
    firstName: "Maria",
    lastName: "Santos",
    name: "Maria Santos",
    birthDate: "2020-07-01",
    age: 5,
    ageDisplay: "5 years & 11 months",
    gender: "Female",
    weight: 17.2,
    height: 108,
    bmi: 14.7,
    status: "Normal",
    avatar: "MS",
    parentName: "Ana Santos",
    updatedAt: "2026-03-20",
  },
  {
    id: "2",
    firstName: "Juan",
    middleName: "dela",
    lastName: "Cruz",
    name: "Juan dela Cruz",
    birthDate: "2022-07-01",
    age: 3,
    ageDisplay: "3 years & 11 months",
    gender: "Male",
    weight: 11.8,
    height: 92,
    bmi: 13.9,
    status: "Underweight",
    avatar: "JC",
    parentName: "Rosa dela Cruz",
    updatedAt: "2026-03-20",
  },
  {
    id: "3",
    firstName: "Sofia",
    lastName: "Reyes",
    name: "Sofia Reyes",
    birthDate: "2018-07-01",
    age: 7,
    ageDisplay: "7 years & 11 months",
    gender: "Female",
    weight: 28.5,
    height: 125,
    bmi: 18.2,
    status: "Overweight",
    avatar: "SR",
    parentName: "Elena Reyes",
    updatedAt: "2026-03-19",
  },
  {
    id: "4",
    firstName: "Miguel",
    lastName: "Garcia",
    name: "Miguel Garcia",
    birthDate: "2021-07-01",
    age: 4,
    ageDisplay: "4 years & 11 months",
    gender: "Male",
    weight: 14.1,
    height: 96,
    bmi: 15.3,
    status: "Normal",
    avatar: "MG",
    parentName: "Pedro Garcia",
    updatedAt: "2026-03-18",
  },
  {
    id: "5",
    firstName: "Isabella",
    lastName: "Cruz",
    name: "Isabella Cruz",
    birthDate: "2019-07-01",
    age: 6,
    ageDisplay: "6 years & 11 months",
    gender: "Female",
    weight: 16.5,
    height: 105,
    bmi: 15,
    status: "Stunted",
    avatar: "IC",
    parentName: "Lorna Cruz",
    updatedAt: "2026-03-18",
  },
  {
    id: "6",
    firstName: "Carlos",
    lastName: "Mendoza",
    name: "Carlos Mendoza",
    birthDate: "2023-07-01",
    age: 2,
    ageDisplay: "2 years & 11 months",
    gender: "Male",
    weight: 10.2,
    height: 82,
    bmi: 15.2,
    status: "Normal",
    avatar: "CM",
    parentName: "Margie Mendoza",
    updatedAt: "2026-03-17",
  },
];

export const seedMealEntries: MealEntry[] = [
  { id: "m1", childId: "1", date: "2026-03-20", mealType: "Breakfast", foods: ["Rice porridge", "Boiled egg", "Banana"], calories: 320, protein: 12, carbs: 48, fat: 8 },
  { id: "m2", childId: "1", date: "2026-03-20", mealType: "Lunch", foods: ["Rice", "Chicken adobo", "Mung beans"], calories: 450, protein: 22, carbs: 55, fat: 14 },
  { id: "m3", childId: "2", date: "2026-03-20", mealType: "Breakfast", foods: ["Bread", "Milk"], calories: 200, protein: 8, carbs: 30, fat: 5 },
  { id: "m4", childId: "3", date: "2026-03-20", mealType: "Lunch", foods: ["Rice", "Fried chicken", "Soda"], calories: 680, protein: 25, carbs: 72, fat: 28 },
  { id: "m5", childId: "4", date: "2026-03-20", mealType: "Breakfast", foods: ["Oatmeal", "Papaya", "Milk"], calories: 280, protein: 10, carbs: 42, fat: 6 },
];

export const seedGrowthData: Record<string, GrowthRecord[]> = {
  "1": [
    { date: "2025-09", weight: 15.8, height: 104 },
    { date: "2025-11", weight: 16.2, height: 105 },
    { date: "2026-01", weight: 16.8, height: 107 },
    { date: "2026-03", weight: 17.2, height: 108 },
  ],
  "2": [
    { date: "2025-09", weight: 10.5, height: 88 },
    { date: "2025-11", weight: 11, height: 89 },
    { date: "2026-01", weight: 11.4, height: 91 },
    { date: "2026-03", weight: 11.8, height: 92 },
  ],
};
