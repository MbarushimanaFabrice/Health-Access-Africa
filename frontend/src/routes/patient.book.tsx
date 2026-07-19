import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PatientLayout } from "@/components/patient-layout";
import { PageHeader } from "@/components/role-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useAppState } from "@/state/app-state";
import { useAuth } from "@/state/auth";
import { districts } from "@/mock/data";
import { Search, MapPin, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/patient/book")({
  component: BookPage,
  head: () => ({ meta: [{ title: "Book Appointment — Health Access Africa" }] }),
});

const timeSlots = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

function BookPage() {
  const { currentUser } = useAuth();
  const { doctors, bookAppointment } = useAppState();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [q, setQ] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [district, setDistrict] = useState("all");
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const activeDoctors = useMemo(() => doctors.filter((d) => d.status === "Active"), [doctors]);
  const specialties = useMemo(() => Array.from(new Set(activeDoctors.map((d) => d.specialty))), [activeDoctors]);

  const filtered = activeDoctors.filter((d) => {
    if (specialty !== "all" && d.specialty !== specialty) return false;
    if (district !== "all" && d.district !== district) return false;
    if (q && !`${d.name} ${d.specialty} ${d.hospital}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const selectedDoctor = doctors.find((d) => d.id === doctorId);
  const canNext = (step === 1 && !!doctorId) || (step === 2 && !!date && !!time) || (step === 3 && reason.trim().length > 0);

  const submit = () => {
    if (!selectedDoctor || !date || !time || !currentUser) return;
    bookAppointment({ patientId: currentUser.id, doctorId: selectedDoctor.id, date: date.toISOString().slice(0, 10), time, reason: reason.trim() });
    setConfirmed(true);
    toast.success("Appointment booked");
  };

  if (confirmed) {
    return (
      <PatientLayout>
        <div className="mx-auto max-w-lg py-12 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-brand-soft text-brand"><CheckCircle2 className="size-8" /></div>
          <h2 className="mt-4 text-2xl font-semibold">Appointment Requested</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your appointment with <b>{selectedDoctor?.name}</b> on <b>{date?.toDateString()}</b> at <b>{time}</b> is pending confirmation.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="outline" onClick={() => { setConfirmed(false); setStep(1); setDoctorId(null); setDate(undefined); setTime(null); setReason(""); }}>Book another</Button>
            <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => navigate({ to: "/patient/appointments" })}>View my appointments</Button>
          </div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <PageHeader title="Book an Appointment" subtitle="Find a doctor, pick a time, and describe your visit." />

      <div className="mb-6 flex items-center gap-2">
        {["Select Doctor", "Date & Time", "Reason", "Review"].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={cn("grid size-7 place-items-center rounded-full text-xs font-semibold", step >= i + 1 ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground")}>{i + 1}</div>
            <span className={cn("hidden text-sm font-medium sm:inline", step === i + 1 ? "text-foreground" : "text-muted-foreground")}>{label}</span>
            {i < 3 && <div className="h-px w-6 bg-border" />}
          </div>
        ))}
      </div>

      <Card className="border-border/60 shadow-[var(--shadow-card)]">
        <CardContent className="p-6">
          {step === 1 && (
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                <div className="relative min-w-[220px] flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or hospital" className="pl-9" />
                </div>
                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Specialty" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All specialties</SelectItem>
                    {specialties.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="District" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All districts</SelectItem>
                    {districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {filtered.map((d) => (
                  <button key={d.id} onClick={() => setDoctorId(d.id)}
                    className={cn("flex items-start gap-3 rounded-2xl border p-4 text-left transition",
                      doctorId === d.id ? "border-brand bg-brand-soft" : "border-border hover:border-brand/40 hover:bg-muted/40")}>
                    <Avatar className="size-12"><AvatarImage src={d.avatar} /><AvatarFallback>{d.name[0]}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold">{d.name}</div>
                      <div className="text-xs text-muted-foreground">{d.specialty}</div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" /> {d.hospital} · {d.district}</div>
                    </div>
                    <Badge variant="outline" className="rounded-full text-xs">{d.yearsExperience}y</Badge>
                  </button>
                ))}
                {filtered.length === 0 && <div className="col-span-full p-8 text-center text-sm text-muted-foreground">No doctors match your filters.</div>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="mb-2 text-sm font-medium">Select date</div>
                <Calendar mode="single" selected={date} onSelect={setDate}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md border pointer-events-auto" />
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">Select time</div>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((t) => (
                    <button key={t} onClick={() => setTime(t)}
                      className={cn("rounded-lg border py-2 text-sm font-medium transition",
                        time === t ? "border-brand bg-brand text-brand-foreground" : "border-border hover:bg-muted")}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="mb-2 text-sm font-medium">Reason for visit</div>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Briefly describe your symptoms" rows={6} />
            </div>
          )}

          {step === 4 && selectedDoctor && date && time && (
            <div className="space-y-4">
              <div className="text-sm font-medium">Review your appointment</div>
              <div className="rounded-2xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-12"><AvatarImage src={selectedDoctor.avatar} /><AvatarFallback>{selectedDoctor.name[0]}</AvatarFallback></Avatar>
                  <div>
                    <div className="text-sm font-semibold">{selectedDoctor.name}</div>
                    <div className="text-xs text-muted-foreground">{selectedDoctor.specialty} · {selectedDoctor.hospital}</div>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 text-sm">
                  <div><span className="text-muted-foreground">Date: </span>{date.toDateString()}</div>
                  <div><span className="text-muted-foreground">Time: </span>{time}</div>
                  <div><span className="text-muted-foreground">Reason: </span>{reason}</div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
              <ArrowLeft className="size-4" /> Back
            </Button>
            {step < 4 ? (
              <Button className="bg-brand text-brand-foreground hover:bg-brand/90" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
                Next <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={submit}>Confirm booking</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </PatientLayout>
  );
}
