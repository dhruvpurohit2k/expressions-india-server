import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { H1 } from "#/components/ui/typographyh1";
import { Button } from "#/components/ui/button";
import { Skeleton } from "#/components/ui/skeleton";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useBrochureListQuery } from "#/features/brochure/hooks/useBrochureListQuery";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/brochure/")({
  component: RouteComponent,
});

const PAGE_SIZE = 15;

function RouteComponent() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useBrochureListQuery({
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const items = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 0;
  const total = data?.meta.total ?? 0;

  return (
    <>
      <div className="flex px-2 lg:px-10 items-center">
        <H1>Brochures</H1>
        <Button
          variant="default"
          className="ml-auto rounded shadow font-semibold"
          onClick={() => navigate({ to: "/admin/brochure/create" })}
        >
          <Plus strokeWidth={2} className="size-4" />
          Add Brochure
        </Button>
      </div>

      <div className="px-2 lg:px-10 space-y-4">
        {!isLoading && (
          <p className="text-sm text-muted-foreground">
            {total} brochure{total !== 1 ? "s" : ""}
          </p>
        )}

        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <p className="text-destructive text-sm">Could not load brochures.</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No brochures yet. Add one above.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate({ to: "/admin/brochure/$id", params: { id: item.id } })}
                className="cursor-pointer rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="h-40 w-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
                    No thumbnail
                  </div>
                )}
                <div className="p-4 space-y-1">
                  <p className="font-semibold leading-tight">{item.title}</p>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {format(item.createdAt, "dd MMM yyyy")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border overflow-hidden">
          <Skeleton className="h-40 w-full" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
