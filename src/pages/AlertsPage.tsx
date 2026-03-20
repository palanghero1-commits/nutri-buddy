import { alerts } from "@/lib/mockData";
import { AlertTriangle, Info, AlertCircle, Check } from "lucide-react";

const iconMap = {
  warning: AlertTriangle,
  critical: AlertCircle,
  info: Info,
};

export default function AlertsPage() {
  return (
    <div>
      <div className="section-enter">
        <h1 className="text-2xl font-bold">Alerts & Recommendations</h1>
        <p className="text-muted-foreground mt-1">Nutrition alerts and health recommendations</p>
      </div>

      <div className="space-y-4 mt-6">
        {alerts.map((alert, i) => {
          const Icon = iconMap[alert.type];
          return (
            <div
              key={alert.id}
              className={`stat-card section-enter stagger-${(i % 5) + 1} flex items-start gap-4 ${
                alert.type === "critical" ? "border-l-4 border-l-destructive" :
                alert.type === "warning" ? "border-l-4 border-l-warning" :
                "border-l-4 border-l-primary"
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                alert.type === "critical" ? "bg-destructive/10" :
                alert.type === "warning" ? "bg-warning/10" :
                "bg-primary/10"
              }`}>
                <Icon className={`w-4 h-4 ${
                  alert.type === "critical" ? "text-destructive" :
                  alert.type === "warning" ? "text-warning" :
                  "text-primary"
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{alert.childName}</h3>
                  <span className="text-xs text-muted-foreground">{alert.date}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
              </div>
              {alert.read && (
                <Check className="w-4 h-4 text-success shrink-0 mt-1" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
