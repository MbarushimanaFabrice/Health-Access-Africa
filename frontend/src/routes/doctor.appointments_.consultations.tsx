import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DoctorLayout } from "@/components/doctor-layout";
import { PageHeader } from "@/components/role-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConsultationForm } from "@/components/consultation-form";
import { useAppState } from "@/state/app-state";
import { useAuth } from "@/state/auth";
import type { Consultation } from "@/mock/data";
import { ArrowLeft, FileText, Search } from "lucide-react";

export const Route = createFileRoute("/doctor/appointments_/consultations")({
  component: DoctorAppointmentConsultations,
  head: () => ({ meta: [{ title: "Consultations — Doctor" }] }),
});

type Filter = "all" | "draft" | "sent" | "pending";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Not written" },
  { key: "draft", label: "Drafts" },
  { key: "sent", label: "Sent" },
];

interface Row {
  appointmentId: string;
  patientId: string;
  date: string;
  time: string;
  reason: string;
  consultation?: Consultation;
}

function rowFilter(row: Row): Filter {
  if (!row.consultation) return "pending";
  return row.consultation.shared ? "sent" : "draft";
}

function DoctorAppointmentConsultations() {
  const { currentUser } = useAuth();
  const { appointments, consultations, patients } = useAppState();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<Row | null>(null);

  const patientById = useMemo(() => Object.fromEntries(patients.map((p) => [p.id, p])), [patients]);

  // Consultations only exist once notes are written, so completed appointments
  // without one still need a row here — they are the work left to do.
  const rows: Row[] = useMemo(() => {
    const byAppointment = Object.fromEntries(consultations.map((c) => [c.appointmentId, c]));
    return appointments
      .filter((a) => a.doctorId === currentUser!.id)
      .filter((a) => byAppointment[a.id] || a.status === "Completed")
      .map((a) => ({
        appointmentId: a.id,
        patientId: a.patientId,
        date: a.date,
        time: a.time,
        reason: a.reason,
        consultation: byAppointment[a.id],
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [appointments, consultations, currentUser]);

  const counts = useMemo(() => {
    const c = { all: rows.length, pending: 0, draft: 0, sent: 0 };
    rows.forEach((r) => { c[rowFilter(r)] += 1; });
    return c;
  }, [rows]);

  const query = search.trim().toLowerCase();
  const visible = rows.filter((r) => {
    if (filter !== "all" && rowFilter(r) !== filter) return false;
    if (!query) return true;
    const name = patientById[r.patientId]?.name?.toLowerCase() ?? "";
    return name.includes(query) || r.reason.toLowerCase().includes(query);
  });

  // The dialog holds a snapshot, so re-read the live consultation after a save.
  const openRow = open ? rows.find((r) => r.appointmentId === open.appointmentId) ?? open : null;

  return (
    <DoctorLayout>
      <PageHeader
        title="Consultations"
        subtitle="Write up visits, keep private drafts, and send notes to your patients."
      />

      <div className="mb-4">
        <Button asChild variant="outline" size="sm">
          <Link to="/doctor/appointments">
            <ArrowLeft className="size-4" /> Back to appointments
          </Link>
        </Button>
      </div>

      <Card className="border-border/60 shadow-[var(--shadow-card)]">
        <CardContent className="p-4 md:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <Button
                key={f.key}
                size="sm"
                variant={filter === f.key ? "default" : "outline"}
                className={filter === f.key ? "bg-brand text-brand-foreground hover:bg-brand/90" : ""}
                onClick={() => setFilter(f.key)}
              >
                {f.label} ({counts[f.key]})
              </Button>
            ))}
            <div className="relative ml-auto w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search patient or reason"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            {visible.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No consultations here yet.
              </div>
            ) : visible.map((r) => {
              const p = patientById[r.patientId];
              const state = rowFilter(r);
              return (
                <div
                  key={r.appointmentId}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-border/60 p-4"
                >
                  <Avatar className="size-10">
                    <AvatarImage src={p?.avatar} />
                    <AvatarFallback>{p?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-40 flex-1">
                    <div className="text-sm font-semibold">{p?.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.date} at {r.time} · {r.reason || "No reason given"}
                    </div>
                    {r.consultation?.notes && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {r.consultation.notes}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={state === "sent" ? "default" : "outline"}
                    className={state === "sent" ? "bg-brand text-brand-foreground" : ""}
                  >
                    {state === "sent" ? "Sent" : state === "draft" ? "Draft" : "Not written"}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => setOpen(r)}>
                    <FileText className="size-4" />
                    {state === "pending" ? "Write" : "Manage"}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!openRow} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {openRow ? `${patientById[openRow.patientId]?.name ?? "Patient"} — ${openRow.date}` : ""}
            </DialogTitle>
          </DialogHeader>
          {openRow && (
            <ConsultationForm
              key={openRow.appointmentId}
              appointmentId={openRow.appointmentId}
              consultation={openRow.consultation}
              rows={8}
            />
          )}
        </DialogContent>
      </Dialog>
    </DoctorLayout>
  );
}
