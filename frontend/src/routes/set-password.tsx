import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { HeartPulse, ShieldAlert } from "lucide-react";
import { useAuth } from "@/state/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/set-password")({
  component: SetPasswordPage,
  head: () => ({
    meta: [{ title: "Set new password — Health Access Africa" }],
  }),
});

function SetPasswordPage() {
  const { currentUser, mustChangePassword, changePassword, roleHome, logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate({ to: "/login" });
    } else if (!mustChangePassword) {
      navigate({ to: roleHome(currentUser.role) });
    }
  }, [currentUser, mustChangePassword, navigate, roleHome]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      toast.error(
        "New password must be at least 8 characters and include an uppercase letter and a number."
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Password updated. Welcome to your dashboard.");
      if (currentUser) navigate({ to: roleHome(currentUser.role) });
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data
          ?.error ??
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data
          ?.message ??
        "Could not update password. Check your current password and try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser || !mustChangePassword) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl bg-brand text-brand-foreground">
            <HeartPulse className="size-5" />
          </div>
          <div className="text-base font-semibold">Health Access Africa</div>
        </div>

        <Card className="p-6">
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            <p className="text-sm">
              You're using a temporary password. Set a new password to continue to your
              dashboard.
            </p>
          </div>

          <h1 className="text-xl font-semibold tracking-tight">Set a new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as {currentUser.email}.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Temporary password</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                At least 8 characters, with an uppercase letter and a number.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
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
              {submitting ? "Updating..." : "Update password"}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={logout}>
              Sign out
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
