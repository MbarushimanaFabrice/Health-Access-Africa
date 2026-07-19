import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PatientLayout } from "@/components/patient-layout";
import { PageHeader } from "@/components/role-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/status-badge";
import { useAppState } from "@/state/app-state";
import { useAuth } from "@/state/auth";
import { CalendarPlus, Video, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/patient/appointments")({
  component: MyAppointments,
  head: () => ({ meta: [{ title: "My Appointments — Health Access Africa" }] }),
});

function MyAppointments() {
  const { currentUser } = useAuth();
  const { appointments, doctors, consultations, updateAppointmentStatus } = useAppState();
  const [filter, setFilter] = useState("all");
  const doctorById = useMemo(() => Object.fromEntries(doctors.map((d) => [d.id, d])), [doctors]);
  const consultByAppt = useMemo(
    () => Object.fromEntries(consultations.map((c) => [c.appointmentId, c])),
    [consultations]
  );

  const mine = appointments.filter((a) => a.patientId === currentUser!.id);
  const visible = filter === "all" ? mine : mine.filter((a) => a.status === filter);

  return (
    <PatientLayout>
      <PageHeader
        title="My Appointments"
        subtitle="Your booked, pending, and completed appointments."
        actions={
          <Button asChild className="bg-brand text-brand-foreground hover:bg-brand/90">
            <Link to="/patient/book"><CalendarPlus className="size-4" /> Book Appointment</Link>
          </Button>
        }
      />

      <Card className="border-border/60 shadow-[var(--shadow-card)]">
        <CardContent className="p-4 md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No appointments to show.</TableCell></TableRow>
                ) : visible.map((a) => {
                  const d = doctorById[a.doctorId];
                  const canCancel = a.status === "Pending" || a.status === "Confirmed";
                  const consult = consultByAppt[a.id];
                  const callLive =
                    Boolean(consult?.videoRoomId) &&
                    consult?.status !== "Completed" &&
                    a.status !== "Completed" &&
                    a.status !== "Cancelled";
                  return (
                    <TableRow key={a.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8"><AvatarImage src={d?.avatar} /><AvatarFallback>{d?.name?.[0]}</AvatarFallback></Avatar>
                          <div>
                            <div className="text-sm font-medium">{d?.name}</div>
                            <div className="text-xs text-muted-foreground">{d?.specialty}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{a.reason}</TableCell>
                      <TableCell className="text-sm">{a.date}</TableCell>
                      <TableCell className="text-sm">{a.time}</TableCell>
                      <TableCell><StatusBadge status={a.status} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!callLive && !canCancel && (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                          {callLive && (
                            <Button asChild size="sm" className="bg-brand text-brand-foreground hover:bg-brand/90">
                              <Link to="/call/$appointmentId" params={{ appointmentId: a.id }}>
                                <Video className="size-4" /> Join Call
                              </Link>
                            </Button>
                          )}
                          {canCancel && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700"><X className="size-4" /> Cancel</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  You'll need to book again if you change your mind.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep it</AlertDialogCancel>
                                <AlertDialogAction onClick={() => { updateAppointmentStatus(a.id, "Cancelled"); toast("Appointment cancelled"); }}>Cancel appointment</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PatientLayout>
  );
}
