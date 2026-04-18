import { createFileRoute } from "@tanstack/react-router";
import { usePodcastQuery } from "#/features/podcast/hooks/usePodcastQuery";
import { PodcastForm } from "../_formLayout";
import { H1 } from "#/components/ui/typographyh1";

export const Route = createFileRoute("/admin/podcast/edit/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: podcast, isLoading } = usePodcastQuery(id);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading podcast...</p>
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="flex h-64 items-center justify-center">
        <H1>Podcast not found</H1>
      </div>
    );
  }

  return <PodcastForm podcast={podcast} />;
}
