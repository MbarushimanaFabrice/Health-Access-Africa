import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/role-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { useAppState } from "@/state/app-state";
import type { Appointment } from "@/mock/data";
import { Eye, Search } from "lucide-react";

export const Route = createFileRoute("/admin/appointments")({
  component: AdminAppointments,
  head: () => ({ meta: [{ title: "Appointments — Admin" }] }),
});

function AdminAppointments() {
  const { appointments, patients, doctors } = useAppState();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [detail, setDetail] = useState<Appointment | null>(null);
  const patientById = useMemo(() => Object.fromEntries(patients.map((p) => [p.id, p])), [patients]);
  const doctorById = useMemo(() => Object.fromEntries(doctors.map((d) => [d.id, d])), [doctors]);

  const visible = appointments.filter((a) => {
    if (status !== "all" && a.status !== status) return false;
    if (q) {
      const s = q.toLowerCase();
      const p = patientById[a.patientId]; const d = doctorById[a.doctorId];
      if (!`${p?.name} ${d?.name} ${a.reason}`.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  return (
    <AdminLayout>
      <PageHeader title="Appointments" subtitle="System-wide appointments (read-only)." />
      <Card className="border-border/60 shadow-[var(--shadow-card)]">
        <CardContent className="p-4 md:p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient, doctor, reason" className="pl-9" /></div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">Any status</SelectItem>{["Confirmed","Pending","In Progress","Completed","Cancelled"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Doctor</TableHead><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Reason</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {visible.map((a) => {
                  const p = patientById[a.patientId]; const d = doctorById[a.doctorId];
                  return (
                    <TableRow key={a.id}>
                      <TableCell><div className="flex items-center gap-2"><Avatar className="size-7"><AvatarImage src={p?.avatar} /><AvatarFallback>{p?.name?.[0]}</AvatarFallback></Avatar><span className="text-sm">{p?.name}</span></div></TableCell>
                      <TableCell><div className="flex items-center gap-2"><Avatar className="size-7"><AvatarImage src={d?.avatar} /><AvatarFallback>{d?.name?.[0]}</AvatarFallback></Avatar><span className="text-sm">{d?.name}</span></div></TableCell>
                      <TableCell className="text-sm">{a.date}</TableCell>
                      <TableCell className="text-sm">{a.time}</TableCell>
                      <TableCell className="text-sm">{a.reason}</TableCell>
                      <TableCell><StatusBadge status={a.status} /></TableCell>
                      <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => setDetail(a)}><Eye className="size-4" /></Button></TableCell>
                    </TableRow>
                  );
                })}
                {visible.length === 0 && <TableRow><TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">No appointments match.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Appointment details</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">Patient: </span>{patientById[detail.patientId]?.name}</div>
              <div><span className="text-muted-foreground">Doctor: </span>{doctorById[detail.doctorId]?.name}</div>
              <div><span className="text-muted-foreground">Date: </span>{detail.date} at {detail.time}</div>
              <div><span className="text-muted-foreground">Reason: </span>{detail.reason}</div>
              <div><span className="text-muted-foreground">Status: </span><StatusBadge status={detail.status} /></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
