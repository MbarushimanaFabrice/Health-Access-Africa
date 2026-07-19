import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { HeartPulse } from "lucide-react";
import { useAuth } from "@/state/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in — Health Access Africa" },
      { name: "description", content: "Sign in to your Health Access Africa dashboard." },
    ],
  }),
});

function LoginPage() {
  const { currentUser, mustChangePassword, login, roleHome } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    navigate({ to: mustChangePassword ? "/set-password" : roleHome(currentUser.role) });
  }, [currentUser, mustChangePassword, navigate, roleHome]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const u = await login(email, password);
      toast.success(`Welcome, ${u.name}`);
      // Redirect is handled by the effect above once auth state (mustChangePassword) settles.
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data
          ?.error ??
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data
          ?.message ??
        "Invalid email or password.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      <aside className="relative hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col lg:justify-between p-10 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://hmedicalcentre.com/wp-content/uploads/2023/05/Doctor-Consultation-2-1000x1000.png"
            alt="Doctor consultation"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-green-600/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg">
              Connecting Rwanda to Quality Healthcare
            </h2>
            <p className="text-lg md:text-xl max-w-md drop-shadow-md">
              One platform for patients, doctors, and administrators — appointments, consultations, and health education across every district.
            </p>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-brand text-brand-foreground">
            <HeartPulse className="size-6" />
          </div>
          <div>
            <div className="text-lg font-semibold">Health Access Africa</div>
            <div className="text-xs text-sidebar-foreground/60">Telehealth for Rwanda</div>
          </div>
        </div>
        <div className="max-w-md space-y-4">
          <h2 className="text-3xl font-semibold leading-tight">
            Connecting rural communities to quality healthcare.
          </h2>
          <p className="text-sm text-sidebar-foreground/70">
            One platform for patients, doctors, and administrators — appointments,
            consultations, and health education across every district.
          </p>
        </div>
        <div className="text-xs text-sidebar-foreground/50">© 2026 Health Access Africa</div>
      </aside>

      <main className="flex flex-col justify-center px-6 py-10 md:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="grid size-9 place-items-center rounded-xl bg-brand text-brand-foreground">
              <HeartPulse className="size-5" />
            </div>
            <div className="text-base font-semibold">Health Access Africa</div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to continue to your dashboard.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@haa.rw"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New patient?{" "}
            <Link to="/register" className="font-medium text-brand hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
