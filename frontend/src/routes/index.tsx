import { createFileRoute, redirect } from "@tanstack/react-router";
import { isAuthenticated } from "#/lib/auth";

export const Route = createFileRoute("/")({
  component: () => null,
  beforeLoad: () => {
    if (isAuthenticated()) {
      throw redirect({ to: "/admin", replace: true });
    }
    throw redirect({ to: "/login", replace: true });
  },
});
