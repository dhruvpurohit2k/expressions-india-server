import { createFileRoute } from "@tanstack/react-router";
import { useAlmanacQuery } from "#/features/almanac/hooks/useAlmanacQuery";
import { AlmanacForm } from "../_formLayout";
import { H1 } from "#/components/ui/typographyh1";

export const Route = createFileRoute("/admin/almanac/edit/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: almanac, isLoading } = useAlmanacQuery(id);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading almanac...</p>
      </div>
    );
  }

  if (!almanac) {
    return (
      <div className="flex h-64 items-center justify-center">
        <H1>Almanac not found</H1>
      </div>
    );
  }

  return <AlmanacForm almanac={almanac} />;
}
