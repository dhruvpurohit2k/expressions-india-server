import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { H1 } from "#/components/ui/typographyh1";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "#/components/ui/card";
import { Textarea } from "#/components/ui/textarea";
import { Button } from "#/components/ui/button";
import { Skeleton } from "#/components/ui/skeleton";
import { useAudienceListQuery } from "#/features/audience/hooks/useAudienceListQuery";
import { updateAudienceDescription } from "#/features/audience/api/updateAudienceDescription";
import { audienceKeys } from "#/lib/query-keys";
import type { AudienceListItem } from "#/features/audience/types";

export const Route = createFileRoute("/admin/audience/")({
  component: RouteComponent,
});

function formatName(name: string) {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function AudienceCard({ audience }: { audience: AudienceListItem }) {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState(audience.introduction);

  const { mutate, isPending } = useMutation({
    mutationFn: () => updateAudienceDescription(audience.ID, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: audienceKeys.all });
    },
  });

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-sm font-semibold">{formatName(audience.name)}</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a description..."
          rows={4}
        />
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => mutate()}
          disabled={isPending}
          size="sm"
          className="ml-auto"
        >
          {isPending ? "Saving..." : "Save"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function RouteComponent() {
  const { data: audiences, isLoading, error } = useAudienceListQuery();

  return (
    <>
      <div className="flex px-2 lg:px-10 items-center">
        <H1>Audience</H1>
      </div>
      <div className="px-2 lg:px-10 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="border-b">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="pt-3">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-6 w-14 ml-auto" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : error || !audiences ? (
          <p className="text-sm text-muted-foreground">Failed to load audience.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {audiences.map((audience) => (
              <AudienceCard key={audience.ID} audience={audience} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
