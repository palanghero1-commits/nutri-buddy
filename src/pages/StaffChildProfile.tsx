import { ArrowLeft, CalendarDays, Ruler, Scale, UtensilsCrossed } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNutriData } from "@/hooks/useNutriData";
import { formatChildAge, getChildAgeParts, type ChildStatus } from "@/lib/mockData";

function normaliseDate(date: string) {
  return date.length === 7 ? `${date}-01` : date;
}

function calculateStatus(birthDate: string, date: string, weight: number, height: number): { bmi: number; status: ChildStatus } {
  const bmi = height > 0 ? Number((weight / ((height / 100) ** 2)).toFixed(1)) : 0;
  const age = getChildAgeParts(birthDate, new Date(`${normaliseDate(date)}T00:00:00`)).years;
  const heightThreshold = age <= 2 ? 82 : age <= 3 ? 89 : age <= 4 ? 96 : age <= 5 ? 103 : age <= 6 ? 109 : 115;
  return { bmi, status: height < heightThreshold ? "Stunted" : bmi < 14 ? "Underweight" : bmi > 18 ? "Overweight" : "Normal" };
}

function statusClass(status: ChildStatus) {
  return status === "Normal" ? "bg-sage text-sage-deep" : status === "Underweight" ? "bg-peach text-warning-foreground" : status === "Overweight" ? "bg-coral-light text-coral" : "bg-destructive/10 text-destructive";
}

export default function StaffChildProfile() {
  const { childId } = useParams();
  const { staffRole } = useAuth();
  const { children, mealEntries, growthData } = useNutriData();
  const child = children.find((item) => item.id === childId);
  const basePath = staffRole === "bhw" ? "/bhw/children" : "/admin/children";

  if (!child) {
    return <div className="stat-card"><h1 className="text-xl font-bold">Child profile not found</h1><p className="mt-2 text-muted-foreground">This profile may be outside your assigned area or no longer available.</p><Link className="mt-4 inline-flex text-sm font-medium text-primary hover:underline" to={basePath}>Return to children</Link></div>;
  }

  const growthEvents = (growthData[child.id] ?? []).map((record) => {
    const { bmi, status } = calculateStatus(child.birthDate, record.date, record.weight, record.height);
    return { type: "growth" as const, date: record.date, weight: record.weight, height: record.height, bmi, status };
  });
  const mealEvents = mealEntries.filter((meal) => meal.childId === child.id).map((meal) => ({ type: "meal" as const, ...meal }));
  const events = [...growthEvents, ...mealEvents].sort((a, b) => normaliseDate(b.date).localeCompare(normaliseDate(a.date)));
  const chronologicalGrowth = [...growthEvents].sort((a, b) => normaliseDate(a.date).localeCompare(normaliseDate(b.date)));

  return <div>
    <Link to={basePath} className="section-enter inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to children</Link>
    <div className="mt-4 section-enter flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage text-lg font-bold text-sage-deep">{child.avatar}</div><div><h1 className="text-2xl font-bold">{child.name}</h1><p className="mt-1 text-muted-foreground">{child.ageDisplay || formatChildAge(child.birthDate) || `${child.age} years old`} · {child.gender}</p></div></div><span className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${statusClass(child.status)}`}>{child.status}</span></div>

    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3"><div className="stat-card"><p className="text-sm text-muted-foreground">Current Weight</p><p className="mt-1 text-3xl font-bold">{child.weight} <span className="text-base font-normal text-muted-foreground">kg</span></p></div><div className="stat-card"><p className="text-sm text-muted-foreground">Current Height</p><p className="mt-1 text-3xl font-bold">{child.height} <span className="text-base font-normal text-muted-foreground">cm</span></p></div><div className="stat-card"><p className="text-sm text-muted-foreground">Current BMI</p><p className="mt-1 text-3xl font-bold">{child.bmi}</p></div></div>

    <div className="stat-card mt-6 section-enter stagger-2"><h2 className="font-semibold">Growth History & Activity Timeline</h2><p className="mt-1 text-sm text-muted-foreground">Measurements include calculated BMI and nutrition status at the time they were recorded.</p>{events.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">No growth or meal records are available for this child yet.</p> : <div className="mt-6 space-y-5 border-l-2 border-border pl-5">{events.map((event, index) => {
      const priorGrowth = event.type === "growth" ? chronologicalGrowth.findIndex((item) => item === event) > 0 ? chronologicalGrowth[chronologicalGrowth.findIndex((item) => item === event) - 1] : undefined : undefined;
      const statusChanged = event.type === "growth" && (!priorGrowth || priorGrowth.status !== event.status);
      return <div key={event.type === "growth" ? `growth-${event.date}-${index}` : event.id} className="relative"><span className={`absolute -left-[31px] top-1 flex h-5 w-5 items-center justify-center rounded-full ${event.type === "growth" ? "bg-primary text-primary-foreground" : "bg-sage text-sage-deep"}`}>{event.type === "growth" ? <Scale className="h-3 w-3" /> : <UtensilsCrossed className="h-3 w-3" />}</span><div className="rounded-lg bg-muted/60 p-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-medium">{event.type === "growth" ? "Growth measurement recorded" : `${event.mealType} meal logged`}</p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />{event.date}</p></div>{event.type === "growth" ? <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(event.status)}`}>{event.status}</span> : <span className="text-sm font-semibold text-primary">{event.calories} kcal</span>}</div>{event.type === "growth" ? <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"><div className="rounded-md bg-background p-3 text-sm"><Scale className="mb-1 h-4 w-4 text-muted-foreground" />{event.weight} kg</div><div className="rounded-md bg-background p-3 text-sm"><Ruler className="mb-1 h-4 w-4 text-muted-foreground" />{event.height} cm</div><div className="rounded-md bg-background p-3 text-sm"><p className="mb-1 text-xs text-muted-foreground">BMI</p>{event.bmi}</div></div> : <><div className="mt-3 flex flex-wrap gap-1.5">{event.foods.map((food) => <span key={food} className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">{food}</span>)}</div><p className="mt-3 text-xs text-muted-foreground">Protein {event.protein}g · Carbs {event.carbs}g · Fat {event.fat}g</p></>}{statusChanged && <p className="mt-3 text-xs font-medium text-muted-foreground">{priorGrowth ? `Status changed from ${priorGrowth.status} to ${event.status}.` : `Initial recorded status: ${event.status}.`}</p>}</div></div>;
    })}</div>}</div>
  </div>;
}
