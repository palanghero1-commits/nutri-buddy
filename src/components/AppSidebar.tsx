import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  TrendingUp,
  Bell,
  FileText,
  ChevronLeft,
  ChevronRight,
  Leaf,
  LogOut,
} from "lucide-react";

export const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Children", path: "/admin/children" },
  { icon: UtensilsCrossed, label: "Meal Tracker", path: "/admin/meals" },
  { icon: TrendingUp, label: "Growth Monitor", path: "/admin/growth" },
  { icon: Bell, label: "Alerts", path: "/admin/alerts" },
  { icon: FileText, label: "Reports", path: "/admin/reports" },
];

interface SidebarContentProps {
  collapsed?: boolean;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
  showCollapseToggle?: boolean;
}

function SidebarContent({
  collapsed = false,
  onNavigate,
  onToggleCollapse,
  showCollapseToggle = false,
}: SidebarContentProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
    onNavigate?.();
  };

  return (
    <>
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Leaf className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-sidebar-foreground">Nutri-Track</span>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                active
                  ? "bg-sidebar-accent text-[#FFE14E]"
                  : "text-white hover:bg-sidebar-accent/50 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 px-2 pb-2">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive/80 transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        {showCollapseToggle && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-sidebar-accent"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>
    </>
  );
}

export function MobileSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-sidebar">
      <SidebarContent onNavigate={onNavigate} />
    </div>
  );
}

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 z-40 hidden h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300 md:flex md:flex-col ${
        collapsed ? "w-[68px]" : "w-[240px]"
      }`}
    >
      <SidebarContent
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((value) => !value)}
        showCollapseToggle
      />
    </aside>
  );
}
