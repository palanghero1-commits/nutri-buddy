import { CalendarDays, Salad } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useNutriData } from "@/hooks/useNutriData";

const today = new Date().toISOString().slice(0, 10);

export default function UserMealsPage() {
  const { currentUser } = useAuth();
  const { children, mealEntries, addMealEntry } = useNutriData();
  const [isMealDialogOpen, setIsMealDialogOpen] = useState(false);
  const [mealForm, setMealForm] = useState({
    childId: "",
    date: today,
    mealType: "Breakfast",
    foods: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });
  const myChildren = children.filter((child) => child.createdByEmail === currentUser?.email);
  const myChildIds = new Set(myChildren.map((child) => child.id));
  const childNames = new Map(myChildren.map((child) => [child.id, child.name]));
  const myMeals = mealEntries
    .filter((meal) => myChildIds.has(meal.childId))
    .sort((a, b) => b.date.localeCompare(a.date));

  useEffect(() => {
    if (!mealForm.childId && myChildren.length > 0) {
      setMealForm((current) => ({ ...current, childId: myChildren[0].id }));
    }
  }, [mealForm.childId, myChildren]);

  const handleAddMeal = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    addMealEntry({
      childId: mealForm.childId,
      date: mealForm.date,
      mealType: mealForm.mealType as "Breakfast" | "Lunch" | "Dinner" | "Snack",
      foods: mealForm.foods.split(",").map((food) => food.trim()).filter(Boolean),
      calories: Number(mealForm.calories),
      protein: Number(mealForm.protein),
      carbs: Number(mealForm.carbs),
      fat: Number(mealForm.fat),
    });

    setMealForm((current) => ({
      ...current,
      date: today,
      mealType: "Breakfast",
      foods: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    }));
    setIsMealDialogOpen(false);
  };

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:py-9">
        <section className="section-enter rounded-xl border border-border/70 bg-card p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-peach px-3 py-1 text-xs font-semibold text-warning-foreground">
                <Salad className="h-3.5 w-3.5" />
                Meal records
              </div>
              <h1 className="mt-4 text-3xl font-bold leading-tight text-foreground">Meals</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Review meal entries submitted from your account.
              </p>
            </div>
            <Button onClick={() => setIsMealDialogOpen(true)} disabled={myChildren.length === 0}>
              Log Meal
            </Button>
          </div>
        </section>

        <section className="mt-5 rounded-xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Meal History</h2>
              <p className="mt-1 text-sm text-muted-foreground">{myMeals.length} meal entries saved.</p>
            </div>
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </div>

          {myMeals.length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-border bg-muted/50 p-5 text-sm text-muted-foreground">
              Meal entries will appear here after you log the first meal.
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              {myMeals.map((meal) => (
                <div key={meal.id} className="rounded-lg bg-muted/60 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{meal.mealType}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{childNames.get(meal.childId) ?? "Child record"}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{meal.foods.join(", ")}</p>
                    </div>
                    <div className="text-sm sm:text-right">
                      <p className="font-bold text-primary">{meal.calories} kcal</p>
                      <p className="mt-1 text-xs text-muted-foreground">{meal.date}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Protein {meal.protein}g - Carbs {meal.carbs}g - Fat {meal.fat}g
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Dialog open={isMealDialogOpen} onOpenChange={setIsMealDialogOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Log Meal</DialogTitle>
            <DialogDescription>Add a meal entry without leaving the Meals page.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMeal} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-foreground sm:col-span-2">
                Child
                <select
                  required
                  disabled={myChildren.length === 0}
                  value={mealForm.childId}
                  onChange={(event) => setMealForm((current) => ({ ...current, childId: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 disabled:opacity-60"
                >
                  <option value="">Select child</option>
                  {myChildren.map((child) => (
                    <option key={child.id} value={child.id}>{child.name}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-foreground">
                Date
                <input
                  required
                  type="date"
                  value={mealForm.date}
                  onChange={(event) => setMealForm((current) => ({ ...current, date: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5"
                />
              </label>
              <label className="text-sm text-foreground">
                Meal Type
                <select
                  value={mealForm.mealType}
                  onChange={(event) => setMealForm((current) => ({ ...current, mealType: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </select>
              </label>
              <label className="text-sm text-foreground sm:col-span-2">
                Foods
                <input
                  required
                  placeholder="Rice, fish, banana"
                  value={mealForm.foods}
                  onChange={(event) => setMealForm((current) => ({ ...current, foods: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5"
                />
              </label>
              <label className="text-sm text-foreground">
                Calories
                <input required min="0" type="number" value={mealForm.calories} onChange={(event) => setMealForm((current) => ({ ...current, calories: event.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5" />
              </label>
              <label className="text-sm text-foreground">
                Protein (g)
                <input required min="0" type="number" value={mealForm.protein} onChange={(event) => setMealForm((current) => ({ ...current, protein: event.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5" />
              </label>
              <label className="text-sm text-foreground">
                Carbs (g)
                <input required min="0" type="number" value={mealForm.carbs} onChange={(event) => setMealForm((current) => ({ ...current, carbs: event.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5" />
              </label>
              <label className="text-sm text-foreground">
                Fat (g)
                <input required min="0" type="number" value={mealForm.fat} onChange={(event) => setMealForm((current) => ({ ...current, fat: event.target.value }))} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5" />
              </label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsMealDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={myChildren.length === 0}>
                Save Meal Entry
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
