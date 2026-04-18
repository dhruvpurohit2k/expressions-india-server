import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/article")({
  component: () => (
    <div>
      <Outlet />
    </div>
  ),
});
