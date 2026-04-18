import { createFileRoute } from "@tanstack/react-router";
import { useBrochureQuery } from "#/features/brochure/hooks/useBrochureQuery";
import { BrochureForm } from "../_formLayout";
import { H1 } from "#/components/ui/typographyh1";

export const Route = createFileRoute("/admin/brochure/edit/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: brochure, isLoading } = useBrochureQuery(id);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading brochure...</p>
      </div>
    );
  }

  if (!brochure) {
    return (
      <div className="flex h-64 items-center justify-center">
        <H1>Brochure not found</H1>
      </div>
    );
  }

  return <BrochureForm brochure={brochure} />;
}
