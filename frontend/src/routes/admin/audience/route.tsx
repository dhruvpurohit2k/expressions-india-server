import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/audience")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Outlet></Outlet>
    </div>
  );
}
