import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DoctorLayout } from "@/components/doctor-layout";
import { PageHeader } from "@/components/role-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/status-badge";
import { useAppState } from "@/state/app-state";
import { useAuth } from "@/state/auth";
import { Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/doctor/consultations")({
  component: DoctorConsultations,
  head: () => ({ meta: [{ title: "Consultations — Doctor" }] }),
});

function DoctorConsultations() {
  const { currentUser } = useAuth();
  const { consultations, patients, updateConsultationNotes, completeConsultation } = useAppState();
  const patientById = useMemo(() => Object.fromEntries(patients.map((p) => [p.id, p])), [patients]);
  const mine = consultations.filter((c) => c.doctorId === currentUser!.id);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  return (
    <DoctorLayout>
      <PageHeader title="Consultations" subtitle="Write notes and complete visits." />

      <div className="space-y-3">
        {mine.length === 0 ? (
          <Card className="border-border/60 shadow-[var(--shadow-card)]"><CardContent className="py-12 text-center text-sm text-muted-foreground">No consultations yet.</CardContent></Card>
        ) : mine.map((c) => {
          const p = patientById[c.patientId];
          const notes = drafts[c.id] ?? c.notes;
          return (
            <Card key={c.id} className="border-border/60 shadow-[var(--shadow-card)]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10"><AvatarImage src={p?.avatar} /><AvatarFallback>{p?.name?.[0]}</AvatarFallback></Avatar>
                    <div>
                      <div className="text-sm font-semibold">{p?.name}</div>
                      <div className="text-xs text-muted-foreground">{c.date}</div>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <Textarea className="mt-3" rows={4} value={notes} onChange={(e) => setDrafts({ ...drafts, [c.id]: e.target.value })} placeholder="Write consultation notes..." disabled={c.status === "Completed"} />
                <div className="mt-3 flex justify-end gap-2">
                  {c.status !== "Completed" && (
                    <>
                      <Button variant="outline" onClick={() => { updateConsultationNotes(c.id, notes); toast.success("Notes saved"); }}>Save notes</Button>
                      <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => { updateConsultationNotes(c.id, notes); completeConsultation(c.id); toast.success("Consultation completed"); }}>
                        <Check className="size-4" /> Complete
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DoctorLayout>
  );
}
