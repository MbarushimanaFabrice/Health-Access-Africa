import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PatientLayout } from "@/components/patient-layout";
import { PageHeader } from "@/components/role-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppState } from "@/state/app-state";
import { useAuth } from "@/state/auth";
import { districts, type Patient } from "@/mock/data";
import { X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/patient/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "My Profile — Health Access Africa" }] }),
});

function ProfilePage() {
  const { currentUser } = useAuth();
  const { updatePatient } = useAppState();
  const patient = currentUser as Patient;

  const [form, setForm] = useState<Patient>(patient);
  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");

  const save = () => {
    updatePatient(patient.id, form);
    toast.success("Profile updated");
  };

  return (
    <PatientLayout>
      <PageHeader title="My Profile" subtitle="Keep your personal and medical info up to date." />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-border/60 shadow-[var(--shadow-card)] xl:col-span-1">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar className="size-24 border-4 border-brand/20"><AvatarImage src={patient.avatar} /><AvatarFallback>{patient.name[0]}</AvatarFallback></Avatar>
            <div className="mt-4 text-lg font-semibold">{patient.name}</div>
            <div className="text-sm text-muted-foreground">{patient.email}</div>
            <div className="mt-4 grid w-full grid-cols-2 gap-3 text-left text-sm">
              <div><div className="text-xs text-muted-foreground">District</div><div className="font-medium">{patient.district}</div></div><br />
              <div><div className="text-xs text-muted-foreground">Gender</div><div className="font-medium">{patient.gender}</div></div>
              <div className="col-span-2"><div className="text-xs text-muted-foreground">Date of Birth</div><div className="font-medium">{patient.dob}</div></div>
            </div>
          </CardContent>
        </Card>
{/*  */}
        <div className="space-y-6 xl:col-span-2">
          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Full Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>District</Label>
                <Select value={form.district} onValueChange={(v) => setForm({ ...form, district: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v as Patient["gender"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Female">Female</SelectItem><SelectItem value="Male">Male</SelectItem></SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardHeader><CardTitle className="text-base">Medical Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Allergies</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.allergies.map((a) => (
                    <Badge key={a} variant="outline" className="rounded-full">
                      {a}
                      <button onClick={() => setForm({ ...form, allergies: form.allergies.filter((x) => x !== a) })} className="ml-1 rounded-full hover:bg-muted"><X className="size-3" /></button>
                    </Badge>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <Input value={newAllergy} onChange={(e) => setNewAllergy(e.target.value)} placeholder="Add allergy" />
                  <Button variant="outline" onClick={() => { if (newAllergy.trim()) { setForm({ ...form, allergies: [...form.allergies, newAllergy.trim()] }); setNewAllergy(""); } }}>Add</Button>
                </div>
              </div>
              <div>
                <Label>Chronic Conditions</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.chronicConditions.map((c) => (
                    <Badge key={c} variant="outline" className="rounded-full">
                      {c}
                      <button onClick={() => setForm({ ...form, chronicConditions: form.chronicConditions.filter((x) => x !== c) })} className="ml-1 rounded-full hover:bg-muted"><X className="size-3" /></button>
                    </Badge>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <Input value={newCondition} onChange={(e) => setNewCondition(e.target.value)} placeholder="Add condition" />
                  <Button variant="outline" onClick={() => { if (newCondition.trim()) { setForm({ ...form, chronicConditions: [...form.chronicConditions, newCondition.trim()] }); setNewCondition(""); } }}>Add</Button>
                </div>
              </div>
              <Button onClick={save} className="bg-brand text-brand-foreground hover:bg-brand/90">Save Changes</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PatientLayout>
  );
}
