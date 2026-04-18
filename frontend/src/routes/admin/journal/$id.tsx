import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useJournalQuery } from "#/features/journal/hooks/useJournalQuery";
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
import { cn } from "#/lib/utils";
import { Pencil, FileText, Users, Trash2, ArrowLeft } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { journalKeys } from "#/lib/query-keys";
import { apiFetch, ApiError, parseMutationResponse } from "#/lib/api";

export const Route = createFileRoute("/admin/journal/$id")({
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
  const { data: journal, isLoading, error } = useJournalQuery(id);

  const { mutate: deleteJournal, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const response = await apiFetch(
        `${import.meta.env.VITE_SERVER_URL}/admin/journal/${id}`,
        { method: "DELETE" },
      );
      await parseMutationResponse(response);
    },
    meta: { successMessage: "Journal deleted" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.all });
      navigate({ to: "/admin/journal" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading journal...</p>
      </div>
    );
  }

  if (error || !journal) {
    const is404 = error instanceof ApiError && error.status === 404;
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">
          {is404 ? "Journal not found." : (error?.message ?? "Something went wrong.")}
        </p>
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/admin/journal" })}>
          <ArrowLeft className="mr-1.5 size-4" />
          Back to Journals
        </Button>
      </div>
    );
  }

  const isPdf = journal.media?.fileType?.includes("pdf");

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <Button
        variant={"ghost"}
        onClick={() => {
          navigate({ to: "/admin/journal" });
        }}
      >
        <ArrowLeft className="size-6!" />
      </Button>
      <div className="flex justify-between gap-4 items-center">
        <H1>{journal.title}</H1>
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/journal/edit/$id" params={{ id }}>
              <Pencil className="mr-1.5 size-3.5" />
              Edit Journal
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
                <AlertDialogTitle>Delete journal?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{journal.title}" and all its
                  chapters. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteJournal()}
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
        {/* Main content — left 2 columns */}
        <div className="space-y-4 lg:col-span-2">
          {journal.description && (
            <InfoCard label="Description">
              <p className="whitespace-pre-wrap leading-relaxed">
                {journal.description}
              </p>
            </InfoCard>
          )}

          {journal.chapters.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Chapters ({journal.chapters.length})
              </p>
              {journal.chapters.map((chapter, i) => (
                <div
                  key={chapter.id}
                  className="rounded-lg border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <h3 className="text-sm font-semibold">
                        {i + 1}. {chapter.title}
                      </h3>
                      {chapter.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {chapter.description}
                        </p>
                      )}
                      {chapter.authors.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Users className="size-3.5 shrink-0" />
                          <span>
                            {chapter.authors.map((a) => a.name).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                    {chapter.media && (
                      <a
                        href={chapter.media.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-primary hover:bg-muted transition-colors"
                      >
                        <FileText className="size-3.5" />
                        {chapter.media.fileType?.includes("pdf")
                          ? "View PDF"
                          : "View File"}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar — right column */}
        <div className="space-y-4">
          <InfoCard label="Volume & Issue">
            <p className="font-medium">
              Vol. {journal.volume}, Issue {journal.issue}
            </p>
          </InfoCard>

          <InfoCard label="Period">
            <p className="font-medium">
              {journal.startMonth} &ndash; {journal.endMonth}, {journal.year}
            </p>
          </InfoCard>

          {journal.media && (
            <InfoCard label="Cover">
              {isPdf ? (
                <a
                  href={journal.media.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  <FileText className="size-4" />
                  {journal.media.name}
                </a>
              ) : (
                <a
                  href={journal.media.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={journal.media.url}
                    alt={journal.media.name}
                    className="w-full rounded-md border object-cover"
                  />
                </a>
              )}
            </InfoCard>
          )}
        </div>
      </div>
    </div>
  );
}
