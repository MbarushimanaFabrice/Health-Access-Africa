import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/role-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { useAppState } from "@/state/app-state";
import { useAuth } from "@/state/auth";
import { buildUserGrowthTrend } from "@/lib/adapters";
import { Users, Stethoscope, CalendarDays, BookOpen, TrendingUp, BellRing, Check, Eye } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar, Legend } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Super Admin Dashboard — Health Access Africa" }] }),
});

function StatCard({ icon: Icon, label, value, trend }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; trend: string }) {
  return (
    <Card className="border-border/60 shadow-[var(--shadow-card)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="grid size-11 place-items-center rounded-full bg-brand-soft text-brand"><Icon className="size-5" /></div>
          {/* <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand"><TrendingUp className="size-3" />{trend}</span> */}
        </div>
        <div className="mt-4 text-3xl font-bold tracking-tight">{value}</div>
        <div className="mt-1 text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

function AdminDashboard() {
  const { currentUser } = useAuth();
  const { patients, doctors, appointments, articles, notifications, toggleUserStatus } = useAppState();
  const [range, setRange] = useState<"Week" | "Month" | "Year">("Month");

  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthAppts = appointments.filter((a) => a.date.startsWith(thisMonth));
  const pending = appointments.filter((a) => a.status === "Pending").length;
  const pendingDoctors = doctors.filter((d) => d.status === "Inactive");
  const recent = [...appointments].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)).slice(0, 6);
  const patientById = useMemo(() => Object.fromEntries(patients.map((p) => [p.id, p])), [patients]);
  const doctorById = useMemo(() => Object.fromEntries(doctors.map((d) => [d.id, d])), [doctors]);

  const statusBar = ["Pending", "Confirmed", "In Progress", "Completed", "Cancelled"].map((s) => ({ name: s, value: appointments.filter((a) => a.status === s).length }));
  const todayFormatted = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const userGrowthTrend = useMemo(
    () => buildUserGrowthTrend(patients.map((p) => p.joined), doctors.map((d) => d.joined), range),
    [patients, doctors, range]
  );

  return (
    <AdminLayout>
      <PageHeader title={`Welcome back, ${currentUser!.name}!`} subtitle={todayFormatted} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total Patients" value={patients.length} trend="+8%" />
        <StatCard icon={Stethoscope} label="Total Doctors" value={doctors.length} trend="+2" />
        <StatCard icon={CalendarDays} label="Appointments (Month)" value={monthAppts.length} trend="+15%" />
        <StatCard icon={BookOpen} label="Health Articles" value={articles.length} trend="+3" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">User Growth</CardTitle>
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
                <LineChart data={userGrowthTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                  <Legend />
                  <Line type="monotone" dataKey="patients" stroke="var(--brand)" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="doctors" stroke="var(--chart-2)" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardHeader><CardTitle className="text-base">Appointments Overview</CardTitle></CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusBar}>
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
            <CardHeader><CardTitle className="text-base">Recent Appointments</CardTitle></CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {recent.map((a) => {
                  const p = patientById[a.patientId]; const d = doctorById[a.doctorId];
                  return (
                    <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                      <Avatar className="size-8"><AvatarImage src={p?.avatar} /><AvatarFallback>{p?.name?.[0]}</AvatarFallback></Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">{p?.name} <span className="text-muted-foreground">→ {d?.name}</span></div>
                        <div className="text-xs text-muted-foreground">{a.date} at {a.time} · {a.reason}</div>
                      </div>
                      <StatusBadge status={a.status} />
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardHeader><CardTitle className="text-base">System Alerts</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="rounded-xl bg-muted/60 p-3 text-sm">🟢 {patients.filter((p) => p.joined >= new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)).length} new user registrations this week</div>
              <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">🟡 {pendingDoctors.length} doctor account(s) pending activation</div>
              <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-900">🔵 {pending} appointments pending confirmation</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardHeader><CardTitle className="text-base">Calendar</CardTitle></CardHeader>
            <CardContent><Calendar mode="single" selected={new Date()} className="rounded-md" /></CardContent>
          </Card>

          <Card className="border-none bg-sidebar text-sidebar-foreground shadow-lg">
            <CardHeader><CardTitle className="text-base text-sidebar-foreground">Recent Activity</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {pendingDoctors.slice(0, 2).map((d) => (
                <div key={d.id} className="rounded-2xl bg-brand p-4 text-brand-foreground shadow-md">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 border-2 border-white/40"><AvatarImage src={d.avatar} /><AvatarFallback>{d.name[0]}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{d.name}</div>
                      <div className="text-xs opacity-90">Pending doctor approval</div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => { toggleUserStatus(d.id); toast.success("Doctor activated"); }} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/15 py-1.5 text-xs font-medium hover:bg-white/25"><Check className="size-3" /> Approve</button>
                    <button className="flex items-center justify-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/25"><Eye className="size-3" /></button>
                  </div>
                </div>
              ))}
              {notifications.filter((n) => n.audience === "admin").slice(0, 2).map((n) => (
                <div key={n.id} className="rounded-2xl bg-brand p-4 text-brand-foreground shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-full bg-white/20"><BellRing className="size-4" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{n.title}</div>
                      <div className="truncate text-xs opacity-90">{n.body}</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
