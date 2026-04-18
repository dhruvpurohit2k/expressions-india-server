import { createFileRoute } from "@tanstack/react-router";
import { EventForm } from "./_formLayout";

export const Route = createFileRoute("/admin/event/create")({
  component: () => <EventForm />,
});
