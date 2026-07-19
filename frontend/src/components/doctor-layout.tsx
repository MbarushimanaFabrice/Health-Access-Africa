import { Bell, BookOpen, CalendarDays, LayoutDashboard, Stethoscope, Users, Settings } from "lucide-react";
import type { ReactNode } from "react";
import { RoleLayout, type NavItem } from "@/components/role-layout";

const nav: NavItem[] = [
  { to: "/doctor", label: "Dashboard", icon: LayoutDashboard },
  { to: "/doctor/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/doctor/patients", label: "Patients", icon: Users },
  { to: "/doctor/consultations", label: "Consultations", icon: Stethoscope },
  { to: "/doctor/health-info", label: "Health Information", icon: BookOpen },
  { to: "/doctor/notifications", label: "Notifications", icon: Bell },
  { to: "/doctor/settings", label: "Settings", icon: Settings },
];

export function DoctorLayout({ children }: { children: ReactNode }) {
  return (
    <RoleLayout role="doctor" nav={nav} notificationsHref="/doctor/notifications">
      {children}
    </RoleLayout>
  );
}
