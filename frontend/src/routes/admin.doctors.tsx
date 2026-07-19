import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/role-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/status-badge";
import { useAppState } from "@/state/app-state";
import { districts, specialties, type Doctor } from "@/mock/data";
import { Search, Plus, MoreVertical } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/doctors")({
  component: AdminDoctors,
  head: () => ({ meta: [{ title: "Doctors — Admin" }] }),
});

function AdminDoctors() {
  const { doctors, appointments, addDoctor, toggleUserStatus, deleteUser } = useAppState();
  const [q, setQ] = useState("");
  const [spec, setSpec] = useState("all");
  const [toDelete, setToDelete] = useState<Doctor | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", specialty: specialties[0], hospital: "", district: districts[0] });
  const [credentials, setCredentials] = useState<{ name: string; email: string; password: string } | null>(null);

  const patientCount = useMemo(() => {
    const m: Record<string, number> = {};
    for (const a of appointments) m[a.doctorId] = (m[a.doctorId] ?? 0) + 1;
    return m;
  }, [appointments]);

  const visible = doctors.filter((d) => {
    if (spec !== "all" && d.specialty !== spec) return false;
    if (q && !`${d.name} ${d.hospital}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const submit = async () => {
    if (!form.name || !form.email) { toast.error("Name and email required"); return; }
    try {
      const { temporaryPassword } = await addDoctor(form);
      setAddOpen(false);
      setCredentials({ name: form.name, email: form.email, password: temporaryPassword });
      setForm({ name: "", email: "", phone: "", specialty: specialties[0], hospital: "", district: districts[0] });
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const onToggleStatus = async (id: string) => {
    try {
      await toggleUserStatus(id);
      toast.success("Status updated");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const onDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteUser(toDelete.id);
      toast("Doctor deleted");
      setToDelete(null);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <AdminLayout>
      <PageHeader title="Doctors" subtitle="All doctor accounts." actions={
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild><Button className="bg-brand text-brand-foreground hover:bg-brand/90"><Plus className="size-4" /> Add Doctor</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Doctor</DialogTitle></DialogHeader>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2"><Label>Full Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Specialty</Label>
                <Select value={form.specialty} onValueChange={(v) => setForm({ ...form, specialty: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{specialties.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>District</Label>
                <Select value={form.district} onValueChange={(v) => setForm({ ...form, district: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2"><Label>Hospital</Label><Input value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={submit}>Add Doctor</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      } />

      <Card className="border-border/60 shadow-[var(--shadow-card)]">
        <CardContent className="p-4 md:p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search doctors" className="pl-9" /></div>
            <Select value={spec} onValueChange={setSpec}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All specialties</SelectItem>{specialties.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Doctor</TableHead><TableHead>Specialty</TableHead><TableHead>Hospital</TableHead><TableHead>Experience</TableHead><TableHead>Appointments</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {visible.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell><div className="flex items-center gap-3"><Avatar className="size-8"><AvatarImage src={d.avatar} /><AvatarFallback>{d.name[0]}</AvatarFallback></Avatar><div className="text-sm font-medium">{d.name}</div></div></TableCell>
                    <TableCell className="text-sm">{d.specialty}</TableCell>
                    <TableCell className="text-sm">{d.hospital}</TableCell>
                    <TableCell className="text-sm">{d.yearsExperience}y</TableCell>
                    <TableCell className="text-sm">{patientCount[d.id] ?? 0}</TableCell>
                    <TableCell><StatusBadge status={d.status} /></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onToggleStatus(d.id)}>{d.status === "Active" ? "Deactivate" : "Activate"}</DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600" onClick={() => setToDelete(d)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {visible.length === 0 && <TableRow><TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">No doctors match.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete {toDelete?.name}?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!credentials} onOpenChange={(o) => !o && setCredentials(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Doctor account created</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Share these one-time credentials with {credentials?.name}. They will be required to set a new password on first login.
            </p>
            <div className="rounded-md border bg-muted/40 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Email</span>
                <span className="font-mono">{credentials?.email}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Temporary password</span>
                <span className="font-mono font-semibold">{credentials?.password}</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                if (credentials) {
                  navigator.clipboard.writeText(credentials.password);
                  toast.success("Password copied to clipboard");
                }
              }}
            >
              Copy password
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setCredentials(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
