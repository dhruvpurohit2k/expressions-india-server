import { createFileRoute } from "@tanstack/react-router";
import { useJournalQuery } from "#/features/journal/hooks/useJournalQuery";
import { JournalForm } from "../_formLayout";
import { H1 } from "#/components/ui/typographyh1";

export const Route = createFileRoute("/admin/journal/edit/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: journal, isLoading } = useJournalQuery(id);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading journal...</p>
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="flex h-64 items-center justify-center">
        <H1>Journal not found</H1>
      </div>
    );
  }

  return <JournalForm journal={journal} />;
}
