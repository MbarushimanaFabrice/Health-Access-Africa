import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DoctorLayout } from "@/components/doctor-layout";
import { PageHeader } from "@/components/role-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAppState } from "@/state/app-state";
import { useAuth } from "@/state/auth";
import { Search } from "lucide-react";
import type { Patient } from "@/mock/data";

export const Route = createFileRoute("/doctor/patients")({
  component: DoctorPatients,
  head: () => ({ meta: [{ title: "Patients — Doctor" }] }),
});

function DoctorPatients() {
  const { currentUser } = useAuth();
  const { appointments, patients } = useAppState();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Patient | null>(null);

  const myPatientIds = useMemo(() => Array.from(new Set(appointments.filter((a) => a.doctorId === currentUser!.id).map((a) => a.patientId))), [appointments, currentUser]);
  const myPatients = patients.filter((p) => myPatientIds.includes(p.id));
  const visible = myPatients.filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()));

  const apptCount = (id: string) => appointments.filter((a) => a.patientId === id && a.doctorId === currentUser!.id).length;

  return (
    <DoctorLayout>
      <PageHeader title="Patients" subtitle="All patients under your care." />

      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patients" className="pl-9" />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((p) => (
          <Card key={p.id} className="cursor-pointer border-border/60 shadow-[var(--shadow-card)] transition hover:border-brand/40" onClick={() => setSelected(p)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-12"><AvatarImage src={p.avatar} /><AvatarFallback>{p.name[0]}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.district} · {p.gender}</div>
                </div>
                <Badge variant="outline" className="rounded-full">{apptCount(p.id)} visits</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        {visible.length === 0 && <div className="col-span-full py-12 text-center text-sm text-muted-foreground">No patients yet.</div>}
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader><SheetTitle>Patient details</SheetTitle></SheetHeader>
          {selected && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-14"><AvatarImage src={selected.avatar} /><AvatarFallback>{selected.name[0]}</AvatarFallback></Avatar>
                <div>
                  <div className="text-base font-semibold">{selected.name}</div>
                  <div className="text-xs text-muted-foreground">{selected.email} · {selected.phone}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-xs text-muted-foreground">District</div><div className="font-medium">{selected.district}</div></div>
                <div><div className="text-xs text-muted-foreground">Gender</div><div className="font-medium">{selected.gender}</div></div>
                <div><div className="text-xs text-muted-foreground">DOB</div><div className="font-medium">{selected.dob}</div></div>
                <div><div className="text-xs text-muted-foreground">Visits</div><div className="font-medium">{apptCount(selected.id)}</div></div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Allergies</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selected.allergies.length === 0 ? <span className="text-sm text-muted-foreground">None</span> : selected.allergies.map((a) => <Badge key={a} variant="outline" className="rounded-full">{a}</Badge>)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Chronic Conditions</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selected.chronicConditions.length === 0 ? <span className="text-sm text-muted-foreground">None</span> : selected.chronicConditions.map((c) => <Badge key={c} variant="outline" className="rounded-full">{c}</Badge>)}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </DoctorLayout>
  );
}
