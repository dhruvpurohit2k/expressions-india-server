import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/almanac")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
