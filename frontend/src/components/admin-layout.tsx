import { BarChart3, Bell, BookOpen, CalendarDays, LayoutDashboard, Settings, Stethoscope, User, Users } from "lucide-react";
import type { ReactNode } from "react";
import { RoleLayout, type NavItem } from "@/components/role-layout";

const nav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { to: "/admin/patients", label: "Patients", icon: User },
  { to: "/admin/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/admin/health-info", label: "Health Information", icon: BookOpen },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleLayout role="admin" nav={nav} notificationsHref="/admin/notifications">
      {children}
    </RoleLayout>
  );
}
