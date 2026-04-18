import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { usePodcastQuery } from "#/features/podcast/hooks/usePodcastQuery";
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
  ExternalLink,
  Pencil,
  Tag,
  Users,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { cn } from "#/lib/utils";
import { AUDIENCE_LABELS } from "#/features/event/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { podcastKeys } from "#/lib/query-keys";
import { apiFetch, ApiError, parseMutationResponse } from "#/lib/api";

export const Route = createFileRoute("/admin/podcast/$id")({
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

function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/))([^&?/\s]+)/i,
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  if (url.includes("youtube.com/embed/")) return url;
  return null;
}

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: podcast, isLoading, error } = usePodcastQuery(id);

  const { mutate: deletePodcast, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const response = await apiFetch(
        `${import.meta.env.VITE_SERVER_URL}/admin/podcast/${id}`,
        { method: "DELETE" },
      );
      await parseMutationResponse(response);
    },
    meta: { successMessage: "Podcast deleted" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: podcastKeys.all });
      navigate({ to: "/admin/podcast" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading podcast...</p>
      </div>
    );
  }

  if (error || !podcast) {
    const is404 = error instanceof ApiError && error.status === 404;
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">
          {is404 ? "Podcast not found." : ((error as Error)?.message ?? "Something went wrong.")}
        </p>
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/admin/podcast" })}>
          <ArrowLeft className="mr-1.5 size-4" />
          Back to Podcasts
        </Button>
      </div>
    );
  }

  const audienceLabels = podcast.audiences.includes("all")
    ? ["All"]
    : podcast.audiences.map((a) => AUDIENCE_LABELS[a] ?? a);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <Button
        variant={"ghost"}
        onClick={() => {
          navigate({ to: "/admin/podcast" });
        }}
      >
        <ArrowLeft className="size-6!" />
      </Button>
      <div className="flex items-start justify-between gap-4">
        <H1>{podcast.title}</H1>
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/podcast/edit/$id" params={{ id }}>
              <Pencil className="mr-1.5 size-3.5" />
              Edit Podcast
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
                <AlertDialogTitle>Delete podcast?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{podcast.title}". This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deletePodcast()}
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
          {getEmbedUrl(podcast.link) && (
            <InfoCard label="Video">
              <iframe
                src={getEmbedUrl(podcast.link)!}
                className="aspect-video w-full rounded"
                allowFullScreen
                sandbox="allow-same-origin allow-scripts allow-presentation"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </InfoCard>
          )}

          {podcast.description && (
            <InfoCard label="Description">
              <p className="whitespace-pre-wrap leading-relaxed">
                {podcast.description}
              </p>
            </InfoCard>
          )}

          {podcast.transcript && (
            <InfoCard label="Transcript">
              <p className="max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {podcast.transcript}
              </p>
            </InfoCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <InfoCard label="Listen">
            <a
              href={podcast.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 break-all text-primary underline underline-offset-4 hover:text-primary/80"
            >
              <ExternalLink className="size-3.5 shrink-0" />
              Open Link
            </a>
          </InfoCard>

          {podcast.tags && (
            <InfoCard label="Tags">
              <div className="flex flex-wrap gap-1.5">
                {podcast.tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium"
                    >
                      <Tag className="size-3" />
                      {tag}
                    </span>
                  ))}
              </div>
            </InfoCard>
          )}

          {audienceLabels.length > 0 && (
            <InfoCard label="Target Audience">
              <div className="flex flex-wrap gap-1.5">
                {audienceLabels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium"
                  >
                    <Users className="size-3" />
                    {label}
                  </span>
                ))}
              </div>
            </InfoCard>
          )}
        </div>
      </div>
    </div>
  );
}
