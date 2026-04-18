import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { H1 } from "#/components/ui/typographyh1";
import { Button } from "#/components/ui/button";
import { Skeleton } from "#/components/ui/skeleton";
import { BookMarked, FileText, Pencil, Plus } from "lucide-react";
import { useAlmanacListQuery } from "#/features/almanac/hooks/useAlmanacListQuery";
import { useBrochureListQuery } from "#/features/brochure/hooks/useBrochureListQuery";

export const Route = createFileRoute("/admin/")({
  component: RouteComponent,
});

function SingletonCard({
  icon: Icon,
  label,
  title,
  thumbnailUrl,
  isLoading,
  onAdd,
  onEdit,
}: {
  icon: React.ElementType;
  label: string;
  title?: string;
  thumbnailUrl?: string | null;
  isLoading: boolean;
  onAdd: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden flex flex-col">
      {/* Card header */}
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <Icon className="size-4 text-muted-foreground" />
        <p className="text-sm font-semibold">{label}</p>
      </div>

      {/* Thumbnail area */}
      <div className="flex-1">
        {isLoading ? (
          <Skeleton className="h-40 w-full rounded-none" />
        ) : thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-40 w-full object-cover"
          />
        ) : (
          <div className="h-40 w-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
            No thumbnail
          </div>
        )}
      </div>

      {/* Title + action */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-t">
        {isLoading ? (
          <Skeleton className="h-4 w-32" />
        ) : title ? (
          <p className="text-sm font-medium truncate">{title}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Not added yet</p>
        )}

        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : title ? (
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Pencil className="mr-1.5 size-3.5" />
            Edit
          </Button>
        ) : (
          <Button size="sm" onClick={onAdd}>
            <Plus className="mr-1.5 size-3.5" />
            Add
          </Button>
        )}
      </div>
    </div>
  );
}

function RouteComponent() {
  const navigate = useNavigate();

  const { data: almanacData, isLoading: almanacLoading } = useAlmanacListQuery({ limit: 1, offset: 0 });
  const { data: brochureData, isLoading: brochureLoading } = useBrochureListQuery({ limit: 1, offset: 0 });

  const almanac = almanacData?.data?.[0];
  const brochure = brochureData?.data?.[0];

  return (
    <div className="space-y-8 px-2 lg:px-10">
      <H1>Home</H1>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Content
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <SingletonCard
            icon={BookMarked}
            label="Almanac"
            title={almanac?.title}
            thumbnailUrl={almanac?.thumbnailUrl}
            isLoading={almanacLoading}
            onAdd={() => navigate({ to: "/admin/almanac/create" })}
            onEdit={() => navigate({ to: "/admin/almanac/$id", params: { id: almanac!.id } })}
          />
          <SingletonCard
            icon={FileText}
            label="Brochure"
            title={brochure?.title}
            thumbnailUrl={brochure?.thumbnailUrl}
            isLoading={brochureLoading}
            onAdd={() => navigate({ to: "/admin/brochure/create" })}
            onEdit={() => navigate({ to: "/admin/brochure/$id", params: { id: brochure!.id } })}
          />
        </div>
      </div>
    </div>
  );
}
