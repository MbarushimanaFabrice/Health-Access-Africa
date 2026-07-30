import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { HeartPulse } from "lucide-react";
import { useAuth } from "@/state/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: "Create account — Health Access Africa" },
      { name: "description", content: "Create a patient account on Health Access Africa." },
    ],
  }),
});

function RegisterPage() {
  const { currentUser, register, roleHome } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) navigate({ to: roleHome(currentUser.role) });
  }, [currentUser, navigate, roleHome]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      toast.error(
        "Password must be at least 8 characters and include an uppercase letter and a number."
      );
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Password and confirmation don't match.");
      return;
    }
    setSubmitting(true);
    try {
      const user = await register({
        fullName,
        email,
        password,
        phone: phone || undefined,
        district: district || undefined,
      });
      toast.success(`Welcome, ${user.name}`);
      navigate({ to: roleHome(user.role) });
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data
          ?.error ??
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data
          ?.message ??
        "Could not create your account. Please try again.";
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
            src="/auth-consultation.jpeg"
            alt="Doctor reviewing health records with a patient"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-green-600/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg">
              Book Appointments from Anywhere in Rwanda
            </h2>
            <p className="text-lg md:text-xl max-w-md drop-shadow-md">
              Create a patient account to book appointments, join consultations, and track your health records.
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
            Book appointments and reach a doctor from anywhere in Rwanda.
          </h2>
          <p className="text-sm text-sidebar-foreground/70">
            Create a patient account to book appointments, join consultations, and track your
            health records.
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

          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Patient accounts only. Doctor accounts are created by an administrator.
          </p>

          <div className="mt-6">
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District (optional)</Label>
                  <Input
                    id="district"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  At least 8 characters, with an uppercase letter and a number.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <PasswordInput
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
              >
                {submitting ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-brand hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
