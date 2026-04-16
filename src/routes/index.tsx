import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getStoredAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getStoredAuth();
    if (auth) {
      navigate({ to: "/portal" });
    } else {
      navigate({ to: "/login" });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-obsidian-base flex items-center justify-center">
      <div className="size-2 rounded-full bg-aurora-cyan animate-pulse" />
    </div>
  );
}
