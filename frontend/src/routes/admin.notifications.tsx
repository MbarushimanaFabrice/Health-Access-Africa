import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { PageHeader } from "@/components/role-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppState } from "@/state/app-state";
import { BellRing, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/notifications")({
  component: AdminNotifications,
  head: () => ({ meta: [{ title: "Notifications — Admin" }] }),
});

const tabs = ["All", "Users", "Content", "System"] as const;

function AdminNotifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppState();
  const [tab, setTab] = useState<typeof tabs[number]>("All");
  const mine = notifications.filter((n) => n.audience === "admin");
  const visible = tab === "All" ? mine : mine.filter((n) => n.type === tab);

  return (
    <AdminLayout>
      <PageHeader title="Notifications" subtitle="System-wide alerts." actions={<Button variant="outline" onClick={() => markAllNotificationsRead("admin")}><CheckCheck className="size-4" /> Mark all as read</Button>} />
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="mb-4">{tabs.map((t) => <TabsTrigger key={t} value={t}>{t}</TabsTrigger>)}</TabsList>
      </Tabs>
      <Card className="border-border/60 shadow-[var(--shadow-card)]"><CardContent className="p-0">
        {visible.length === 0 ? <div className="p-8 text-center text-sm text-muted-foreground">Nothing here.</div> : (
          <ul className="divide-y divide-border">
            {visible.map((n) => (
              <li key={n.id} onClick={() => !n.read && markNotificationRead(n.id)} className={cn("flex cursor-pointer items-start gap-3 px-5 py-4 hover:bg-muted/40", !n.read && "bg-brand-soft/40")}>
                <div className="grid size-9 place-items-center rounded-full bg-brand-soft text-brand"><BellRing className="size-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><div className={cn("text-sm", !n.read ? "font-semibold" : "font-medium")}>{n.title}</div>{!n.read && <span className="size-2 rounded-full bg-brand" />}</div>
                  <div className="text-xs text-muted-foreground">{n.body}</div>
                </div>
                <span className="text-xs text-muted-foreground">{n.time}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent></Card>
    </AdminLayout>
  );
}
