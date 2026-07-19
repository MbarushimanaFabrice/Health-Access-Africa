import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/state/auth";
import { useAppState } from "@/state/app-state";
import type { Role } from "@/mock/data";
import { Bell, HeartPulse, LogOut, Menu, Search, Settings as Gear } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const roleLabel: Record<Role, string> = { patient: "Patient", doctor: "Doctor", admin: "Super Admin" };

export function RoleLayout({
  role,
  nav,
  notificationsHref,
  children,
}: {
  role: Role;
  nav: NavItem[];
  notificationsHref: string;
  children: ReactNode;
}) {
  const { currentUser, logout } = useAuth();
  const { notifications } = useAppState();
  const navigate = useNavigate();
  const [openMobile, setOpenMobile] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!currentUser) {
      navigate({ to: "/login" });
    } else if (currentUser.role !== role) {
      const home = currentUser.role === "admin" ? "/admin" : currentUser.role === "doctor" ? "/doctor" : "/patient";
      navigate({ to: home });
    }
  }, [currentUser, role, navigate]);

  if (!currentUser || currentUser.role !== role) {
    return <div className="min-h-screen bg-background" />;
  }

  const unread = notifications.filter((n) => n.audience === role && !n.read).length;

  const Sidebar = ({ onNav }: { onNav?: () => void }) => (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-6 pt-6 pb-8">
        <div className="grid size-9 place-items-center rounded-xl bg-brand text-brand-foreground">
          <HeartPulse className="size-5" />
        </div>
        <div>
          <div className="text-base font-semibold leading-tight">Health Access</div>
          <div className="text-xs text-sidebar-foreground/60">Africa</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const active = path === item.to || (item.to !== `/${role}` && path.startsWith(item.to));
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNav}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-brand text-brand-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="m-3 rounded-2xl bg-sidebar-accent p-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 border-2 border-brand/40">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{currentUser.name}</div>
            <div className="truncate text-xs text-sidebar-foreground/60">{roleLabel[role]}</div>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            navigate({ to: "/login" });
          }}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-sidebar/60 py-2 text-xs font-medium text-sidebar-foreground/90 hover:bg-sidebar"
        >
          <LogOut className="size-3.5" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 lg:block">
        <Sidebar />
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
          <Sheet open={openMobile} onOpenChange={setOpenMobile}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Sidebar onNav={() => setOpenMobile(false)} />
            </SheetContent>
          </Sheet>

          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." className="h-10 rounded-full bg-muted pl-9 border-transparent" />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Gear className="size-5" />
            </Button>
            <Link to={notificationsHref} className="relative">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="size-5" />
              </Button>
              {unread > 0 && (
                <span className="pointer-events-none absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
                  {unread}
                </span>
              )}
            </Link>
            <div className="ml-2 flex items-center gap-3 rounded-full bg-card pl-1 pr-3 py-1 shadow-sm">
              <Avatar className="size-8">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <div className="text-xs font-semibold leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-muted-foreground">{roleLabel[role]}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
