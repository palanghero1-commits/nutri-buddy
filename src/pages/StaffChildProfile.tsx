import { useEffect, useState } from "react";
import { ArrowLeft, CalendarCheck, CalendarDays, CheckCircle2, ClipboardList, Ruler, Save, Scale, UtensilsCrossed } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNutriData } from "@/hooks/useNutriData";
import { useToast } from "@/hooks/use-toast";
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
  const { children, mealEntries, growthData, actionPlans, updateActionPlan } = useNutriData();
  const child = children.find((item) => item.id === childId);
  const basePath = staffRole === "bhw" ? "/bhw/children" : "/admin/children";
  const actionPlan = child ? actionPlans[child.id] : undefined;
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setNotes(actionPlan?.bhwNotes ?? "");
  }, [child?.id, actionPlan?.bhwNotes]);

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

  const saveNotes = async () => {
    if (child) {
      await updateActionPlan(child.id, { bhwNotes: notes });
      toast({ title: "Notes saved", description: "The BHW notes were saved to this child’s action plan." });
    }
  };

  const toggleComplete = async () => {
    if (child) {
      const completed = !actionPlan?.completedAt;
      await updateActionPlan(child.id, { completedAt: completed ? new Date().toISOString().slice(0, 10) : null });
      toast({ title: completed ? "Follow-up completed" : "Follow-up reopened", description: completed ? "This action plan is now marked complete." : "This action plan is open again for follow-up." });
    }
  };

  return <div>
    <Link to={basePath} className="section-enter inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to children</Link>
    <div className="mt-4 section-enter flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage text-lg font-bold text-sage-deep">{child.avatar}</div><div><h1 className="text-2xl font-bold">{child.name}</h1><p className="mt-1 text-muted-foreground">{child.ageDisplay || formatChildAge(child.birthDate) || `${child.age} years old`} · {child.gender}</p></div></div><span className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${statusClass(child.status)}`}>{child.status}</span></div>

    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3"><div className="stat-card"><p className="text-sm text-muted-foreground">Current Weight</p><p className="mt-1 text-3xl font-bold">{child.weight} <span className="text-base font-normal text-muted-foreground">kg</span></p></div><div className="stat-card"><p className="text-sm text-muted-foreground">Current Height</p><p className="mt-1 text-3xl font-bold">{child.height} <span className="text-base font-normal text-muted-foreground">cm</span></p></div><div className="stat-card"><p className="text-sm text-muted-foreground">Current BMI</p><p className="mt-1 text-3xl font-bold">{child.bmi}</p></div></div>

    {actionPlan && <div className="stat-card mt-6 section-enter border-l-4 border-l-primary">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><ClipboardList className="h-5 w-5" /></div><div><h2 className="font-semibold">Nutrition Action Plan</h2><p className="mt-1 text-sm text-muted-foreground">{actionPlan.summary}</p></div></div>
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${actionPlan.severity === "Priority follow-up" ? "bg-destructive/10 text-destructive" : actionPlan.severity === "Monitor" ? "bg-peach text-warning-foreground" : "bg-sage text-sage-deep"}`}>{actionPlan.severity}</span>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recommended actions</p><ul className="mt-2 space-y-2 text-sm text-foreground">{actionPlan.recommendations.map((recommendation) => <li key={recommendation} className="flex gap-2"><span className="text-primary">•</span><span>{recommendation}</span></li>)}</ul></div>
        <div className="space-y-3 text-sm"><div className="flex items-start gap-2 rounded-lg bg-muted/60 p-3"><CalendarCheck className="mt-0.5 h-4 w-4 text-primary" /><span><strong>Suggested follow-up:</strong> {actionPlan.followUpDate}{actionPlan.overdue && <span className="ml-2 font-medium text-destructive">Overdue</span>}</span></div><div className="rounded-lg bg-muted/60 p-3"><strong>Next target:</strong> {actionPlan.targetSummary}</div></div>
      </div>
      <div className="mt-5 border-t border-border/70 pt-4"><label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="bhw-notes">BHW notes</label><textarea id="bhw-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Record caregiver discussion, referral details, or follow-up observations..." className="mt-2 min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" /><div className="mt-3 flex flex-wrap items-center gap-2"><button type="button" onClick={() => void saveNotes()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"><Save className="h-4 w-4" /> Save notes</button><button type="button" onClick={() => void toggleComplete()} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted">{actionPlan.completedAt ? <><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Mark as open</> : <><CheckCircle2 className="h-4 w-4" /> Mark follow-up complete</>}</button>{actionPlan.completedAt && <span className="text-xs text-emerald-600">Completed {actionPlan.completedAt}</span>}</div></div>
      <p className="mt-4 text-xs text-muted-foreground">This is a support recommendation, not a medical diagnosis. Review it with a qualified health worker.</p>
    </div>}

    <div className="stat-card mt-6 section-enter stagger-2"><h2 className="font-semibold">Growth History & Activity Timeline</h2><p className="mt-1 text-sm text-muted-foreground">Measurements include calculated BMI and nutrition status at the time they were recorded.</p>{events.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">No growth or meal records are available for this child yet.</p> : <div className="mt-6 space-y-5 border-l-2 border-border pl-5">{events.map((event, index) => {
      const priorGrowth = event.type === "growth" ? chronologicalGrowth.findIndex((item) => item === event) > 0 ? chronologicalGrowth[chronologicalGrowth.findIndex((item) => item === event) - 1] : undefined : undefined;
      const statusChanged = event.type === "growth" && (!priorGrowth || priorGrowth.status !== event.status);
      return <div key={event.type === "growth" ? `growth-${event.date}-${index}` : event.id} className="relative"><span className={`absolute -left-[31px] top-1 flex h-5 w-5 items-center justify-center rounded-full ${event.type === "growth" ? "bg-primary text-primary-foreground" : "bg-sage text-sage-deep"}`}>{event.type === "growth" ? <Scale className="h-3 w-3" /> : <UtensilsCrossed className="h-3 w-3" />}</span><div className="rounded-lg bg-muted/60 p-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-medium">{event.type === "growth" ? "Growth measurement recorded" : `${event.mealType} meal logged`}</p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />{event.date}</p></div>{event.type === "growth" ? <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(event.status)}`}>{event.status}</span> : <span className="text-sm font-semibold text-primary">{event.calories} kcal</span>}</div>{event.type === "growth" ? <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"><div className="rounded-md bg-background p-3 text-sm"><Scale className="mb-1 h-4 w-4 text-muted-foreground" />{event.weight} kg</div><div className="rounded-md bg-background p-3 text-sm"><Ruler className="mb-1 h-4 w-4 text-muted-foreground" />{event.height} cm</div><div className="rounded-md bg-background p-3 text-sm"><p className="mb-1 text-xs text-muted-foreground">BMI</p>{event.bmi}</div></div> : <><div className="mt-3 flex flex-wrap gap-1.5">{event.foods.map((food) => <span key={food} className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">{food}</span>)}</div><p className="mt-3 text-xs text-muted-foreground">Protein {event.protein}g · Carbs {event.carbs}g · Fat {event.fat}g</p></>}{statusChanged && <p className="mt-3 text-xs font-medium text-muted-foreground">{priorGrowth ? `Status changed from ${priorGrowth.status} to ${event.status}.` : `Initial recorded status: ${event.status}.`}</p>}</div></div>;
    })}</div>}</div>
  </div>;
}
