import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/state/auth";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
  head: () => ({ meta: [{ title: "Health Access Africa" }] }),
});

function IndexRedirect() {
  const { currentUser, roleHome } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: currentUser ? roleHome(currentUser.role) : "/login" });
  }, [currentUser, navigate, roleHome]);
  return <div className="min-h-screen bg-background" />;
}
