import { Bell, BookOpen, CalendarDays, CalendarPlus, LayoutDashboard, Stethoscope, UserCircle } from "lucide-react";
import type { ReactNode } from "react";
import { RoleLayout, type NavItem } from "@/components/role-layout";

const nav: NavItem[] = [
  { to: "/patient", label: "Dashboard", icon: LayoutDashboard },
  { to: "/patient/book", label: "Book Appointment", icon: CalendarPlus },
  { to: "/patient/appointments", label: "My Appointments", icon: CalendarDays },
  { to: "/patient/consultations", label: "My Consultations", icon: Stethoscope },
  { to: "/patient/health-info", label: "Health Information", icon: BookOpen },
  { to: "/patient/profile", label: "My Profile", icon: UserCircle },
  { to: "/patient/notifications", label: "Notifications", icon: Bell },
];

export function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <RoleLayout role="patient" nav={nav} notificationsHref="/patient/notifications">
      {children}
    </RoleLayout>
  );
}
