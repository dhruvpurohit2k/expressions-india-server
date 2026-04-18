import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

import { H1 } from "#/components/ui/typographyh1";
import { Button } from "#/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "#/components/ui/alert-dialog";
import { useArticleQuery } from "#/features/article/hooks/useArticleQuery";
import { apiFetch, ApiError, parseMutationResponse } from "#/lib/api";
import { articleKeys } from "#/lib/query-keys";
import { cn } from "#/lib/utils";
import { AUDIENCE_LABELS } from "#/features/event/types";

export const Route = createFileRoute("/admin/article/$id")({
  component: RouteComponent,
});

function InfoCard({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border bg-card p-4 shadow-sm", className)}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: article, isLoading, error } = useArticleQuery(id);

  const { mutate: deleteArticle, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const response = await apiFetch(
        `${import.meta.env.VITE_SERVER_URL}/admin/article/${id}`,
        { method: "DELETE" },
      );
      await parseMutationResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.all });
      navigate({ to: "/admin/article" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading article...</p>
      </div>
    );
  }

  if (error || !article) {
    const is404 = error instanceof ApiError && error.status === 404;
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">
          {is404 ? "Article not found." : (error?.message ?? "Something went wrong.")}
        </p>
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/admin/article" })}>
          <ArrowLeft className="mr-1.5 size-4" />
          Back to Articles
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Back */}
      <Button variant="ghost" onClick={() => navigate({ to: "/admin/article" })}>
        <ArrowLeft className="size-6!" />
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <H1>{article.title}</H1>
          <p className="text-sm text-muted-foreground">
            {article.category} &middot; {format(article.createdAt, "PPP")}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/article/edit/$id" params={{ id }}>
              <Pencil className="mr-1.5 size-3.5" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                <Trash2 className="mr-1.5 size-3.5" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete article?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{article.title}" and all its
                  associated media. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteArticle()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Main — left 2 cols */}
        <div className="space-y-4 lg:col-span-2">
          <InfoCard label="Content">
            <p className="whitespace-pre-wrap leading-relaxed">{article.content}</p>
          </InfoCard>

          {article.medias.length > 0 && (
            <InfoCard label="Images">
              <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {article.medias.map((m) => (
                  <div
                    key={m.id}
                    className="aspect-square overflow-hidden rounded-md border"
                  >
                    <img
                      src={m.url}
                      alt={m.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </InfoCard>
          )}
        </div>

        {/* Sidebar — right col */}
        <div className="space-y-4">
          <InfoCard label="Category">
            <p>{article.category}</p>
          </InfoCard>

          {article.audience.length > 0 && (
            <InfoCard label="Target Audience">
              <ul className="space-y-1">
                {article.audience.map((a) => (
                  <li key={a.name}>{AUDIENCE_LABELS[a.name] ?? a.name}</li>
                ))}
              </ul>
            </InfoCard>
          )}

          <InfoCard label="Dates">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Created</p>
              <p>{format(article.createdAt, "PPP")}</p>
              <p className="mt-2 text-xs text-muted-foreground">Last updated</p>
              <p>{format(article.updatedAt, "PPP")}</p>
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}
