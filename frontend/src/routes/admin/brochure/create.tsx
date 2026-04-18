import { createFileRoute } from "@tanstack/react-router";
import { BrochureForm } from "./_formLayout";

export const Route = createFileRoute("/admin/brochure/create")({
  component: RouteComponent,
});

function RouteComponent() {
  return <BrochureForm />;
}
