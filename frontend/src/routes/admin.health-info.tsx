import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/role-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/status-badge";
import { useAppState } from "@/state/app-state";
import { useAuth } from "@/state/auth";
import type { Article, ArticleStatus } from "@/mock/data";
import { Search, Plus, MoreVertical } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/health-info")({
  component: AdminHealthInfo,
  head: () => ({ meta: [{ title: "Health Information — Admin" }] }),
});

const categoriesSeed = ["Malaria Prevention", "Chronic Disease Care", "Maternal Health", "Nutrition", "Wellness"];

function AdminHealthInfo() {
  const { articles, addArticle, updateArticle, deleteArticle, toggleArticleStatus } = useAppState();
  const { currentUser } = useAuth();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [editing, setEditing] = useState<Article | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Article | null>(null);
  const [form, setForm] = useState({ title: "", category: categoriesSeed[0], content: "", status: "Draft" as ArticleStatus });

  const categories = useMemo(() => Array.from(new Set([...categoriesSeed, ...articles.map((a) => a.category)])), [articles]);
  const visible = articles.filter((a) => {
    if (cat !== "all" && a.category !== cat) return false;
    if (q && !a.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const submit = () => {
    if (!form.title.trim()) { toast.error("Title required"); return; }
    if (editing) { updateArticle(editing.id, form); toast.success("Article updated"); setEditing(null); }
    else { addArticle({ ...form, author: currentUser!.name }); toast.success("Article added"); setAddOpen(false); }
    setForm({ title: "", category: categoriesSeed[0], content: "", status: "Draft" });
  };

  const openEdit = (a: Article) => { setEditing(a); setForm({ title: a.title, category: a.category, content: a.content, status: a.status }); };

  return (
    <AdminLayout>
      <PageHeader title="Health Information" subtitle="Manage published articles and drafts." actions={
        <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setForm({ title: "", category: categoriesSeed[0], content: "", status: "Draft" }); }}>
          <DialogTrigger asChild><Button className="bg-brand text-brand-foreground hover:bg-brand/90"><Plus className="size-4" /> Add Health Article</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add Article</DialogTitle></DialogHeader>
            <ArticleForm form={form} setForm={setForm} categories={categories} />
            <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={submit}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      } />

      <Card className="border-border/60 shadow-[var(--shadow-card)]">
        <CardContent className="p-4 md:p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles" className="pl-9" /></div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setCat("all")} className={`rounded-full border px-3 py-1 text-xs font-medium ${cat === "all" ? "border-brand bg-brand text-brand-foreground" : "border-border hover:bg-muted"}`}>All</button>
              {categories.map((c) => <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-3 py-1 text-xs font-medium ${cat === c ? "border-brand bg-brand text-brand-foreground" : "border-border hover:bg-muted"}`}>{c}</button>)}
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Author</TableHead><TableHead>Published</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {visible.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell><div className="flex items-center gap-2"><span className="text-lg">{a.icon}</span><span className="text-sm font-medium">{a.title}</span></div></TableCell>
                    <TableCell className="text-sm">{a.category}</TableCell>
                    <TableCell className="text-sm">{a.author}</TableCell>
                    <TableCell className="text-sm">{a.publishedDate}</TableCell>
                    <TableCell><StatusBadge status={a.status} /></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(a)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { toggleArticleStatus(a.id); toast.success(a.status === "Published" ? "Moved to draft" : "Published"); }}>{a.status === "Published" ? "Unpublish" : "Publish"}</DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600" onClick={() => setToDelete(a)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {visible.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No articles.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) { setEditing(null); setForm({ title: "", category: categoriesSeed[0], content: "", status: "Draft" }); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Article</DialogTitle></DialogHeader>
          <ArticleForm form={form} setForm={setForm} categories={categories} />
          <DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={submit}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete "{toDelete?.title}"?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { if (toDelete) { deleteArticle(toDelete.id); toast("Article deleted"); setToDelete(null); } }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

function ArticleForm({ form, setForm, categories }: { form: { title: string; category: string; content: string; status: ArticleStatus }; setForm: (f: typeof form) => void; categories: string[] }) {
  return (
    <div className="grid gap-3">
      <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2"><Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ArticleStatus })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="Draft">Draft</SelectItem><SelectItem value="Published">Published</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2"><Label>Content</Label><Textarea rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
    </div>
  );
}
