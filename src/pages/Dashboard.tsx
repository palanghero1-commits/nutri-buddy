import { Users, Utensils, AlertTriangle, TrendingUp, Heart, Scale, Ruler, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useNutriData } from "@/hooks/useNutriData";

export default function Dashboard() {
  const { dashboardStats, children, alerts } = useNutriData();
  const unreadAlerts = alerts.filter((a) => !a.read);
  const statusData = [
    { name: "Normal", value: dashboardStats.normalCount, color: "#192853" },
    { name: "Underweight", value: dashboardStats.underweightCount, color: "#FFE14E" },
    { name: "Overweight", value: dashboardStats.overweightCount, color: "#8FB3C9" },
    { name: "Stunted", value: dashboardStats.stuntedCount, color: "#EF4444" },
  ];

  return (
    <div>
      <div className="section-enter">
        <h1 className="text-2xl font-bold text-foreground leading-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Barangay Tinampa-an, Cadiz City — Children's Health Overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          { label: "Children Monitored", value: dashboardStats.totalChildren, icon: Users, bg: "bg-sky" },
          { label: "Meals Logged Today", value: dashboardStats.mealsLoggedToday, icon: Utensils, bg: "bg-peach" },
          { label: "Pending Alerts", value: dashboardStats.pendingAlerts, icon: AlertTriangle, bg: "bg-coral-light" },
          { label: "Normal Status", value: `${Math.round((dashboardStats.normalCount / dashboardStats.totalChildren) * 100)}%`, icon: Heart, bg: "bg-sage" },
        ].map((stat, i) => (
          <div key={stat.label} className={`stat-card section-enter stagger-${i + 1}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-foreground/70" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Status distribution */}
        <div className="stat-card section-enter stagger-3 lg:col-span-1">
          <h2 className="font-semibold text-foreground mb-4">Nutritional Status</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name}
              </div>
            ))}
          </div>
        </div>

        {/* Recent children */}
        <div className="stat-card section-enter stagger-4 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent Children</h2>
            <Link to="/admin/children" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {children.slice(0, 4).map((child) => (
              <div key={child.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-sage flex items-center justify-center text-xs font-semibold text-sage-deep">
                  {child.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{child.name}</p>
                  <p className="text-xs text-muted-foreground">{child.age} yrs • {child.weight} kg</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  child.status === "Normal" ? "bg-sage text-sage-deep" :
                  child.status === "Underweight" ? "bg-peach text-warning-foreground" :
                  child.status === "Overweight" ? "bg-coral-light text-coral" :
                  "bg-destructive/10 text-destructive"
                }`}>
                  {child.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="stat-card section-enter stagger-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent Alerts</h2>
            <Link to="/admin/alerts" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {(unreadAlerts.length > 0 ? unreadAlerts : alerts).slice(0, 4).map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg border text-sm ${
                alert.type === "critical" ? "border-destructive/30 bg-destructive/5" :
                alert.type === "warning" ? "border-warning/30 bg-warning/5" :
                "border-primary/20 bg-primary/5"
              }`}>
                <p className="font-medium text-foreground text-xs">{alert.childName}</p>
                <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
