import { mealEntries, children } from "@/lib/mockData";
import { Plus, UtensilsCrossed } from "lucide-react";
import { useState } from "react";

const mealColors: Record<string, string> = {
  Breakfast: "bg-peach",
  Lunch: "bg-sage",
  Dinner: "bg-sky",
  Snack: "bg-lavender",
};

export default function MealTracker() {
  const [selectedChild, setSelectedChild] = useState("all");

  const filtered = selectedChild === "all"
    ? mealEntries
    : mealEntries.filter((m) => m.childId === selectedChild);

  const getChildName = (id: string) => children.find((c) => c.id === id)?.name ?? "Unknown";

  return (
    <div>
      <div className="flex items-center justify-between section-enter">
        <div>
          <h1 className="text-2xl font-bold">Meal Tracker</h1>
          <p className="text-muted-foreground mt-1">Track daily food intake and nutrition</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 active:scale-[0.97] transition-all">
          <Plus className="w-4 h-4" /> Log Meal
        </button>
      </div>

      <div className="mt-6 section-enter stagger-1">
        <select
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
        >
          <option value="all">All Children</option>
          {children.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 mt-6">
        {filtered.map((meal, i) => (
          <div key={meal.id} className={`stat-card section-enter stagger-${(i % 5) + 1}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${mealColors[meal.mealType]} flex items-center justify-center`}>
                  <UtensilsCrossed className="w-4 h-4 text-foreground/70" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{meal.mealType}</h3>
                  <p className="text-xs text-muted-foreground">{getChildName(meal.childId)} • {meal.date}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-primary">{meal.calories} kcal</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {meal.foods.map((food) => (
                <span key={food} className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                  {food}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-2 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Protein</p>
                <p className="text-sm font-semibold">{meal.protein}g</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Carbs</p>
                <p className="text-sm font-semibold">{meal.carbs}g</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">Fat</p>
                <p className="text-sm font-semibold">{meal.fat}g</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
