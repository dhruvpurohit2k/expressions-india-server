import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/course")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
