import { Activity, CalendarDays, Ruler, Scale, Salad, TrendingUp } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNutriData } from "@/hooks/useNutriData";
import { formatChildAge } from "@/lib/mockData";

const statusClass: Record<string, string> = {
  Normal: "bg-sage text-sage-deep",
  Underweight: "bg-peach text-warning-foreground",
  Overweight: "bg-coral-light text-coral",
  Stunted: "bg-destructive/10 text-destructive",
};

export default function UserChildProfile() {
  const { childId } = useParams();
  const { currentUser } = useAuth();
  const { children, mealEntries, growthData } = useNutriData();

  const child = children.find((item) => item.id === childId);

  if (!child || child.createdByEmail !== currentUser?.email) {
    return <Navigate to="/user" replace />;
  }

  const childAge = child.ageDisplay || formatChildAge(child.birthDate) || `${child.age} years old`;
  const childGrowth = growthData[child.id] ?? [];
  const childMeals = mealEntries.filter((meal) => meal.childId === child.id).slice(0, 6);
  const latestGrowth = childGrowth.at(-1);

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:py-9">
        <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="section-enter rounded-xl border border-border/70 bg-card p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-sage text-2xl font-bold text-sage-deep">
                {child.avatar}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Child Profile</p>
                <h1 className="mt-1 text-3xl font-bold leading-tight text-foreground">{child.name}</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {childAge} - {child.gender} - Parent/Guardian: {child.parentName}
                </p>
                <span className={`mt-3 inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${statusClass[child.status]}`}>
                  {child.status}
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/60 p-4">
                <Scale className="h-4 w-4 text-muted-foreground" />
                <p className="mt-2 text-2xl font-bold text-foreground">{child.weight}</p>
                <p className="text-xs text-muted-foreground">Weight (kg)</p>
              </div>
              <div className="rounded-lg bg-muted/60 p-4">
                <Ruler className="h-4 w-4 text-muted-foreground" />
                <p className="mt-2 text-2xl font-bold text-foreground">{child.height}</p>
                <p className="text-xs text-muted-foreground">Height (cm)</p>
              </div>
              <div className="rounded-lg bg-muted/60 p-4">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <p className="mt-2 text-2xl font-bold text-foreground">{child.bmi}</p>
                <p className="text-xs text-muted-foreground">BMI</p>
              </div>
            </div>
          </div>

          <div className="section-enter stagger-1 rounded-xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-foreground">Profile Details</h2>
                <p className="mt-1 text-sm text-muted-foreground">Personal record linked to your account.</p>
              </div>
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between gap-4 rounded-lg bg-muted/60 p-3">
                <dt className="text-muted-foreground">First Name</dt>
                <dd className="font-medium text-foreground">{child.firstName}</dd>
              </div>
              <div className="flex justify-between gap-4 rounded-lg bg-muted/60 p-3">
                <dt className="text-muted-foreground">Middle Name</dt>
                <dd className="font-medium text-foreground">{child.middleName || "None"}</dd>
              </div>
              <div className="flex justify-between gap-4 rounded-lg bg-muted/60 p-3">
                <dt className="text-muted-foreground">Last Name</dt>
                <dd className="font-medium text-foreground">{child.lastName}</dd>
              </div>
              <div className="flex justify-between gap-4 rounded-lg bg-muted/60 p-3">
                <dt className="text-muted-foreground">Birthdate</dt>
                <dd className="font-medium text-foreground">{child.birthDate}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="section-enter stagger-2 rounded-xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-foreground">Growth History</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Latest record: {latestGrowth ? `${latestGrowth.weight} kg, ${latestGrowth.height} cm` : "No growth records yet"}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-5 h-64">
              {childGrowth.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 text-sm text-muted-foreground">
                  Growth updates will appear here.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={childGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 18%, 88%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="#192853" strokeWidth={2} name="Weight" />
                    <Line type="monotone" dataKey="height" stroke="#8FB3C9" strokeWidth={2} name="Height" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="section-enter stagger-3 rounded-xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-foreground">Recent Meals</h2>
                <p className="mt-1 text-sm text-muted-foreground">Meal entries for this child only.</p>
              </div>
              <Salad className="h-5 w-5 text-muted-foreground" />
            </div>

            {childMeals.length === 0 ? (
              <div className="mt-5 rounded-lg border border-dashed border-border bg-muted/50 p-5 text-sm text-muted-foreground">
                No meal entries yet.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {childMeals.map((meal) => (
                  <div key={meal.id} className="rounded-lg bg-muted/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">{meal.mealType}</p>
                      <span className="text-sm font-bold text-primary">{meal.calories} kcal</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{meal.date}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{meal.foods.join(", ")}</p>
                  </div>
                ))}
              </div>
            )}

            <Button asChild className="mt-5 w-full">
              <Link to="/user">Add More Updates</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
