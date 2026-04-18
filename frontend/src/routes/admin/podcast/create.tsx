import { createFileRoute } from "@tanstack/react-router";
import { PodcastForm } from "./_formLayout";

export const Route = createFileRoute("/admin/podcast/create")({
  component: RouteComponent,
});

function RouteComponent() {
  return <PodcastForm />;
}
