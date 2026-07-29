import { createFileRoute, Link } from "@tanstack/react-router";
import { PatientLayout } from "@/components/patient-layout";
import { PageHeader } from "@/components/role-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { StatusBadge } from "@/components/status-badge";
import { useAppState } from "@/state/app-state";
import { useAuth } from "@/state/auth";
import { buildCountTrend } from "@/lib/adapters";
import { CalendarDays, Stethoscope, Bell, BookOpen, TrendingUp, Eye, X, CalendarPlus, BellRing } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/patient/")({
  component: PatientDashboard,
  head: () => ({ meta: [{ title: "Patient Dashboard — Health Access Africa" }] }),
});

function StatCard({ icon: Icon, label, value, trend }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; trend: string }) {
  return (
    <Card className="border-border/60 shadow-[var(--shadow-card)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="grid size-11 place-items-center rounded-full bg-brand-soft text-brand"><Icon className="size-5" /></div>
          {/* <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">
            <TrendingUp className="size-3" />{trend}
          </span> */}
        </div>
        <div className="mt-4 text-3xl font-bold tracking-tight">{value}</div>
        <div className="mt-1 text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

function PatientDashboard() {
  const { currentUser } = useAuth();
  const { appointments, consultations, notifications, doctors, articles, updateAppointmentStatus } = useAppState();
  const patient = currentUser!;
  const today = new Date().toISOString().slice(0, 10);
  const doctorById = useMemo(() => Object.fromEntries(doctors.map((d) => [d.id, d])), [doctors]);

  const mine = appointments.filter((a) => a.patientId === patient.id);
  const myConsults = consultations.filter((c) => c.patientId === patient.id);
  const upcoming = mine.filter((a) => a.date >= today && a.status !== "Cancelled" && a.status !== "Completed")
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const unread = notifications.filter((n) => n.audience === "patient" && !n.read).length;

  const [range, setRange] = useState<"Week" | "Month" | "Year">("Week");
  const trend = useMemo(() => buildCountTrend(mine.map((a) => a.date), range), [mine, range]);
  const appointmentStatusBar = useMemo(
    () => (["Pending", "Confirmed", "In Progress", "Completed", "Cancelled"] as const).map((s) => ({ name: s, value: mine.filter((a) => a.status === s).length })),
    [mine]
  );
  const apptDates = useMemo(() => mine.map((a) => new Date(a.date + "T00:00:00")), [mine]);
  const todayFormatted = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <PatientLayout>
      <PageHeader
        title={`Welcome back, ${patient.name}!`}
        subtitle={todayFormatted}
        actions={
          <Button asChild className="bg-brand text-brand-foreground hover:bg-brand/90">
            <Link to="/patient/book"><CalendarPlus className="size-4" /> Book Appointment</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarDays} label="Upcoming Appointments" value={upcoming.length} trend="+2" />
        <StatCard icon={Stethoscope} label="My Consultations" value={myConsults.length} trend="+1" />
        <StatCard icon={Bell} label="Unread Notifications" value={unread} trend={`${unread} new`} />
        <StatCard icon={BookOpen} label="Health Articles" value={articles.filter((a) => a.status === "Published").length} trend="+3" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">My Appointments History</CardTitle>
              <Tabs value={range} onValueChange={(v) => setRange(v as typeof range)}>
                <TabsList className="h-8">
                  <TabsTrigger value="Week" className="text-xs">Week</TabsTrigger>
                  <TabsTrigger value="Month" className="text-xs">Month</TabsTrigger>
                  <TabsTrigger value="Year" className="text-xs">Year</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                  <Line type="monotone" dataKey="value" name="Appointments" stroke="var(--brand)" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardHeader><CardTitle className="text-base">Appointments Overview</CardTitle></CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointmentStatusBar}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                  <Bar dataKey="value" name="Appointments" fill="var(--brand)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardHeader><CardTitle className="text-base">Upcoming Appointments</CardTitle></CardHeader>
            <CardContent className="p-0">
              {upcoming.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  You have no upcoming appointments — <Link to="/patient/book" className="font-medium text-brand hover:underline">book one now</Link>.
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {upcoming.slice(0, 5).map((a) => {
                    const d = doctorById[a.doctorId];
                    return (
                      <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                        <Avatar className="size-9"><AvatarImage src={d?.avatar} /><AvatarFallback>{d?.name?.[0]}</AvatarFallback></Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium">{d?.name}</div>
                          <div className="text-xs text-muted-foreground">{d?.specialty} · {a.date} at {a.time}</div>
                        </div>
                        <StatusBadge status={a.status} />
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardHeader><CardTitle className="text-base">Alerts & Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {notifications.filter((n) => n.audience === "patient").slice(0, 4).map((n) => (
                <div key={n.id} className="flex items-start gap-3 rounded-xl bg-muted/60 p-3">
                  <div className="grid size-8 place-items-center rounded-full bg-brand-soft text-brand"><BellRing className="size-4" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{n.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{n.body}</div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{n.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardHeader><CardTitle className="text-base">Calendar</CardTitle></CardHeader>
            <CardContent>
              <Calendar mode="single" selected={new Date()} modifiers={{ hasAppt: apptDates }}
                modifiersClassNames={{ hasAppt: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:size-1 after:rounded-full after:bg-brand" }}
                className="rounded-md" />
            </CardContent>
          </Card>

          <Card className="border-none bg-sidebar text-sidebar-foreground shadow-lg">
            <CardHeader><CardTitle className="text-base text-sidebar-foreground">Upcoming Schedule</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {upcoming.slice(0, 3).map((a) => {
                const d = doctorById[a.doctorId];
                return (
                  <div key={a.id} className="rounded-2xl bg-brand p-4 text-brand-foreground shadow-md">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 border-2 border-white/40"><AvatarImage src={d?.avatar} /><AvatarFallback>{d?.name?.[0]}</AvatarFallback></Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{d?.name}</div>
                        <div className="text-xs opacity-90">{a.date} · {a.time}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link to="/patient/appointments" className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/15 py-1.5 text-xs font-medium hover:bg-white/25">
                        <Eye className="size-3" /> View
                      </Link>
                      <button onClick={() => { updateAppointmentStatus(a.id, "Cancelled"); toast("Appointment cancelled"); }}
                        className="flex items-center justify-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/25">
                        <X className="size-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {upcoming.length === 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm text-sidebar-foreground/70">
                  No upcoming appointments
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PatientLayout>
  );
}
