import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEvent } from "#/features/event/hooks/useEventQuery";
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
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "#/components/ui/carousel";
import { format } from "date-fns";
import {
  CalendarDays,
  Clock,
  MapPin,
  Globe,
  Pencil,
  FileText,
  Trash2,
  ArrowLeft,
  Users,
} from "lucide-react";
import { cn } from "#/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventKeys } from "#/lib/query-keys";
import { apiFetch, ApiError, parseMutationResponse } from "#/lib/api";
import { AUDIENCE_LABELS } from "#/features/event/types";

export const Route = createFileRoute("/admin/event/$id")({
  component: () => <RouteComponent />,
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

const STATUS_CONFIG = {
  upcoming: {
    label: "Upcoming",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  completed: {
    label: "Completed",
    className: "bg-green-50 text-green-700 border-green-200",
  },
};

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: event, isLoading, error } = useEvent(id);

  const { mutate: deleteEvent, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const response = await apiFetch(
        `${import.meta.env.VITE_SERVER_URL}/admin/event/${id}`,
        { method: "DELETE" },
      );
      await parseMutationResponse(response);
    },
    meta: { successMessage: "Event deleted" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      navigate({ to: "/admin/event" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading event...</p>
      </div>
    );
  }

  if (error || !event) {
    const is404 = error instanceof ApiError && error.status === 404;
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">
          {is404
            ? "Event not found."
            : ((error as Error)?.message ?? "Something went wrong.")}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/admin/event" })}
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Back to Events
        </Button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.upcoming;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <Button
        variant={"ghost"}
        onClick={() => {
          navigate({ to: "/admin/event" });
        }}
      >
        <ArrowLeft className="size-6!" />
      </Button>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <H1>{event.title}</H1>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium capitalize",
              statusConfig.className,
            )}
          >
            {statusConfig.label}
          </span>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/event/edit/$id" params={{ id }}>
              <Pencil className="mr-1.5 size-3.5" />
              Edit Event
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
                <AlertDialogTitle>Delete event?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{event.title}" and all its
                  associated media. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteEvent()}
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
          <InfoCard label="Description">
            <p className="whitespace-pre-wrap leading-relaxed">
              {event.description}
            </p>
          </InfoCard>

          {event.perks.length > 0 && (
            <InfoCard label="Details">
              <ul className="space-y-1">
                {event.perks.map((perk, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="shrink-0 font-medium text-muted-foreground">
                      {i + 1}.
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
            </InfoCard>
          )}

          {event.registrationUrl && (
            <InfoCard label="Registration Link">
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-primary underline underline-offset-4 hover:text-primary/80"
              >
                {event.registrationUrl}
              </a>
            </InfoCard>
          )}

          {event.status === "completed" && event.medias.length > 0 && (
            <InfoCard label="Media">
              <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {event.medias.map((m) => (
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

          {event.status === "completed" && event.documents.length > 0 && (
            <InfoCard label="Documents">
              <ul className="space-y-2">
                {event.documents.map((doc) => (
                  <li key={doc.id} className="flex items-center gap-2">
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                      {doc.name}
                    </a>
                  </li>
                ))}
              </ul>
            </InfoCard>
          )}

          {event.status === "completed" && event.videoLinks.length > 0 && (
            <InfoCard label="Video Links">
              <ul className="space-y-1">
                {event.videoLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                      {link.url}
                    </a>
                  </li>
                ))}
              </ul>
            </InfoCard>
          )}
        </div>

        {/* Sidebar — right column */}
        <div className="space-y-4">
          <InfoCard label="Dates">
            <div className="space-y-2">
              <div className="flex gap-2">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Start</p>
                  <p className="font-medium">
                    {format(event.startDate, "PPP")}
                  </p>
                </div>
              </div>
              {event.endDate && (
                <div className="flex gap-2">
                  <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">End</p>
                    <p className="font-medium">
                      {format(event.endDate, "PPP")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </InfoCard>

          {(event.startTime || event.endTime) && (
            <InfoCard label="Time">
              <div className="flex items-center gap-2">
                <Clock className="size-4 shrink-0 text-muted-foreground" />
                <p>
                  {event.startTime}
                  {event.endTime ? ` — ${event.endTime}` : ""}
                </p>
              </div>
            </InfoCard>
          )}

          <InfoCard label="Location">
            {event.isOnline ? (
              <div className="flex items-center gap-2">
                <Globe className="size-4 shrink-0 text-muted-foreground" />
                <p>Online</p>
              </div>
            ) : (
              <div className="flex gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p>{event.location}</p>
              </div>
            )}
          </InfoCard>

          <InfoCard label="Fees">
            {event.isPaid ? (
              <p className="font-semibold">₹{event.price}</p>
            ) : (
              <span className="font-medium text-green-600">Free</span>
            )}
          </InfoCard>

          {event.audiences.length > 0 && (
            <InfoCard label="Target Audience">
              <div className="flex flex-wrap gap-1.5">
                {event.audiences.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium"
                  >
                    <Users className="size-3" />
                    {AUDIENCE_LABELS[a] ?? a}
                  </span>
                ))}
              </div>
            </InfoCard>
          )}

          {event.status === "upcoming" && event.promotionalMedia.length > 0 && (
            <InfoCard label="Promotional Media">
              <Carousel
                opts={{ align: "center" }}
                className="mx-auto w-full px-10"
              >
                <CarouselContent>
                  {event.promotionalMedia.map((media, i) => (
                    <CarouselItem key={i}>
                      <div className="aspect-video overflow-hidden rounded-md border">
                        <img
                          src={media.url}
                          alt={media.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious type="button" />
                <CarouselNext type="button" />
              </Carousel>
            </InfoCard>
          )}

          {event.status === "upcoming" &&
            event.promotionalDocuments.length > 0 && (
              <InfoCard label="Promotional Documents">
                <ul className="space-y-2">
                  {event.promotionalDocuments.map((doc) => (
                    <li key={doc.id} className="flex items-center gap-2">
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-4 hover:text-primary/80"
                      >
                        {doc.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </InfoCard>
            )}

          {event.status === "completed" &&
            event.promotionalVideoLinks.length > 0 && (
              <InfoCard label="Promotional Video Links">
                {event.promotionalVideoLinks.map((link) => (
                  <p key={link.id}>{link.url}</p>
                ))}
              </InfoCard>
            )}
        </div>
      </div>
    </div>
  );
}
