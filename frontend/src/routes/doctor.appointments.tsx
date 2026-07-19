import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DoctorLayout } from "@/components/doctor-layout";
import { PageHeader } from "@/components/role-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/status-badge";
import { useAppState } from "@/state/app-state";
import { useAuth } from "@/state/auth";
import { type Appointment, type AppointmentStatus } from "@/mock/data";
import { Eye, Video } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/doctor/appointments")({
  component: DoctorAppointments,
  head: () => ({ meta: [{ title: "Appointments — Doctor" }] }),
});

function DoctorAppointments() {
  const { currentUser } = useAuth();
  const { appointments, patients, consultations, updateAppointmentStatus, startVideoCall } = useAppState();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [detail, setDetail] = useState<Appointment | null>(null);
  const patientById = useMemo(() => Object.fromEntries(patients.map((p) => [p.id, p])), [patients]);
  const consultByAppt = useMemo(
    () => Object.fromEntries(consultations.map((c) => [c.appointmentId, c])),
    [consultations]
  );

  const mine = appointments.filter((a) => a.doctorId === currentUser!.id);
  const visible = filter === "all" ? mine : mine.filter((a) => a.status === filter);

  const statuses: AppointmentStatus[] = ["Confirmed", "Pending", "In Progress", "Completed", "Cancelled"];

  return (
    <DoctorLayout>
      <PageHeader title="Appointments" subtitle="Manage your incoming and scheduled appointments." />

      <Card className="border-border/60 shadow-[var(--shadow-card)]">
        <CardContent className="p-4 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No appointments.</TableCell></TableRow>
                ) : visible.map((a) => {
                  const p = patientById[a.patientId];
                  return (
                    <TableRow key={a.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8"><AvatarImage src={p?.avatar} /><AvatarFallback>{p?.name?.[0]}</AvatarFallback></Avatar>
                          <div className="text-sm font-medium">{p?.name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{a.reason}</TableCell>
                      <TableCell className="text-sm">{a.date}</TableCell>
                      <TableCell className="text-sm">{a.time}</TableCell>
                      <TableCell><StatusBadge status={a.status} /></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setDetail(a)}><Eye className="size-4" /> View</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Appointment</DialogTitle></DialogHeader>
          {detail && (() => {
            const p = patientById[detail.patientId];
            return (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-12"><AvatarImage src={p?.avatar} /><AvatarFallback>{p?.name?.[0]}</AvatarFallback></Avatar>
                  <div>
                    <div className="text-sm font-semibold">{p?.name}</div>
                    <div className="text-xs text-muted-foreground">{p?.district}</div>
                  </div>
                </div>
                <div className="grid gap-1 text-sm">
                  <div><span className="text-muted-foreground">Date: </span>{detail.date} at {detail.time}</div>
                  <div><span className="text-muted-foreground">Reason: </span>{detail.reason}</div>
                  <div><span className="text-muted-foreground">Status: </span><StatusBadge status={detail.status} /></div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {statuses.map((s) => (
                    <Button key={s} size="sm" variant={detail.status === s ? "default" : "outline"}
                      className={detail.status === s ? "bg-brand text-brand-foreground hover:bg-brand/90" : ""}
                      onClick={() => { updateAppointmentStatus(detail.id, s); setDetail({ ...detail, status: s }); toast(`Set to ${s}`); }}>
                      {s}
                    </Button>
                  ))}
                </div>
                {(detail.status === "Confirmed" || detail.status === "In Progress") && (
                  <div className="pt-2">
                    <Button
                      className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
                      onClick={async () => {
                        try {
                          await startVideoCall(detail.id);
                          navigate({ to: "/call/$appointmentId", params: { appointmentId: detail.id } });
                        } catch (e) {
                          toast.error(e instanceof Error ? e.message : "Could not start the video call");
                        }
                      }}
                    >
                      <Video className="size-4" />
                      {consultByAppt[detail.id]?.videoRoomId ? "Join Video Call" : "Start Video Call"}
                    </Button>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </DoctorLayout>
  );
}
