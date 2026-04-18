import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FileText, Lock, Pencil, Trash2, Unlock, UserCog, Users } from "lucide-react";
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
import { useCourseQuery } from "#/features/course/hooks/useCourseQuery";
import { useDeleteCourse } from "#/features/course/hooks/useDeleteCourse";
import { ApiError } from "#/lib/api";
import { cn } from "#/lib/utils";
import { AUDIENCE_LABELS } from "#/features/event/types";

export const Route = createFileRoute("/admin/course/$id")({
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
  const { data: course, isLoading, error } = useCourseQuery(id);
  const { mutate: deleteCourse, isPending: isDeleting } = useDeleteCourse(id);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading course...</p>
      </div>
    );
  }

  if (error || !course) {
    const is404 = error instanceof ApiError && error.status === 404;
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">
          {is404
            ? "Course not found."
            : ((error as Error)?.message ?? "Something went wrong.")}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/admin/course" })}
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Back */}
      <Button variant="ghost" onClick={() => navigate({ to: "/admin/course" })}>
        <ArrowLeft className="size-6!" />
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <H1>{course.title}</H1>
          <p className="text-sm text-muted-foreground">
            Created {format(course.createdAt, "PPP")}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/course/enrollment/$id" params={{ id }}>
              <UserCog className="mr-1.5 size-3.5" />
              Enrollment
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/course/edit/$id" params={{ id }}>
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
                <AlertDialogTitle>Delete course?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{course.title}" and all its
                  chapters and associated media. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteCourse()}
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
          {course.description && (
            <InfoCard label="Description">
              <p className="whitespace-pre-wrap leading-relaxed">
                {course.description}
              </p>
            </InfoCard>
          )}

          {course.introductionVideoUrl && (
            <InfoCard label="Introduction Video">
              <a
                href={course.introductionVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-primary underline underline-offset-4 hover:text-primary/80"
              >
                {course.introductionVideoUrl}
              </a>
            </InfoCard>
          )}

          {course.downloadableContent.length > 0 && (
            <InfoCard label="Downloadable Content">
              <ul className="space-y-2">
                {course.downloadableContent.map((doc) => (
                  <li key={doc.id} className="flex items-center gap-2">
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                      {doc.name || doc.url}
                    </a>
                  </li>
                ))}
              </ul>
            </InfoCard>
          )}

          {/* Chapters */}
          {course.chapters.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold">
                Chapters ({course.chapters.length})
              </h2>
              {course.chapters.map((chapter, i) => (
                <div
                  key={chapter.id}
                  className="rounded-lg border bg-card shadow-sm"
                >
                  <div className="flex items-center gap-2 border-b px-4 py-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      {i + 1}.
                    </span>
                    <span className="font-medium">{chapter.title}</span>
                    <div className="ml-auto">
                      {chapter.isFree ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-green-300 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          <Unlock className="size-3" />
                          Free
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          <Lock className="size-3" />
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3 p-4">
                    {chapter.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {chapter.description}
                      </p>
                    )}
                    {chapter.videoLinkUrl && (
                      <div>
                        <p className="mb-1 text-xs font-medium text-muted-foreground">
                          Video
                        </p>
                        <a
                          href={chapter.videoLinkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                        >
                          {chapter.videoLinkUrl}
                        </a>
                      </div>
                    )}
                    {chapter.downloadableContent.length > 0 && (
                      <div>
                        <p className="mb-1 text-xs font-medium text-muted-foreground">
                          Documents
                        </p>
                        <ul className="space-y-1">
                          {chapter.downloadableContent.map((doc) => (
                            <li key={doc.id} className="flex items-center gap-2">
                              <FileText className="size-4 shrink-0 text-muted-foreground" />
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
                              >
                                {doc.name || doc.url}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar — right col */}
        <div className="space-y-4">
          {course.thumbnail && (
            <InfoCard label="Thumbnail">
              <div className="aspect-video overflow-hidden rounded-md border bg-muted">
                <img
                  src={course.thumbnail.url}
                  alt={course.thumbnail.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </InfoCard>
          )}

          {course.audiences.length > 0 && (
            <InfoCard label="Target Audience">
              <div className="flex flex-wrap gap-1.5">
                {course.audiences.map((a) => (
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

          <InfoCard label="Dates">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Created</p>
              <p>{format(course.createdAt, "PPP")}</p>
              <p className="mt-2 text-xs text-muted-foreground">Last updated</p>
              <p>{format(course.updatedAt, "PPP")}</p>
            </div>
          </InfoCard>

          <InfoCard label="Chapters">
            <p className="text-2xl font-bold">{course.chapters.length}</p>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}
