import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/podcast")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
