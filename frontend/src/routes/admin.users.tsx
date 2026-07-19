import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/role-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/status-badge";
import { useAppState } from "@/state/app-state";
import { districts, type AppUser } from "@/mock/data";
import { Search, MoreVertical } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
  head: () => ({ meta: [{ title: "Users — Admin" }] }),
});

function AdminUsers() {
  const { users, toggleUserStatus, deleteUser } = useAppState();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [district, setDistrict] = useState("all");
  const [detail, setDetail] = useState<AppUser | null>(null);
  const [toDelete, setToDelete] = useState<AppUser | null>(null);

  const visible = users.filter((u) => {
    if (role !== "all" && u.role !== role) return false;
    if (status !== "all" && u.status !== status) return false;
    if (district !== "all" && u.district !== district) return false;
    if (q && !`${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const roleLabel = (r: AppUser["role"]) => r === "admin" ? "Super Admin" : r === "doctor" ? "Doctor" : "Patient";
  const roleColor = (r: AppUser["role"]) => r === "admin" ? "bg-purple-100 text-purple-800 border-purple-200" : r === "doctor" ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-brand-soft text-brand border-brand/20";

  return (
    <AdminLayout>
      <PageHeader title="Users" subtitle="All users across roles." />

      <Card className="border-border/60 shadow-[var(--shadow-card)]">
        <CardContent className="p-4 md:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email" className="pl-9" />
            </div>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">Any status</SelectItem><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
            </Select>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All districts</SelectItem>
                {districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8"><AvatarImage src={u.avatar} /><AvatarFallback>{u.name[0]}</AvatarFallback></Avatar>
                        <div>
                          <div className="text-sm font-medium">{u.name}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className={`rounded-full ${roleColor(u.role)}`}>{roleLabel(u.role)}</Badge></TableCell>
                    <TableCell className="text-sm">{u.district}</TableCell>
                    <TableCell><StatusBadge status={u.status} /></TableCell>
                    <TableCell className="text-sm">{u.joined}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setDetail(u)}>View details</DropdownMenuItem>
                          {u.role !== "admin" && <DropdownMenuItem onClick={() => { toggleUserStatus(u.id); toast.success(`${u.status === "Active" ? "Deactivated" : "Activated"}`); }}>{u.status === "Active" ? "Deactivate" : "Activate"}</DropdownMenuItem>}
                          {u.role !== "admin" && <DropdownMenuItem className="text-rose-600" onClick={() => setToDelete(u)}>Delete</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {visible.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No users match.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader><SheetTitle>User details</SheetTitle></SheetHeader>
          {detail && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-14"><AvatarImage src={detail.avatar} /><AvatarFallback>{detail.name[0]}</AvatarFallback></Avatar>
                <div>
                  <div className="text-base font-semibold">{detail.name}</div>
                  <div className="text-xs text-muted-foreground">{detail.email} · {detail.phone}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-xs text-muted-foreground">Role</div><Badge variant="outline" className={`rounded-full mt-1 ${roleColor(detail.role)}`}>{roleLabel(detail.role)}</Badge></div>
                <div><div className="text-xs text-muted-foreground">Status</div><div className="mt-1"><StatusBadge status={detail.status} /></div></div>
                <div><div className="text-xs text-muted-foreground">District</div><div className="font-medium">{detail.district}</div></div>
                <div><div className="text-xs text-muted-foreground">Joined</div><div className="font-medium">{detail.joined}</div></div>
                {detail.role === "doctor" && <><div><div className="text-xs text-muted-foreground">Specialty</div><div className="font-medium">{detail.specialty}</div></div><div><div className="text-xs text-muted-foreground">Hospital</div><div className="font-medium">{detail.hospital}</div></div></>}
                {detail.role === "patient" && <><div><div className="text-xs text-muted-foreground">Gender</div><div className="font-medium">{detail.gender}</div></div><div><div className="text-xs text-muted-foreground">DOB</div><div className="font-medium">{detail.dob}</div></div></>}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete {toDelete?.name}?</AlertDialogTitle><AlertDialogDescription>This action removes the user from the mock data.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (toDelete) { deleteUser(toDelete.id); toast("User deleted"); setToDelete(null); } }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
