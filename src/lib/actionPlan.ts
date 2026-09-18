import type { Child, ChildStatus, GrowthRecord, MealEntry } from "./mockData";

export type ActionPlanSeverity = "Information" | "Monitor" | "Priority follow-up";

export interface ActionPlanRecord {
  childId: string;
  severity: ActionPlanSeverity;
  summary: string;
  recommendations: string[];
  followUpDate: string;
  targetSummary: string;
  bhwNotes: string;
  completedAt?: string;
  updatedAt?: string;
}

export interface ActionPlanUpdate {
  bhwNotes?: string;
  completedAt?: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

function dateFrom(value: string) {
  const date = new Date(`${value.length === 7 ? `${value}-01` : value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function daysSince(date: string, today: Date) {
  const parsed = dateFrom(date);
  return parsed ? Math.floor((today.getTime() - parsed.getTime()) / DAY_MS) : Number.POSITIVE_INFINITY;
}

function basePlan(child: Child, severity: ActionPlanSeverity, followUpDays: number, targetSummary: string, recommendations: string[], today: Date): ActionPlanRecord {
  return {
    childId: child.id,
    severity,
    summary: `${child.name} is currently ${child.status.toLowerCase()} and needs ${severity === "Priority follow-up" ? "priority follow-up" : severity === "Monitor" ? "continued monitoring" : "routine monitoring"}.`,
    recommendations,
    followUpDate: formatDate(addDays(today, followUpDays)),
    targetSummary,
    bhwNotes: "",
  };
}

export function buildNutritionActionPlan(
  child: Child,
  meals: MealEntry[] = [],
  growthRecords: GrowthRecord[] = [],
  saved?: Partial<ActionPlanRecord>,
  today = new Date(),
): ActionPlanRecord & { mealTrackingNote?: string; overdue: boolean } {
  let plan: ActionPlanRecord;

  switch (child.status as ChildStatus) {
    case "Underweight":
      plan = basePlan(child, "Priority follow-up", 30, "Review weight against the next growth record; use an approved clinical standard for targets.", [
        "Add energy- and protein-rich foods to meals.",
        "Offer one healthy snack daily.",
        "Review recent meal consistency with the caregiver.",
      ], today);
      break;
    case "Overweight":
      plan = basePlan(child, "Monitor", 30, "Monitor height and weight trends rather than forcing rapid weight loss.", [
        "Review portions, sugary drinks, and frequent snacks.",
        "Encourage age-appropriate daily activity.",
        "Avoid restrictive dieting language for children.",
      ], today);
      break;
    case "Stunted":
      plan = basePlan(child, "Priority follow-up", 14, "Record a new height and weight measurement and document the follow-up outcome.", [
        "Review the height trend and meal quality.",
        "Ask the health worker about illness history and referral needs.",
        "Schedule an earlier growth review according to BHW guidance.",
      ], today);
      break;
    default:
      plan = basePlan(child, "Information", 60, "Maintain a stable growth trend and continue regular monitoring.", [
        "Maintain the current meal routine.",
        "Continue recording meals and growth measurements.",
        "Review the plan at the next routine check.",
      ], today);
  }

  const recentMeals = meals.filter((meal) => daysSince(meal.date, today) >= 0 && daysSince(meal.date, today) <= 7);
  const mealTrackingNote = recentMeals.length === 0 ? "Meal tracking needed: no meals were recorded in the last 7 days." : undefined;
  if (mealTrackingNote) plan.recommendations = [mealTrackingNote, ...plan.recommendations];

  if (recentMeals.length > 0) {
    const averageProtein = recentMeals.reduce((total, meal) => total + Number(meal.protein || 0), 0) / recentMeals.length;
    if (averageProtein < 8) plan.recommendations.unshift("Review protein sources with the caregiver, such as eggs, fish, beans, or milk where locally appropriate.");

    const processedFoodCount = recentMeals.flatMap((meal) => meal.foods).filter((food) => /soda|soft drink|candy|chips|sweetened/i.test(food)).length;
    if (processedFoodCount > 0) plan.recommendations.unshift("Review sugary drinks and processed snacks; use supportive, non-restrictive guidance for children.");

    const loggedDates = new Set(recentMeals.map((meal) => meal.date));
    const datesWithBreakfast = new Set(recentMeals.filter((meal) => meal.mealType === "Breakfast").map((meal) => meal.date));
    if (loggedDates.size >= 3 && datesWithBreakfast.size < loggedDates.size / 2) plan.recommendations.push("Discuss a more consistent meal schedule, including breakfast when possible.");
  }

  const merged = {
    ...plan,
    ...saved,
    childId: child.id,
    severity: plan.severity,
    summary: plan.summary,
    recommendations: plan.recommendations,
    targetSummary: plan.targetSummary,
  };
  const followUp = dateFrom(merged.followUpDate);
  const overdue = Boolean(followUp && followUp.getTime() < new Date(`${formatDate(today)}T00:00:00`).getTime() && !merged.completedAt);

  return { ...merged, mealTrackingNote, overdue };
}
