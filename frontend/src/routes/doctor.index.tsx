import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DoctorLayout } from "@/components/doctor-layout";
import { PageHeader } from "@/components/role-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { StatusBadge } from "@/components/status-badge";
import { useAppState } from "@/state/app-state";
import { useAuth } from "@/state/auth";
import { buildCountTrend } from "@/lib/adapters";
import { CalendarDays, Users, Stethoscope, Bell, TrendingUp, Eye, Play, BellRing } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/doctor/")({
  component: DoctorDashboard,
  head: () => ({ meta: [{ title: "Doctor Dashboard — Health Access Africa" }] }),
});

function StatCard({ icon: Icon, label, value, trend }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; trend: string }) {
  return (
    <Card className="border-border/60 shadow-[var(--shadow-card)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="grid size-11 place-items-center rounded-full bg-brand-soft text-brand"><Icon className="size-5" /></div>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand"><TrendingUp className="size-3" />{trend}</span>
        </div>
        <div className="mt-4 text-3xl font-bold tracking-tight">{value}</div>
        <div className="mt-1 text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

function DoctorDashboard() {
  const { currentUser } = useAuth();
  const { appointments, consultations, notifications, patients, startConsultation } = useAppState();
  const doctor = currentUser!;
  const today = new Date().toISOString().slice(0, 10);
  const patientById = useMemo(() => Object.fromEntries(patients.map((p) => [p.id, p])), [patients]);
  const mine = appointments.filter((a) => a.doctorId === doctor.id);
  const todays = mine.filter((a) => a.date === today && a.status !== "Cancelled");
  const uniquePatients = new Set(mine.map((a) => a.patientId)).size;
  const myConsults = consultations.filter((c) => c.doctorId === doctor.id);
  const unread = notifications.filter((n) => n.audience === "doctor" && !n.read).length;
  const [range, setRange] = useState<"Week" | "Month" | "Year">("Week");

  const todayFormatted = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const appointmentsTrend = useMemo(() => buildCountTrend(mine.map((a) => a.date), range), [mine, range]);

  return (
    <DoctorLayout>
      <PageHeader title={`Welcome back, ${doctor.name}!`} subtitle={todayFormatted} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarDays} label="Today's Appointments" value={todays.length} trend="+2" />
        <StatCard icon={Users} label="Total Patients" value={uniquePatients} trend="+3" />
        <StatCard icon={Stethoscope} label="Consultations" value={myConsults.length} trend="+1" />
        <StatCard icon={Bell} label="Unread Notifications" value={unread} trend={`${unread} new`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Appointments Trend</CardTitle>
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
                <LineChart data={appointmentsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                  <Line type="monotone" dataKey="value" stroke="var(--brand)" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardHeader><CardTitle className="text-base">Consultations by Status</CardTitle></CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: "Not Started", value: myConsults.filter((c) => c.status === "Not Started").length },
                  { name: "In Progress", value: myConsults.filter((c) => c.status === "In Progress").length },
                  { name: "Completed", value: myConsults.filter((c) => c.status === "Completed").length },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                  <Bar dataKey="value" fill="var(--brand)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardHeader><CardTitle className="text-base">Recent Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {notifications.filter((n) => n.audience === "doctor").slice(0, 4).map((n) => (
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
              <Calendar mode="single" selected={new Date()} className="rounded-md" />
            </CardContent>
          </Card>

          <Card className="border-none bg-sidebar text-sidebar-foreground shadow-lg">
            <CardHeader><CardTitle className="text-base text-sidebar-foreground">Today's Schedule</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {todays.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm text-sidebar-foreground/70">No appointments today</div>
              ) : todays.map((a) => {
                const p = patientById[a.patientId];
                return (
                  <div key={a.id} className="rounded-2xl bg-brand p-4 text-brand-foreground shadow-md">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 border-2 border-white/40"><AvatarImage src={p?.avatar} /><AvatarFallback>{p?.name?.[0]}</AvatarFallback></Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{p?.name}</div>
                        <div className="text-xs opacity-90">{a.time} · {a.reason}</div>
                      </div>
                      <StatusBadge status={a.status} className="bg-white/20 text-white border-white/20" />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link to="/doctor/appointments" className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/15 py-1.5 text-xs font-medium hover:bg-white/25"><Eye className="size-3" /> View</Link>
                      {a.status !== "Completed" && a.status !== "In Progress" && (
                        <button onClick={() => { startConsultation(a.id); toast.success("Consultation started"); }}
                          className="flex items-center justify-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/25"><Play className="size-3" /></button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </DoctorLayout>
  );
}
