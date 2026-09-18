import { describe, expect, it } from "vitest";
import { buildNutritionActionPlan } from "@/lib/actionPlan";
import type { Child } from "@/lib/mockData";

const child = (status: Child["status"]): Child => ({
  id: `child-${status.toLowerCase()}`,
  firstName: "Test",
  lastName: "Child",
  name: "Test Child",
  birthDate: "2020-01-01",
  age: 6,
  ageDisplay: "6 years old",
  gender: "Female",
  weight: 18,
  height: 110,
  bmi: 14.9,
  status,
  avatar: "TC",
  parentName: "Parent",
  motherName: "Parent",
  fatherName: "Not recorded",
  address: "Barangay Tinampa-an, Cadiz City",
  assignedArea: "Purok 1 - Riverside",
  assignedBhwName: "BHW Demo",
  assignedBhwEmail: "bhw@nutritrack.gov.ph",
  allergies: "",
});

describe("nutrition action plans", () => {
  const today = new Date("2026-09-18T00:00:00");

  it("creates a priority plan for underweight children", () => {
    const plan = buildNutritionActionPlan(child("Underweight"), [], [], undefined, today);

    expect(plan.severity).toBe("Priority follow-up");
    expect(plan.followUpDate).toBe("2026-10-18");
    expect(plan.recommendations[0]).toContain("Meal tracking needed");
  });

  it("creates different monitoring plans for overweight and stunted children", () => {
    expect(buildNutritionActionPlan(child("Overweight"), [], [], undefined, today).severity).toBe("Monitor");
    expect(buildNutritionActionPlan(child("Stunted"), [], [], undefined, today).followUpDate).toBe("2026-10-02");
  });

  it("preserves BHW notes and detects overdue follow-up", () => {
    const plan = buildNutritionActionPlan(child("Underweight"), [], [], {
      followUpDate: "2026-09-01",
      bhwNotes: "Discussed meal schedule with caregiver.",
    }, today);

    expect(plan.bhwNotes).toContain("Discussed meal schedule");
    expect(plan.overdue).toBe(true);
  });

  it("adds meal-based guidance when recent meals show risk signals", () => {
    const meals = [
      { id: "m1", childId: "child-underweight", date: "2026-09-18", mealType: "Lunch" as const, foods: ["Rice", "Soda"], calories: 300, protein: 4, carbs: 50, fat: 4 },
      { id: "m2", childId: "child-underweight", date: "2026-09-17", mealType: "Lunch" as const, foods: ["Rice", "Chips"], calories: 300, protein: 5, carbs: 50, fat: 4 },
      { id: "m3", childId: "child-underweight", date: "2026-09-16", mealType: "Dinner" as const, foods: ["Rice"], calories: 300, protein: 5, carbs: 50, fat: 4 },
    ];
    const plan = buildNutritionActionPlan(child("Underweight"), meals, [], undefined, today);

    expect(plan.recommendations.some((item) => item.includes("protein sources"))).toBe(true);
    expect(plan.recommendations.some((item) => item.includes("sugary drinks"))).toBe(true);
    expect(plan.recommendations.some((item) => item.includes("meal schedule"))).toBe(true);
  });
});
