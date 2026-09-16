import { useMemo, useState } from "react";
import { Download, FileDown, FileText, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useNutriData } from "@/hooks/useNutriData";
import { useAuth } from "@/hooks/useAuth";
import { formatChildAge, type Child, type GrowthRecord, type MealEntry } from "@/lib/mockData";

type ExportRow = Record<string, string | number>;
const reportNames = ["Monthly Nutrition Summary", "Growth Progress Report", "Underweight Children Alert List", "Feeding Program Recommendations"];

function csvValue(value: string | number) { return `"${String(value ?? "").replace(/"/g, '""')}"`; }
function downloadFile(content: BlobPart, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a"); link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}
function buildCsv(children: Child[], meals: MealEntry[], growthData: Record<string, GrowthRecord[]>, stats: Record<string, number>) {
  const rows = ["Nutri-Track Reports", `Generated,${new Date().toLocaleString()}`, "", "Status Summary", "Status,Count", ...Object.entries(stats).map(([status, count]) => `${csvValue(status)},${count}`), "", "Children Summary", "Name,Age,Weight (kg),Height (cm),BMI,Status,Guardian,Assigned Area,Assigned BHW,Allergies", ...children.map((child) => [child.name, child.ageDisplay || formatChildAge(child.birthDate) || `${child.age} years old`, child.weight, child.height, child.bmi, child.status, child.parentName, child.assignedArea || "Not assigned", child.assignedBhwName || "Not assigned", child.allergies?.trim() || "None recorded"].map(csvValue).join(",")), "", "Meal Logs", "Date,Child,Meal Type,Foods,Calories,Protein (g),Carbs (g),Fat (g)", ...meals.map((meal) => [meal.date, children.find((child) => child.id === meal.childId)?.name || "Unknown child", meal.mealType, meal.foods.join("; "), meal.calories, meal.protein, meal.carbs, meal.fat].map(csvValue).join(",")), "", "Growth Records", "Date,Child,Weight (kg),Height (cm)", ...Object.entries(growthData).flatMap(([childId, records]) => records.map((record) => [record.date, children.find((child) => child.id === childId)?.name || "Unknown child", record.weight, record.height].map(csvValue).join(",")))];
  return rows.join("\n");
}
function addPdfSection(pdf: jsPDF, title: string, rows: ExportRow[], y: number) {
  const pageHeight = pdf.internal.pageSize.getHeight(); pdf.setFont("helvetica", "bold"); pdf.setFontSize(11); pdf.text(title, 14, y); y += 7; pdf.setFont("helvetica", "normal"); pdf.setFontSize(8);
  for (const row of rows) {
    const lines = pdf.splitTextToSize(Object.entries(row).map(([key, value]) => `${key}: ${value}`).join("   "), 180) as string[];
    if (y + lines.length * 4 > pageHeight - 14) { pdf.addPage(); y = 16; }
    pdf.text(lines, 14, y); y += lines.length * 4 + 2;
  }
  return y + 4;
}
function buildPdf(children: Child[], meals: MealEntry[], growthData: Record<string, GrowthRecord[]>, stats: Record<string, number>) {
  const pdf = new jsPDF(); pdf.setProperties({ title: "Nutri-Track Reports", subject: "Nutrition and growth report" }); pdf.setFont("helvetica", "bold"); pdf.setFontSize(18); pdf.text("Nutri-Track Reports", 14, 18); pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.text(`Generated ${new Date().toLocaleString()}`, 14, 25);
  let y = 36;
  y = addPdfSection(pdf, "Status Summary", Object.entries(stats).map(([status, count]) => ({ Status: status, Count: count })), y);
  y = addPdfSection(pdf, "Children Summary", children.map((child) => ({ Name: child.name, Age: child.ageDisplay || formatChildAge(child.birthDate) || `${child.age} years old`, Weight: `${child.weight} kg`, Height: `${child.height} cm`, BMI: child.bmi, Status: child.status, Area: child.assignedArea || "Not assigned" })), y);
  y = addPdfSection(pdf, "Meal Logs", meals.map((meal) => ({ Date: meal.date, Child: children.find((child) => child.id === meal.childId)?.name || "Unknown child", Meal: meal.mealType, Foods: meal.foods.join(", "), Calories: meal.calories })), y);
  addPdfSection(pdf, "Growth Records", Object.entries(growthData).flatMap(([childId, records]) => records.map((record) => ({ Date: record.date, Child: children.find((child) => child.id === childId)?.name || "Unknown child", Weight: `${record.weight} kg`, Height: `${record.height} cm` }))), y);
  return pdf;
}

export default function ReportsPage() {
  const { children, mealEntries, growthData, dashboardStats } = useNutriData();
  const { staffRole } = useAuth(); const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null); const canExport = staffRole === "admin" || staffRole === "bhw";
  const statusChart = [{ status: "Normal", count: dashboardStats.normalCount }, { status: "Underweight", count: dashboardStats.underweightCount }, { status: "Overweight", count: dashboardStats.overweightCount }, { status: "Stunted", count: dashboardStats.stuntedCount }];
  const stats = useMemo(() => Object.fromEntries(statusChart.map(({ status, count }) => [status, count])), [statusChart]);
  const exportReport = (format: "csv" | "pdf") => { if (!canExport) return; setExporting(format); const date = new Date().toISOString().slice(0, 10); window.setTimeout(() => { if (format === "csv") downloadFile(buildCsv(children, mealEntries, growthData, stats), `nutri-track-report-${date}.csv`, "text/csv;charset=utf-8"); else buildPdf(children, mealEntries, growthData, stats).save(`nutri-track-report-${date}.pdf`); setExporting(null); }, 0); };

  return <div>
    <div className="section-enter flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="text-2xl font-bold">Reports</h1><p className="text-muted-foreground mt-1">Data management and health progress reports</p><p className="mt-2 text-xs text-muted-foreground">Exports include the children, meal, and growth records currently visible to your account.</p></div>{canExport && <div className="flex flex-wrap gap-2"><button type="button" onClick={() => exportReport("csv")} disabled={!!exporting} className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60">{exporting === "csv" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}Export CSV</button><button type="button" onClick={() => exportReport("pdf")} disabled={!!exporting} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">{exporting === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}Export PDF</button></div>}</div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6"><div className="stat-card section-enter stagger-1"><h2 className="font-semibold mb-4">Status Distribution</h2><div className="h-56 sm:h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={statusChart}><CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 18%, 88%)" /><XAxis dataKey="status" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#192853" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></div><div className="stat-card section-enter stagger-2"><h2 className="font-semibold mb-4">Available Reports</h2><div className="space-y-3">{reportNames.map((report) => <div key={report} className="flex flex-col gap-3 rounded-lg bg-muted p-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-center gap-3"><FileText className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium">{report}</span></div><span className="text-xs text-muted-foreground">Included in PDF and CSV</span></div>)}</div></div></div>
    <div className="stat-card mt-6 section-enter stagger-3"><h2 className="font-semibold mb-4">Children Summary Table</h2><div className="overflow-x-auto"><table className="min-w-[1060px] w-full text-sm"><thead><tr className="border-b border-border">{["Name", "Age", "Weight", "Height", "BMI", "Status", "Guardian", "Guardian Type", "Assigned Area", "Assigned BHW", "Mother", "Father", "Address", "Allergies"].map((heading) => <th key={heading} className="text-left py-3 px-2 font-medium text-muted-foreground">{heading}</th>)}</tr></thead><tbody>{children.map((child) => <tr key={child.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors"><td className="py-3 px-2 font-medium">{child.name}</td><td className="py-3 px-2">{child.ageDisplay || formatChildAge(child.birthDate) || `${child.age} years old`}</td><td className="py-3 px-2 tabular-nums">{child.weight} kg</td><td className="py-3 px-2 tabular-nums">{child.height} cm</td><td className="py-3 px-2 tabular-nums">{child.bmi}</td><td className="py-3 px-2"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${child.status === "Normal" ? "bg-sage text-sage-deep" : child.status === "Underweight" ? "bg-peach text-warning-foreground" : child.status === "Overweight" ? "bg-coral-light text-coral" : "bg-destructive/10 text-destructive"}`}>{child.status}</span></td><td className="py-3 px-2 text-muted-foreground">{child.parentName}</td><td className="py-3 px-2 text-muted-foreground">{child.guardianType || "Not recorded"}</td><td className="py-3 px-2 text-muted-foreground">{child.assignedArea || "Not assigned"}</td><td className="py-3 px-2 text-muted-foreground">{child.assignedBhwName || "Not assigned"}</td><td className="py-3 px-2 text-muted-foreground">{child.motherName || child.parentName}</td><td className="py-3 px-2 text-muted-foreground">{child.fatherName || "Not recorded"}</td><td className="py-3 px-2 text-muted-foreground">{child.address || "Not recorded"}</td><td className="py-3 px-2 text-muted-foreground">{child.allergies?.trim() || "None recorded"}</td></tr>)}</tbody></table></div></div>
  </div>;
}
