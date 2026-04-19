import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/certificate-application")({
  component: () => <div><Outlet /></div>,
});
