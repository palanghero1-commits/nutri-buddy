import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  seedChildren,
  seedGrowthData,
  seedMealEntries,
  type Alert,
  type Child,
  type ChildStatus,
  type GrowthRecord,
  type MealEntry,
} from "@/lib/mockData";

type AddChildInput = {
  name: string;
  age: number;
  gender: Child["gender"];
  weight: number;
  height: number;
  parentName: string;
  createdByEmail?: string;
};

type AddMealInput = {
  childId: string;
  date: string;
  mealType: MealEntry["mealType"];
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type AddGrowthRecordInput = {
  childId: string;
  date: string;
  weight: number;
  height: number;
};

type DashboardStats = {
  totalChildren: number;
  normalCount: number;
  underweightCount: number;
  overweightCount: number;
  stuntedCount: number;
  mealsLoggedToday: number;
  pendingAlerts: number;
};

type NutriDataContextType = {
  children: Child[];
  mealEntries: MealEntry[];
  growthData: Record<string, GrowthRecord[]>;
  alerts: Alert[];
  dashboardStats: DashboardStats;
  addChild: (input: AddChildInput) => void;
  addMealEntry: (input: AddMealInput) => void;
  addGrowthRecord: (input: AddGrowthRecordInput) => void;
};

const STORAGE_KEYS = {
  children: "nutri-children",
  meals: "nutri-meals",
  growth: "nutri-growth",
} as const;

const NutriDataContext = createContext<NutriDataContextType | null>(null);

function loadStorage<T>(key: string, fallback: T): T {
  const stored = localStorage.getItem(key);
  if (!stored) return fallback;

  try {
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

function toFixedNumber(value: number, digits = 1) {
  return Number(value.toFixed(digits));
}

function calculateBmi(weight: number, height: number) {
  const meters = height / 100;
  if (!meters) return 0;
  return toFixedNumber(weight / (meters * meters));
}

function getHeightThreshold(age: number) {
  if (age <= 2) return 82;
  if (age <= 3) return 89;
  if (age <= 4) return 96;
  if (age <= 5) return 103;
  if (age <= 6) return 109;
  return 115;
}

function deriveStatus(age: number, height: number, bmi: number): ChildStatus {
  if (height < getHeightThreshold(age)) return "Stunted";
  if (bmi < 14) return "Underweight";
  if (bmi > 18) return "Overweight";
  return "Normal";
}

function createAvatar(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getLatestMealDate(entries: MealEntry[]) {
  if (entries.length === 0) {
    return new Date().toISOString().slice(0, 10);
  }

  return [...entries]
    .map((entry) => entry.date)
    .sort((a, b) => a.localeCompare(b))
    .at(-1)!;
}

function deriveAlerts(children: Child[]): Alert[] {
  return children
    .map((child) => {
      const base = {
        id: `alert-${child.id}`,
        childId: child.id,
        childName: child.name,
        date: child.updatedAt ?? new Date().toISOString().slice(0, 10),
      };

      if (child.status === "Stunted") {
        return {
          ...base,
          type: "critical" as const,
          message: "Height trend is below the expected range. Review growth monitoring and consider medical follow-up.",
          read: false,
        };
      }

      if (child.status === "Underweight") {
        return {
          ...base,
          type: "warning" as const,
          message: "Weight is below the expected range. Review meal intake and calorie density.",
          read: false,
        };
      }

      if (child.status === "Overweight") {
        return {
          ...base,
          type: "warning" as const,
          message: "BMI is above the expected range. Review portions, snacks, and activity routines.",
          read: false,
        };
      }

      return {
        ...base,
        type: "info" as const,
        message: "Growth is currently on track. Maintain the present nutrition plan.",
        read: true,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

function deriveDashboardStats(children: Child[], meals: MealEntry[], alerts: Alert[]): DashboardStats {
  const latestMealDate = getLatestMealDate(meals);

  return {
    totalChildren: children.length,
    normalCount: children.filter((child) => child.status === "Normal").length,
    underweightCount: children.filter((child) => child.status === "Underweight").length,
    overweightCount: children.filter((child) => child.status === "Overweight").length,
    stuntedCount: children.filter((child) => child.status === "Stunted").length,
    mealsLoggedToday: meals.filter((meal) => meal.date === latestMealDate).length,
    pendingAlerts: alerts.filter((alert) => !alert.read).length,
  };
}

export function NutriDataProvider({ children }: { children: ReactNode }) {
  const [childProfiles, setChildProfiles] = useState<Child[]>(() => loadStorage(STORAGE_KEYS.children, seedChildren));
  const [mealEntries, setMealEntries] = useState<MealEntry[]>(() => loadStorage(STORAGE_KEYS.meals, seedMealEntries));
  const [growthData, setGrowthData] = useState<Record<string, GrowthRecord[]>>(() =>
    loadStorage(STORAGE_KEYS.growth, seedGrowthData),
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.children, JSON.stringify(childProfiles));
  }, [childProfiles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.meals, JSON.stringify(mealEntries));
  }, [mealEntries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.growth, JSON.stringify(growthData));
  }, [growthData]);

  const addChild = (input: AddChildInput) => {
    const bmi = calculateBmi(input.weight, input.height);
    const today = new Date().toISOString().slice(0, 10);
    const nextChild: Child = {
      id: createId("child"),
      name: input.name.trim(),
      age: input.age,
      gender: input.gender,
      weight: toFixedNumber(input.weight),
      height: toFixedNumber(input.height),
      bmi,
      status: deriveStatus(input.age, input.height, bmi),
      avatar: createAvatar(input.name),
      parentName: input.parentName.trim(),
      createdByEmail: input.createdByEmail,
      updatedAt: today,
    };

    setChildProfiles((current) => [nextChild, ...current]);
    setGrowthData((current) => ({
      ...current,
      [nextChild.id]: [{ date: today, weight: nextChild.weight, height: nextChild.height }],
    }));
  };

  const addMealEntry = (input: AddMealInput) => {
    const nextMeal: MealEntry = {
      id: createId("meal"),
      childId: input.childId,
      date: input.date,
      mealType: input.mealType,
      foods: input.foods,
      calories: input.calories,
      protein: input.protein,
      carbs: input.carbs,
      fat: input.fat,
    };

    setMealEntries((current) => [nextMeal, ...current]);
  };

  const addGrowthRecord = (input: AddGrowthRecordInput) => {
    setGrowthData((current) => {
      const existing = current[input.childId] ?? [];
      const nextRecord: GrowthRecord = {
        date: input.date,
        weight: toFixedNumber(input.weight),
        height: toFixedNumber(input.height),
      };

      const nextRecords = [...existing, nextRecord].sort((a, b) => a.date.localeCompare(b.date));
      return {
        ...current,
        [input.childId]: nextRecords,
      };
    });

    setChildProfiles((current) =>
      current.map((child) => {
        if (child.id !== input.childId) return child;

        const bmi = calculateBmi(input.weight, input.height);
        return {
          ...child,
          weight: toFixedNumber(input.weight),
          height: toFixedNumber(input.height),
          bmi,
          status: deriveStatus(child.age, input.height, bmi),
          updatedAt: input.date,
        };
      }),
    );
  };

  const alerts = useMemo(() => deriveAlerts(childProfiles), [childProfiles]);
  const dashboardStats = useMemo(
    () => deriveDashboardStats(childProfiles, mealEntries, alerts),
    [alerts, childProfiles, mealEntries],
  );

  return (
    <NutriDataContext.Provider
      value={{
        children: childProfiles,
        mealEntries,
        growthData,
        alerts,
        dashboardStats,
        addChild,
        addMealEntry,
        addGrowthRecord,
      }}
    >
      {children}
    </NutriDataContext.Provider>
  );
}

export function useNutriData() {
  const context = useContext(NutriDataContext);

  if (!context) {
    throw new Error("useNutriData must be used within NutriDataProvider.");
  }

  return context;
}
