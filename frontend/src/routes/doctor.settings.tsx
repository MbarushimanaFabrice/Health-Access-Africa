import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DoctorLayout } from "@/components/doctor-layout";
import { PageHeader } from "@/components/role-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/state/auth";
import { toast } from "sonner";
import type { Doctor } from "@/mock/data";

export const Route = createFileRoute("/doctor/settings")({
  component: DoctorSettings,
  head: () => ({ meta: [{ title: "Settings — Doctor" }] }),
});

function DoctorSettings() {
  const { currentUser } = useAuth();
  const doctor = currentUser as Doctor;
  const [form, setForm] = useState({ name: doctor.name, email: doctor.email, phone: doctor.phone, hospital: doctor.hospital, specialty: doctor.specialty });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [prefs, setPrefs] = useState({ email: true, sms: false, marketing: false });

  return (
    <DoctorLayout>
      <PageHeader title="Settings" subtitle="Manage your account and preferences." />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-border/60 shadow-[var(--shadow-card)] xl:col-span-1">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar className="size-24 border-4 border-brand/20"><AvatarImage src={doctor.avatar} /><AvatarFallback>{doctor.name[0]}</AvatarFallback></Avatar>
            <div className="mt-4 text-lg font-semibold">{doctor.name}</div>
            <div className="text-sm text-muted-foreground">{doctor.specialty}</div>
            <div className="mt-1 text-xs text-muted-foreground">{doctor.hospital}</div>
          </CardContent>
        </Card>

        <div className="space-y-6 xl:col-span-2">
          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Full Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Specialty</Label><Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} /></div>
              <div className="space-y-2 md:col-span-2"><Label>Hospital</Label><Input value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })} /></div>
              <div className="md:col-span-2"><Button onClick={() => toast.success("Profile saved")} className="bg-brand text-brand-foreground hover:bg-brand/90">Save Changes</Button></div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2"><Label>Current</Label><Input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></div>
              <div className="space-y-2"><Label>New</Label><Input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></div>
              <div className="space-y-2"><Label>Confirm</Label><Input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></div>
              <div className="md:col-span-3"><Button variant="outline" onClick={() => toast.success("Password updated")}>Update Password</Button></div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardHeader><CardTitle className="text-base">Notification Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between"><Label>Email notifications</Label><Switch checked={prefs.email} onCheckedChange={(v) => setPrefs({ ...prefs, email: v })} /></div>
              <div className="flex items-center justify-between"><Label>SMS reminders</Label><Switch checked={prefs.sms} onCheckedChange={(v) => setPrefs({ ...prefs, sms: v })} /></div>
              <div className="flex items-center justify-between"><Label>Product updates</Label><Switch checked={prefs.marketing} onCheckedChange={(v) => setPrefs({ ...prefs, marketing: v })} /></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DoctorLayout>
  );
}
