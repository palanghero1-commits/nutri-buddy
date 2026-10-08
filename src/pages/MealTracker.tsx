import { UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNutriData } from "@/hooks/useNutriData";
import { estimateMealNutrition } from "@/lib/foodNutrition";

const mealColors: Record<string, string> = { Breakfast: "bg-peach", Lunch: "bg-sage", Dinner: "bg-sky", Snack: "bg-lavender" };
const today = new Date().toISOString().slice(0, 10);

export default function MealTracker() {
  const { staffRole } = useAuth();
  const { mealEntries, children, addMealEntry } = useNutriData();
  const [selectedChild, setSelectedChild] = useState("all");
  const [form, setForm] = useState({ childId: "", date: today, mealType: "Breakfast", foods: "", servingGrams: "100" });
  const filtered = selectedChild === "all" ? mealEntries : mealEntries.filter((meal) => meal.childId === selectedChild);
  const getChildName = (id: string) => children.find((child) => child.id === id)?.name ?? "Unknown";
  const updateForm = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const foodNames = form.foods.split(",").map((food) => food.trim()).filter(Boolean);
  const estimate = estimateMealNutrition(foodNames, Number(form.servingGrams) || 0);

  const submitMeal = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.childId || !form.foods.trim()) return;
    if (estimate.recognizedFoods.length === 0) return;
    await addMealEntry({ childId: form.childId, date: form.date, mealType: form.mealType as "Breakfast" | "Lunch" | "Dinner" | "Snack", foods: foodNames, calories: estimate.calories, protein: estimate.protein, carbs: estimate.carbs, fat: estimate.fat });
    setForm({ childId: form.childId, date: today, mealType: "Breakfast", foods: "", servingGrams: "100" });
  };

  return <div>
    <div className="section-enter flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div><h1 className="text-2xl font-bold">Meal Tracker</h1><p className="mt-1 text-muted-foreground">Barangay feeding-program meal records</p></div>
      {staffRole === "bhw" ? <form onSubmit={submitMeal} className="grid w-full gap-3 rounded-xl bg-card p-4 shadow-sm sm:grid-cols-2 xl:w-auto xl:min-w-[700px] xl:grid-cols-3" aria-label="Add meal record">
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">Child<select required value={form.childId} onChange={(event) => updateForm("childId", event.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"><option value="">Select child</option>{children.map((child) => <option key={child.id} value={child.id}>{child.name}</option>)}</select></label>
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">Meal type<select value={form.mealType} onChange={(event) => updateForm("mealType", event.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option></select></label>
        <label className="grid gap-1 text-xs font-medium text-muted-foreground sm:col-span-2 xl:col-span-1">Foods<input required value={form.foods} onChange={(event) => updateForm("foods", event.target.value)} placeholder="e.g. rice, egg, banana" className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground" /></label>
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">Serving per food (g)<input required min="1" step="1" type="number" value={form.servingGrams} onChange={(event) => updateForm("servingGrams", event.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground" /></label>
        <div className="rounded-lg bg-[#f1f7ff] p-3 text-xs sm:col-span-2 xl:col-span-3" aria-live="polite">
          <p className="font-semibold text-[#1b2b55]">Estimated nutrition · {form.servingGrams || 0}g per listed food</p>
          <p className="mt-1 text-[#53698e]">{estimate.calories} kcal · Protein {estimate.protein}g · Carbs {estimate.carbs}g · Fat {estimate.fat}g</p>
          {estimate.unrecognizedFoods.length > 0 && <p className="mt-1 text-amber-700">Not recognized and excluded: {estimate.unrecognizedFoods.join(", ")}. Choose a supported food name.</p>}
          <p className="mt-1 text-[#7185a5]">Approximate values; preparation and actual portions can change nutrition.</p>
        </div>
        <div className="flex justify-end sm:col-span-2 xl:col-span-3"><Button type="submit" disabled={children.length === 0 || estimate.recognizedFoods.length === 0 || estimate.unrecognizedFoods.length > 0 || Number(form.servingGrams) <= 0}>Add Meal</Button></div>
      </form> : <span className="rounded-lg bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">View only — BHW adds meal records</span>}
    </div>
    <div className="mt-6 section-enter stagger-1"><select value={selectedChild} onChange={(event) => setSelectedChild(event.target.value)} className="w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm sm:w-auto sm:min-w-[220px]"><option value="all">All Children</option>{children.map((child) => <option key={child.id} value={child.id}>{child.name}</option>)}</select></div>
    <div className="mt-6 grid gap-4">{filtered.map((meal, index) => <div key={meal.id} className={`stat-card section-enter stagger-${(index % 5) + 1}`}><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="flex min-w-0 items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${mealColors[meal.mealType]}`}><UtensilsCrossed className="h-4 w-4 text-foreground/70" /></div><div className="min-w-0"><h3 className="text-sm font-semibold">{meal.mealType}</h3><p className="text-xs text-muted-foreground">{getChildName(meal.childId)} · {meal.date}</p></div></div><span className="text-sm font-bold text-primary">{meal.calories} kcal</span></div><div className="mt-3 flex flex-wrap gap-1.5">{meal.foods.map((food) => <span key={food} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{food}</span>)}</div><div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"><div className="rounded-lg bg-muted p-2 text-center"><p className="text-xs text-muted-foreground">Protein</p><p className="text-sm font-semibold">{meal.protein}g</p></div><div className="rounded-lg bg-muted p-2 text-center"><p className="text-xs text-muted-foreground">Carbs</p><p className="text-sm font-semibold">{meal.carbs}g</p></div><div className="rounded-lg bg-muted p-2 text-center"><p className="text-xs text-muted-foreground">Fat</p><p className="text-sm font-semibold">{meal.fat}g</p></div></div></div>)}</div>
  </div>;
}
