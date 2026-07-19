import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/role-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/status-badge";
import { useAppState } from "@/state/app-state";
import { districts, type Patient } from "@/mock/data";
import { Search, MoreVertical } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/patients")({
  component: AdminPatients,
  head: () => ({ meta: [{ title: "Patients — Admin" }] }),
});

const age = (dob: string) => Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 86400000));

function AdminPatients() {
  const { patients, appointments, toggleUserStatus, deleteUser } = useAppState();
  const [q, setQ] = useState("");
  const [district, setDistrict] = useState("all");
  const [toDelete, setToDelete] = useState<Patient | null>(null);

  const apptCount = useMemo(() => {
    const m: Record<string, number> = {};
    for (const a of appointments) m[a.patientId] = (m[a.patientId] ?? 0) + 1;
    return m;
  }, [appointments]);

  const visible = patients.filter((p) => {
    if (district !== "all" && p.district !== district) return false;
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <AdminLayout>
      <PageHeader title="Patients" subtitle="All patient accounts." />
      <Card className="border-border/60 shadow-[var(--shadow-card)]">
        <CardContent className="p-4 md:p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patients" className="pl-9" /></div>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All districts</SelectItem>{districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>District</TableHead><TableHead>Age / Gender</TableHead><TableHead>Appointments</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {visible.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell><div className="flex items-center gap-3"><Avatar className="size-8"><AvatarImage src={p.avatar} /><AvatarFallback>{p.name[0]}</AvatarFallback></Avatar><div><div className="text-sm font-medium">{p.name}</div><div className="text-xs text-muted-foreground">{p.email}</div></div></div></TableCell>
                    <TableCell className="text-sm">{p.district}</TableCell>
                    <TableCell className="text-sm">{age(p.dob)} / {p.gender}</TableCell>
                    <TableCell className="text-sm">{apptCount[p.id] ?? 0}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { toggleUserStatus(p.id); toast.success("Status updated"); }}>{p.status === "Active" ? "Deactivate" : "Activate"}</DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600" onClick={() => setToDelete(p)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {visible.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No patients.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete {toDelete?.name}?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { if (toDelete) { deleteUser(toDelete.id); toast("Patient deleted"); setToDelete(null); } }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
