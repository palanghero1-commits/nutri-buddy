import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  formatChildAge,
  getBhwForArea,
  getBhwForAddress,
  getChildAgeParts,
  type Alert,
  type Child,
  type ChildStatus,
  type GrowthRecord,
  type MealEntry,
} from "@/lib/mockData";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { buildNutritionActionPlan, type ActionPlanRecord, type ActionPlanUpdate } from "@/lib/actionPlan";

type AddChildInput = {
  firstName: string;
  middleName?: string;
  lastName: string;
  birthDate: string;
  gender: Child["gender"];
  weight: number;
  height: number;
  parentName: string;
  guardianType: Child["guardianType"];
  motherName: string;
  fatherName: string;
  address: string;
  guardianAddress: Child["guardianAddress"];
  assignedArea: string;
  allergies?: string;
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
  actionPlans: Record<string, ActionPlanRecord & { overdue: boolean }>;
  alerts: Alert[];
  dashboardStats: DashboardStats;
  addChild: (input: AddChildInput) => Promise<void>;
  updateChild: (childId: string, input: AddChildInput) => Promise<void>;
  addMealEntry: (input: AddMealInput) => Promise<void>;
  addGrowthRecord: (input: AddGrowthRecordInput) => Promise<void>;
  updateActionPlan: (childId: string, update: ActionPlanUpdate) => Promise<void>;
};

type NutritionResponse = {
  children: Child[];
  mealEntries: MealEntry[];
  growthData: Record<string, GrowthRecord[]>;
  actionPlans?: ActionPlanRecord[];
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

function createFullName(firstName: string, middleName: string | undefined, lastName: string) {
  return [firstName, middleName, lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] ?? "",
    middleName: parts.length > 2 ? parts.slice(1, -1).join(" ") : undefined,
    lastName: parts.length > 1 ? parts.at(-1)! : "",
  };
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

function deriveAlerts(children: Child[], actionPlans: Record<string, ActionPlanRecord & { overdue: boolean }>): Alert[] {
  const statusAlerts = children
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

  const planAlerts = children
    .map((child) => {
      const plan = actionPlans[child.id];
      if (!plan || plan.completedAt || (plan.severity !== "Priority follow-up" && !plan.overdue)) return null;
      return {
        id: `action-plan-${child.id}`,
        childId: child.id,
        childName: child.name,
        type: plan.overdue ? "critical" as const : "warning" as const,
        message: plan.overdue
          ? `Action plan follow-up is overdue since ${plan.followUpDate}. Review the child record and update the plan.`
          : `${plan.summary} Follow-up is scheduled for ${plan.followUpDate}.`,
        date: plan.followUpDate,
        read: false,
      };
    })
    .filter(Boolean) as Alert[];

  return [...planAlerts, ...statusAlerts].sort((a, b) => b.date.localeCompare(a.date));
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
  const { staffRole, staffUser } = useAuth();
  const [childProfiles, setChildProfiles] = useState<Child[]>(() => loadStorage(STORAGE_KEYS.children, []));
  const [mealEntries, setMealEntries] = useState<MealEntry[]>(() => loadStorage(STORAGE_KEYS.meals, []));
  const [growthData, setGrowthData] = useState<Record<string, GrowthRecord[]>>(() =>
    loadStorage(STORAGE_KEYS.growth, {}),
  );
  const [actionPlanRecords, setActionPlanRecords] = useState<Record<string, ActionPlanRecord>>({});
  const [isDemoFallbackActive, setIsDemoFallbackActive] = useState(false);

  useEffect(() => {
    let isActive = true;

    apiRequest<NutritionResponse>("/api/nutrition")
      .then((data) => {
        if (!isActive) return;
        setChildProfiles(data.children);
        setMealEntries(data.mealEntries);
        setGrowthData(data.growthData);
        setActionPlanRecords(Object.fromEntries((data.actionPlans ?? []).map((plan) => [plan.childId, plan])));
        setIsDemoFallbackActive(false);
      })
      .catch((error) => {
        if (!isActive) return;
        console.error("Nutrition database unavailable.", error);
        setChildProfiles([]);
        setMealEntries([]);
        setGrowthData({});
        setIsDemoFallbackActive(true);
      });

    return () => {
      isActive = false;
    };
  }, []);
  const childrenWithCurrentAges = useMemo(
    () =>
      childProfiles.map((child) => {
        const nameParts = splitName(child.name);
        const derivedBhw = child.assignedArea
          ? getBhwForArea(child.assignedArea)
          : getBhwForAddress(child.guardianAddress || child.address);
        const normalizedChild = {
          ...child,
          firstName: child.firstName || nameParts.firstName,
          middleName: child.middleName || nameParts.middleName,
          lastName: child.lastName || nameParts.lastName,
          motherName: child.motherName || child.parentName,
          fatherName: child.fatherName || child.parentName,
          address: child.address || "",
          guardianType: child.guardianType,
          guardianAddress: child.guardianAddress,
          assignedArea: child.assignedArea || derivedBhw.area,
          assignedBhwName: child.assignedBhwName || derivedBhw.bhwName,
          assignedBhwEmail: child.assignedBhwEmail || derivedBhw.bhwEmail,
          allergies: child.allergies || "",
        };

        if (!child.birthDate) {
          return {
            ...normalizedChild,
            ageDisplay: child.ageDisplay || `${child.age} years old`,
          };
        }

        return {
          ...normalizedChild,
          age: getChildAgeParts(child.birthDate).years,
          ageDisplay: formatChildAge(child.birthDate),
        };
      }),
    [childProfiles],
  );

  const visibleChildren = useMemo(() => {
    if (staffRole !== "bhw" || !staffUser?.assignedArea) {
      return childrenWithCurrentAges;
    }

    return childrenWithCurrentAges.filter((child) => child.assignedArea === staffUser.assignedArea);
  }, [childrenWithCurrentAges, staffRole, staffUser?.assignedArea]);

  const visibleMealEntries = useMemo(() => {
    if (staffRole !== "bhw") {
      return mealEntries;
    }

    const visibleChildIds = new Set(visibleChildren.map((child) => child.id));
    return mealEntries.filter((meal) => visibleChildIds.has(meal.childId));
  }, [mealEntries, staffRole, visibleChildren]);

  const visibleGrowthData = useMemo(() => {
    if (staffRole !== "bhw") {
      return growthData;
    }

    const visibleChildIds = new Set(visibleChildren.map((child) => child.id));
    return Object.fromEntries(Object.entries(growthData).filter(([childId]) => visibleChildIds.has(childId)));
  }, [growthData, staffRole, visibleChildren]);

  const actionPlans = useMemo(
    () => Object.fromEntries(visibleChildren.map((child) => [child.id, buildNutritionActionPlan(child, visibleMealEntries.filter((meal) => meal.childId === child.id), visibleGrowthData[child.id] ?? [], actionPlanRecords[child.id])])),
    [actionPlanRecords, visibleChildren, visibleGrowthData, visibleMealEntries],
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

  const addChild = async (input: AddChildInput) => {
    const bmi = calculateBmi(input.weight, input.height);
    const today = new Date().toISOString().slice(0, 10);
    const firstName = input.firstName.trim();
    const middleName = input.middleName?.trim();
    const lastName = input.lastName.trim();
    const name = createFullName(firstName, middleName, lastName);
    const age = getChildAgeParts(input.birthDate).years;
    const ageDisplay = formatChildAge(input.birthDate);
    const assignedBhw = getBhwForArea(input.assignedArea);
    const nextChild: Child = {
      id: createId("child"),
      firstName,
      middleName,
      lastName,
      name,
      birthDate: input.birthDate,
      age,
      ageDisplay,
      gender: input.gender,
      weight: toFixedNumber(input.weight),
      height: toFixedNumber(input.height),
      bmi,
      status: deriveStatus(age, input.height, bmi),
      avatar: createAvatar(name),
      parentName: input.parentName.trim(),
      guardianType: input.guardianType,
      motherName: input.motherName.trim(),
      fatherName: input.fatherName.trim() || "Not recorded",
      address: input.address.trim(),
      guardianAddress: input.guardianAddress,
      assignedArea: assignedBhw.area,
      assignedBhwName: assignedBhw.bhwName,
      assignedBhwEmail: assignedBhw.bhwEmail,
      allergies: input.allergies?.trim() || "",
      createdByEmail: input.createdByEmail,
      updatedAt: today,
    };

    const initialGrowthRecord = { date: today, weight: nextChild.weight, height: nextChild.height };

    setChildProfiles((current) => [nextChild, ...current]);
    setGrowthData((current) => ({
      ...current,
      [nextChild.id]: [initialGrowthRecord],
    }));

    try {
      await apiRequest<{ child: Child }>("/api/children", {
        method: "POST",
        body: JSON.stringify({ child: nextChild, growthRecord: initialGrowthRecord }),
      });
    } catch (error) {
      console.error("Unable to save child to MySQL API.", error);
    }
  };

  const buildChildFromInput = (input: AddChildInput, existingChild?: Child): Child => {
    const bmi = calculateBmi(input.weight, input.height);
    const today = new Date().toISOString().slice(0, 10);
    const firstName = input.firstName.trim();
    const middleName = input.middleName?.trim();
    const lastName = input.lastName.trim();
    const name = createFullName(firstName, middleName, lastName);
    const age = getChildAgeParts(input.birthDate).years;
    const ageDisplay = formatChildAge(input.birthDate);
    const assignedBhw = getBhwForArea(input.assignedArea);

    return {
      id: existingChild?.id ?? createId("child"),
      firstName,
      middleName,
      lastName,
      name,
      birthDate: input.birthDate,
      age,
      ageDisplay,
      gender: input.gender,
      weight: toFixedNumber(input.weight),
      height: toFixedNumber(input.height),
      bmi,
      status: deriveStatus(age, input.height, bmi),
      avatar: createAvatar(name),
      parentName: input.parentName.trim(),
      guardianType: input.guardianType,
      motherName: input.motherName.trim(),
      fatherName: input.fatherName.trim() || "Not recorded",
      address: input.address.trim(),
      guardianAddress: input.guardianAddress,
      assignedArea: assignedBhw.area,
      assignedBhwName: assignedBhw.bhwName,
      assignedBhwEmail: assignedBhw.bhwEmail,
      allergies: input.allergies?.trim() || "",
      createdByEmail: existingChild?.createdByEmail ?? input.createdByEmail,
      updatedAt: today,
    };
  };

  const updateChild = async (childId: string, input: AddChildInput) => {
    const existingChild = childProfiles.find((child) => child.id === childId);
    if (!existingChild) return;

    const updatedChild = buildChildFromInput(input, existingChild);

    setChildProfiles((current) =>
      current.map((child) => (child.id === childId ? updatedChild : child)),
    );

    try {
      await apiRequest<{ child: Child }>(`/api/children/${encodeURIComponent(childId)}`, {
        method: "PUT",
        body: JSON.stringify({ child: updatedChild }),
      });
    } catch (error) {
      console.error("Unable to update child in MySQL API.", error);
    }
  };

  const addMealEntry = async (input: AddMealInput) => {
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

    try {
      await apiRequest<{ meal: MealEntry }>("/api/meals", {
        method: "POST",
        body: JSON.stringify({ meal: nextMeal }),
      });
    } catch (error) {
      console.error("Unable to save meal to MySQL API.", error);
    }
  };

  const addGrowthRecord = async (input: AddGrowthRecordInput) => {
    const currentChild = childProfiles.find((child) => child.id === input.childId);
    if (!currentChild) return;

    const bmi = calculateBmi(input.weight, input.height);
    const age = currentChild.birthDate ? getChildAgeParts(currentChild.birthDate).years : currentChild.age;
    const ageDisplay = currentChild.birthDate ? formatChildAge(currentChild.birthDate) : currentChild.ageDisplay;
    const updatedChild: Child = {
      ...currentChild,
      age,
      ageDisplay,
      weight: toFixedNumber(input.weight),
      height: toFixedNumber(input.height),
      bmi,
      status: deriveStatus(age, input.height, bmi),
      updatedAt: input.date,
    };
    const nextRecord: GrowthRecord = {
      date: input.date,
      weight: toFixedNumber(input.weight),
      height: toFixedNumber(input.height),
    };

    setGrowthData((current) => {
      const existing = current[input.childId] ?? [];
      const nextRecords = [...existing, nextRecord].sort((a, b) => a.date.localeCompare(b.date));
      return {
        ...current,
        [input.childId]: nextRecords,
      };
    });

    setChildProfiles((current) =>
      current.map((child) => (child.id === input.childId ? updatedChild : child)),
    );

    try {
      await apiRequest<{ record: GrowthRecord; child: Child }>("/api/growth-records", {
        method: "POST",
        body: JSON.stringify({ childId: input.childId, record: nextRecord, child: updatedChild }),
      });
    } catch (error) {
      console.error("Unable to save growth record to MySQL API.", error);
    }
  };

  const updateActionPlan = async (childId: string, update: ActionPlanUpdate) => {
    const currentPlan = actionPlans[childId];
    if (!currentPlan) return;

    const nextPlan = {
      ...currentPlan,
      ...update,
      childId,
      completedAt: update.completedAt === null ? undefined : update.completedAt ?? currentPlan.completedAt,
    };
    setActionPlanRecords((current) => ({ ...current, [childId]: nextPlan }));

    try {
      const result = await apiRequest<{ plan: ActionPlanRecord }>(`/api/children/${encodeURIComponent(childId)}/action-plan`, {
        method: "PUT",
        body: JSON.stringify({ plan: nextPlan }),
      });
      setActionPlanRecords((current) => ({ ...current, [childId]: result.plan }));
    } catch (error) {
      console.error("Unable to save nutrition action plan.", error);
    }
  };

  const alerts = useMemo(() => deriveAlerts(visibleChildren, actionPlans), [actionPlans, visibleChildren]);
  const dashboardStats = useMemo(
    () => deriveDashboardStats(visibleChildren, visibleMealEntries, alerts),
    [alerts, visibleChildren, visibleMealEntries],
  );

  return (
    <NutriDataContext.Provider
      value={{
        children: visibleChildren,
        mealEntries: visibleMealEntries,
        growthData: visibleGrowthData,
        actionPlans,
        alerts,
        dashboardStats,
        addChild,
        updateChild,
        addMealEntry,
        addGrowthRecord,
        updateActionPlan,
      }}
    >
      {isDemoFallbackActive && (
        <div className="sr-only" aria-live="polite">
          Demo data mode active because the production nutrition API is unavailable.
        </div>
      )}
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
