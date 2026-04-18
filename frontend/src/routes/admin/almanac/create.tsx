import { createFileRoute } from "@tanstack/react-router";
import { AlmanacForm } from "./_formLayout";

export const Route = createFileRoute("/admin/almanac/create")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AlmanacForm />;
}
