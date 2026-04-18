import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/enquiry")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
