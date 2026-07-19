import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PatientLayout } from "@/components/patient-layout";
import { PageHeader } from "@/components/role-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/status-badge";
import { useAppState } from "@/state/app-state";
import { useAuth } from "@/state/auth";

export const Route = createFileRoute("/patient/consultations")({
  component: PatientConsultations,
  head: () => ({ meta: [{ title: "My Consultations — Health Access Africa" }] }),
});

function PatientConsultations() {
  const { currentUser } = useAuth();
  const { consultations, doctors } = useAppState();
  const doctorById = useMemo(() => Object.fromEntries(doctors.map((d) => [d.id, d])), [doctors]);
  const mine = consultations.filter((c) => c.patientId === currentUser!.id);

  return (
    <PatientLayout>
      <PageHeader title="My Consultations" subtitle="Doctor notes and summaries from your visits." />
      {mine.length === 0 ? (
        <Card className="border-border/60 shadow-[var(--shadow-card)]">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">No consultations yet.</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {mine.map((c) => {
            const d = doctorById[c.doctorId];
            return (
              <Card key={c.id} className="border-border/60 shadow-[var(--shadow-card)]">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Avatar className="size-10"><AvatarImage src={d?.avatar} /><AvatarFallback>{d?.name?.[0]}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold">{d?.name}</div>
                          <div className="text-xs text-muted-foreground">{d?.specialty} · {c.date}</div>
                        </div>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="mt-3 rounded-xl bg-muted/60 p-3 text-sm">
                        {c.notes || <span className="text-muted-foreground">No notes yet.</span>}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PatientLayout>
  );
}
