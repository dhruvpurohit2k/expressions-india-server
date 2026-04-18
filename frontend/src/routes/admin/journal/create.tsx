import { createFileRoute } from "@tanstack/react-router";
import { JournalForm } from "./_formLayout";

export const Route = createFileRoute("/admin/journal/create")({
  component: () => <JournalForm />,
});
