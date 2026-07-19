import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/role-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppState } from "@/state/app-state";
import { districts } from "@/mock/data";
import { ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/admin/reports")({
  component: Reports,
  head: () => ({ meta: [{ title: "Reports — Admin" }] }),
});

const chartColors = ["var(--brand)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function Reports() {
  const { patients, doctors, appointments } = useAppState();

  const usersByDistrict = useMemo(() =>
    districts.map((d) => ({ name: d, patients: patients.filter((p) => p.district === d).length, doctors: doctors.filter((x) => x.district === d).length })),
    [patients, doctors]);

  const apptByStatus = useMemo(() =>
    ["Pending", "Confirmed", "In Progress", "Completed", "Cancelled"].map((s) => ({ name: s, value: appointments.filter((a) => a.status === s).length })),
    [appointments]);

  const doctorWorkload = useMemo(() =>
    doctors.map((d) => ({ name: d.name.replace("Dr. ", ""), value: appointments.filter((a) => a.doctorId === d.id).length })).sort((a, b) => b.value - a.value),
    [doctors, appointments]);

  const completed = appointments.filter((a) => a.status === "Completed").length;
  const rate = appointments.length ? Math.round((completed / appointments.length) * 100) : 0;
  const topDoctor = doctorWorkload[0]?.name ?? "—";
  const busiestDistrict = [...usersByDistrict].sort((a, b) => b.patients + b.doctors - (a.patients + a.doctors))[0]?.name ?? "—";

  return (
    <AdminLayout>
      <PageHeader title="Reports" subtitle="Platform-wide analytics." />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 shadow-[var(--shadow-card)]"><CardContent className="p-5"><div className="text-sm text-muted-foreground">Most Active Doctor</div><div className="mt-2 text-xl font-bold">{topDoctor}</div></CardContent></Card>
        <Card className="border-border/60 shadow-[var(--shadow-card)]"><CardContent className="p-5"><div className="text-sm text-muted-foreground">Busiest District</div><div className="mt-2 text-xl font-bold">{busiestDistrict}</div></CardContent></Card>
        <Card className="border-border/60 shadow-[var(--shadow-card)]"><CardContent className="p-5"><div className="text-sm text-muted-foreground">Completion Rate</div><div className="mt-2 text-xl font-bold">{rate}%</div></CardContent></Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="border-border/60 shadow-[var(--shadow-card)]">
          <CardHeader><CardTitle className="text-base">Users by District</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usersByDistrict}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" fontSize={12} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis fontSize={12} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                <Legend />
                <Bar dataKey="patients" fill="var(--brand)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="doctors" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-card)]">
          <CardHeader><CardTitle className="text-base">Appointments by Status</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={apptByStatus} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                  {apptByStatus.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-[var(--shadow-card)] xl:col-span-2">
          <CardHeader><CardTitle className="text-base">Doctor Workload</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={doctorWorkload}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" fontSize={11} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis fontSize={12} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                <Bar dataKey="value" name="Appointments" fill="var(--brand)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
