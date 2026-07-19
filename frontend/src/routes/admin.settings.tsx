import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/role-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/state/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
  head: () => ({ meta: [{ title: "Settings — Admin" }] }),
});

function AdminSettings() {
  const { currentUser } = useAuth();
  const admin = currentUser!;
  const [form, setForm] = useState({ name: admin.name, email: admin.email, phone: admin.phone });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [prefs, setPrefs] = useState({ userAlerts: true, contentAlerts: true, systemAlerts: false });

  return (
    <AdminLayout>
      <PageHeader title="Settings" subtitle="Your admin profile and preferences." />
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-border/60 shadow-[var(--shadow-card)] xl:col-span-1">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar className="size-24 border-4 border-brand/20"><AvatarImage src={admin.avatar} /><AvatarFallback>{admin.name[0]}</AvatarFallback></Avatar>
            <div className="mt-4 text-lg font-semibold">{admin.name}</div>
            <div className="text-sm text-muted-foreground">Super Admin</div>
            <div className="mt-1 text-xs text-muted-foreground">{admin.email}</div>
          </CardContent>
        </Card>
        <div className="space-y-6 xl:col-span-2">
          <Card className="border-border/60 shadow-[var(--shadow-card)]">
            <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Full Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-2 md:col-span-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
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
            <CardHeader><CardTitle className="text-base">System Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between"><Label>User registration alerts</Label><Switch checked={prefs.userAlerts} onCheckedChange={(v) => setPrefs({ ...prefs, userAlerts: v })} /></div>
              <div className="flex items-center justify-between"><Label>Content submission alerts</Label><Switch checked={prefs.contentAlerts} onCheckedChange={(v) => setPrefs({ ...prefs, contentAlerts: v })} /></div>
              <div className="flex items-center justify-between"><Label>System status alerts</Label><Switch checked={prefs.systemAlerts} onCheckedChange={(v) => setPrefs({ ...prefs, systemAlerts: v })} /></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
