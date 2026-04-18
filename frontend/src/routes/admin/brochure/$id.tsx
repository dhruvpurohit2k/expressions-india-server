import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useBrochureQuery } from "#/features/brochure/hooks/useBrochureQuery";
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
import {
  Pencil,
  Trash2,
  ArrowLeft,
  FileText,
  ExternalLink,
} from "lucide-react";
import { cn } from "#/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { brochureKeys } from "#/lib/query-keys";
import { apiFetch, ApiError, parseMutationResponse } from "#/lib/api";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/brochure/$id")({
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
  const { data: brochure, isLoading, error } = useBrochureQuery(id);

  const { mutate: deleteBrochure, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const response = await apiFetch(
        `${import.meta.env.VITE_SERVER_URL}/admin/brochure/${id}`,
        { method: "DELETE" },
      );
      await parseMutationResponse(response);
    },
    meta: { successMessage: "Brochure deleted" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brochureKeys.all });
      navigate({ to: "/admin" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading brochure...</p>
      </div>
    );
  }

  if (error || !brochure) {
    const is404 = error instanceof ApiError && error.status === 404;
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">
          {is404
            ? "Brochure not found."
            : ((error as Error)?.message ?? "Something went wrong.")}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/admin" })}
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => navigate({ to: "/admin" })}>
        <ArrowLeft className="size-5!" />
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <H1>{brochure.title}</H1>
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/brochure/edit/$id" params={{ id }}>
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
                <AlertDialogTitle>Delete brochure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{brochure.title}". This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteBrochure()}
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
        {/* Main content */}
        <div className="space-y-4 lg:col-span-2">
          {brochure.thumbnail && (
            <InfoCard label="Thumbnail">
              <img
                src={brochure.thumbnail.url}
                alt={brochure.title}
                className="max-h-64 w-full rounded object-contain bg-muted"
              />
            </InfoCard>
          )}

          {brochure.description && (
            <InfoCard label="Description">
              <p className="whitespace-pre-wrap leading-relaxed">
                {brochure.description}
              </p>
            </InfoCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <InfoCard label="Created">
            <p>{format(brochure.createdAt, "dd MMM yyyy")}</p>
          </InfoCard>

          {brochure.pdf && (
            <InfoCard label="PDF">
              <a
                href={brochure.pdf.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-primary underline underline-offset-4 hover:text-primary/80"
              >
                <FileText className="size-4 shrink-0" />
                <span className="truncate">
                  {brochure.pdf.name || "Open PDF"}
                </span>
                <ExternalLink className="size-3 shrink-0" />
              </a>
            </InfoCard>
          )}
        </div>
      </div>
    </div>
  );
}
