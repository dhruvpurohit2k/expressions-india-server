import { createFileRoute } from "@tanstack/react-router";
import { useEvent } from "#/features/event/hooks/useEventQuery";
import { EventForm } from "../_formLayout";
import { H1 } from "#/components/ui/typographyh1";

export const Route = createFileRoute("/admin/event/edit/$id")({
  component: () => <RouteComponent />,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: event, isLoading } = useEvent(id);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex h-64 items-center justify-center">
        <H1>Event not found</H1>
      </div>
    );
  }

  return <EventForm event={event} />;
}
