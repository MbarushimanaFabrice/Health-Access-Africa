import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DoctorLayout } from "@/components/doctor-layout";
import { PageHeader } from "@/components/role-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAppState } from "@/state/app-state";
import { Search } from "lucide-react";

export const Route = createFileRoute("/doctor/health-info")({
  component: DoctorHealthInfo,
  head: () => ({ meta: [{ title: "Health Information — Doctor" }] }),
});

function DoctorHealthInfo() {
  const { articles } = useAppState();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  const published = articles.filter((a) => a.status === "Published");
  const categories = useMemo(() => Array.from(new Set(published.map((a) => a.category))), [published]);
  const filtered = published.filter((a) => {
    if (cat !== "all" && a.category !== cat) return false;
    if (q && !`${a.title} ${a.excerpt}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <DoctorLayout>
      <PageHeader title="Health Information" subtitle="Reference articles you can share with patients." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles" className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCat("all")} className={`rounded-full border px-3 py-1 text-xs font-medium ${cat === "all" ? "border-brand bg-brand text-brand-foreground" : "border-border hover:bg-muted"}`}>All</button>
          {categories.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-3 py-1 text-xs font-medium ${cat === c ? "border-brand bg-brand text-brand-foreground" : "border-border hover:bg-muted"}`}>{c}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((a) => (
          <Dialog key={a.id}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer border-border/60 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-brand/40">
                <CardContent className="p-5">
                  <div className="mb-3 grid size-11 place-items-center rounded-2xl bg-brand-soft text-2xl">{a.icon}</div>
                  <Badge variant="outline" className="rounded-full text-xs">{a.category}</Badge>
                  <div className="mt-2 text-base font-semibold">{a.title}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{a.excerpt}</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{a.title}</DialogTitle></DialogHeader>
              <Badge variant="outline" className="w-fit rounded-full text-xs">{a.category}</Badge>
              <p className="text-sm leading-relaxed text-muted-foreground">{a.content}</p>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </DoctorLayout>
  );
}
