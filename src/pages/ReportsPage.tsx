import { FileText, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useNutriData } from "@/hooks/useNutriData";

export default function ReportsPage() {
  const { children, dashboardStats } = useNutriData();
  const statusChart = [
    { status: "Normal", count: dashboardStats.normalCount },
    { status: "Underweight", count: dashboardStats.underweightCount },
    { status: "Overweight", count: dashboardStats.overweightCount },
    { status: "Stunted", count: dashboardStats.stuntedCount },
  ];

  return (
    <div>
      <div className="section-enter">
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-1">Data management and health progress reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="stat-card section-enter stagger-1">
          <h2 className="font-semibold mb-4">Status Distribution</h2>
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 18%, 88%)" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#192853" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="stat-card section-enter stagger-2">
          <h2 className="font-semibold mb-4">Available Reports</h2>
          <div className="space-y-3">
            {[
              "Monthly Nutrition Summary",
              "Growth Progress Report",
              "Underweight Children Alert List",
              "Feeding Program Recommendations",
            ].map((report) => (
              <div key={report} className="group flex flex-col gap-3 rounded-lg bg-muted p-3 transition-colors hover:bg-muted/70 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{report}</span>
                </div>
                <Download className="h-4 w-4 shrink-0 text-muted-foreground opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Children table */}
      <div className="stat-card mt-6 section-enter stagger-3">
        <h2 className="font-semibold mb-4">Children Summary Table</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Name</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Age</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Weight</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Height</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">BMI</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Parent</th>
              </tr>
            </thead>
            <tbody>
              {children.map((child) => (
                <tr key={child.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-2 font-medium">{child.name}</td>
                  <td className="py-3 px-2">{child.age}</td>
                  <td className="py-3 px-2 tabular-nums">{child.weight} kg</td>
                  <td className="py-3 px-2 tabular-nums">{child.height} cm</td>
                  <td className="py-3 px-2 tabular-nums">{child.bmi}</td>
                  <td className="py-3 px-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      child.status === "Normal" ? "bg-sage text-sage-deep" :
                      child.status === "Underweight" ? "bg-peach text-warning-foreground" :
                      child.status === "Overweight" ? "bg-coral-light text-coral" :
                      "bg-destructive/10 text-destructive"
                    }`}>
                      {child.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-muted-foreground">{child.parentName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
