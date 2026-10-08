import { describe, expect, it } from "vitest";
import { estimateMealNutrition } from "@/lib/foodNutrition";

describe("meal nutrition estimates", () => {
  it("estimates a 100g cooked rice serving", () => {
    expect(estimateMealNutrition(["rice"], 100)).toMatchObject({ calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, recognizedFoods: ["rice"], unrecognizedFoods: [] });
  });

  it("updates all estimates when the serving size changes", () => {
    expect(estimateMealNutrition(["rice"], 200)).toMatchObject({ calories: 260, protein: 5.4, carbs: 56.4, fat: 0.6 });
  });

  it("adds estimates for multiple listed foods", () => {
    expect(estimateMealNutrition(["rice", "egg"], 100)).toMatchObject({ calories: 285, protein: 15.3, carbs: 29.3, fat: 10.9 });
  });

  it("reports unsupported foods instead of silently counting them as zero", () => {
    expect(estimateMealNutrition(["rice", "chicken adobo"], 100)).toMatchObject({ calories: 130, recognizedFoods: ["rice"], unrecognizedFoods: ["chicken adobo"] });
  });

  it("does not return negative or non-finite nutrition for invalid portions", () => {
    expect(estimateMealNutrition(["rice"], -10)).toMatchObject({ calories: 0, protein: 0, carbs: 0, fat: 0, unrecognizedFoods: ["rice"] });
    expect(estimateMealNutrition(["rice"], Number.NaN).calories).toBe(0);
  });
});
