import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Baby,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Leaf,
  LogOut,
  Salad,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNutriData } from "@/hooks/useNutriData";

interface UserSidebarContentProps {
  collapsed?: boolean;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
  showCollapseToggle?: boolean;
}

function UserSidebarContent({
  collapsed = false,
  onNavigate,
  onToggleCollapse,
  showCollapseToggle = false,
}: UserSidebarContentProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { children } = useNutriData();
  const myChildren = children.filter((child) => child.createdByEmail === currentUser?.email);

  const handleLogout = () => {
    logout();
    navigate("/");
    onNavigate?.();
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/user" },
    { icon: Salad, label: "Meals", path: "/user/meals" },
    { icon: TrendingUp, label: "Growth", path: "/user/growth" },
  ];

  return (
    <>
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Leaf className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-lg font-bold tracking-tight text-sidebar-foreground">Nutri-Track</p>
            <p className="truncate text-xs text-white/60">User Account</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-2 py-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
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
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-white/45">Child Profiles</p>
          )}
          {myChildren.length === 0 ? (
            <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/35">
              <Baby className="h-5 w-5 shrink-0" />
              {!collapsed && <span>No children yet</span>}
            </div>
          ) : (
            myChildren.map((child) => {
              const path = `/user/children/${child.id}`;
              const active = location.pathname === path;
              return (
                <Link
                  key={child.id}
                  to={path}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                    active
                      ? "bg-sidebar-accent text-[#FFE14E]"
                      : "text-white hover:bg-sidebar-accent/50 hover:text-white"
                  }`}
                >
                  <UserRound className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="truncate">{child.name}</span>}
                </Link>
              );
            })
          )}
        </div>
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

export function MobileUserSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-sidebar">
      <UserSidebarContent onNavigate={onNavigate} />
    </div>
  );
}

export default function UserSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 z-40 hidden h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300 md:flex md:flex-col ${
        collapsed ? "w-[68px]" : "w-[240px]"
      }`}
    >
      <UserSidebarContent
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((value) => !value)}
        showCollapseToggle
      />
    </aside>
  );
}
