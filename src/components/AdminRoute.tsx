import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "./AppLayout";

type StaffRole = "admin" | "bhw";

type AdminRouteProps = {
  children: ReactNode;
  allowedRoles?: StaffRole[];
};

export default function AdminRoute({ children, allowedRoles = ["admin"] }: AdminRouteProps) {
  const { staffRole } = useAuth();

  if (!staffRole) {
    return <Navigate to={allowedRoles.includes("admin") ? "/admin/login" : "/user/login"} replace />;
  }

  if (!allowedRoles.includes(staffRole)) {
    return <Navigate to={staffRole === "bhw" ? "/bhw" : "/admin"} replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}
