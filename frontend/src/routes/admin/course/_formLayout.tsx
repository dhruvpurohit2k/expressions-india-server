import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronDown, ChevronUp, FileText, Plus, X } from "lucide-react";
import { z } from "zod";

import { H1 } from "#/components/ui/typographyh1";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { Spinner } from "#/components/ui/spinner";
import { type LocalMedia, SingleMediaUpload } from "#/components/media-upload";
import {
  INDIVIDUAL_AUDIENCES,
  AUDIENCE_LABELS,
} from "#/features/event/types";
import { saveCourse } from "#/features/course/api/saveCourse";
import { courseKeys } from "#/lib/query-keys";
import type { CourseData } from "#/features/course/types";
import { cn } from "#/lib/utils";
import { presignAndUploadFiles } from "#/lib/presign";

export const Route = createFileRoute("/admin/course/_formLayout")({
  component: () => <></>,
});

// A document entry: either an existing saved file, or a new upload with a user-provided name.
type DocEntry =
  | { type: "existing"; id: string; name: string; url: string }
  | { type: "new"; name: string; file: File | null };

type ChapterEntry = {
  id?: string;
  title: string;
  description: string;
  videoUrl: string;
  isFree: boolean;
  downloadableContent: DocEntry[];
  deletedDocIds: string[];
};

function emptyChapter(): ChapterEntry {
  return {
    title: "",
    description: "",
    videoUrl: "",
    isFree: false,
    downloadableContent: [],
    deletedDocIds: [],
  };
}

export function CourseForm({ course }: { course?: CourseData }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!course?.id;

  const { mutateAsync } = useMutation({
    mutationFn: ({ formData, id }: { formData: FormData; id?: string }) =>
      saveCourse(formData, id),
    meta: { successMessage: "Course saved" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
      if (course?.id) {
        navigate({ to: "/admin/course/$id", params: { id: course.id } });
      } else {
        navigate({ to: "/admin/course" });
      }
    },
  });

  const existingThumbnail: LocalMedia | null = course?.thumbnail
    ? {
        type: "existing",
        id: course.thumbnail.id,
        url: course.thumbnail.url,
        name: course.thumbnail.name,
      }
    : null;

  const existingCourseDocs: DocEntry[] = (course?.downloadableContent ?? []).map(
    (m) => ({ type: "existing", id: m.id, name: m.name, url: m.url }),
  );

  const existingChapters: ChapterEntry[] = (course?.chapters ?? []).map((ch) => ({
    id: ch.id,
    title: ch.title,
    description: ch.description ?? "",
    videoUrl: ch.videoLinkUrl ?? "",
    isFree: ch.isFree,
    downloadableContent: ch.downloadableContent.map((m) => ({
      type: "existing" as const,
      id: m.id,
      name: m.name,
      url: m.url,
    })),
    deletedDocIds: [],
  }));

  const form = useForm({
    defaultValues: {
      title: course?.title ?? "",
      description: course?.description ?? "",
      introductionVideoUrl: course?.introductionVideoUrl ?? "",
      registrationUrl: course?.registrationUrl ?? "",
      audiences: course?.audiences?.length ? course.audiences : ["all"],
      thumbnail: existingThumbnail as LocalMedia | null,
      deletedThumbnailId: undefined as string | undefined,
      downloadableContent: existingCourseDocs as DocEntry[],
      deletedDocIds: [] as string[],
      chapters: existingChapters as ChapterEntry[],
      deletedChapterIds: [] as string[],
    },
    onSubmit: async ({ value }) => {
      const fd = new FormData();
      fd.append("title", value.title);
      if (value.description) fd.append("description", value.description);
      if (value.introductionVideoUrl)
        fd.append("introductionVideoUrl", value.introductionVideoUrl);
      if (value.registrationUrl)
        fd.append("registrationUrl", value.registrationUrl);
      const audiences = value.audiences.length ? value.audiences : ["all"];
      audiences.forEach((a) => fd.append("audiences", a));

      if (value.deletedThumbnailId)
        fd.append("deletedThumbnailId", value.deletedThumbnailId);

      // Thumbnail
      if (value.thumbnail?.type === "new") {
        const [ref] = await presignAndUploadFiles([
          { file: value.thumbnail.file, name: value.thumbnail.file.name },
        ]);
        fd.append("thumbnailUpload", JSON.stringify(ref));
      }

      // Course-level documents
      const newCourseDocs = value.downloadableContent.filter(
        (d): d is Extract<DocEntry, { type: "new" }> => d.type === "new" && d.file !== null,
      );
      if (newCourseDocs.length > 0) {
        const refs = await presignAndUploadFiles(
          newCourseDocs.map((d) => ({ file: d.file!, name: d.name })),
        );
        refs.forEach((ref) => fd.append("docUploads", JSON.stringify(ref)));
      }
      value.deletedDocIds.forEach((id) => fd.append("deletedDocIds", id));

      // Chapters: presign chapter docs, then build chaptersJson
      const chaptersWithRefs = await Promise.all(
        value.chapters.map(async (ch) => {
          const newDocs = ch.downloadableContent.filter(
            (d): d is Extract<DocEntry, { type: "new" }> => d.type === "new" && d.file !== null,
          );
          const newDocUploads =
            newDocs.length > 0
              ? await presignAndUploadFiles(
                  newDocs.map((d) => ({ file: d.file!, name: d.name })),
                )
              : [];
          return {
            id: ch.id,
            title: ch.title,
            description: ch.description,
            videoUrl: ch.videoUrl,
            isFree: ch.isFree,
            newDocUploads,
            existingDocIds: ch.downloadableContent
              .filter((d): d is Extract<DocEntry, { type: "existing" }> => d.type === "existing")
              .map((d) => d.id),
            deletedDocIds: ch.deletedDocIds,
          };
        }),
      );
      fd.append("chaptersJson", JSON.stringify(chaptersWithRefs));

      value.deletedChapterIds.forEach((id) => fd.append("deletedChapterIds", id));

      await mutateAsync({ formData: fd, id: course?.id });
    },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() =>
            isEditing
              ? navigate({ to: "/admin/course/$id", params: { id: course!.id } })
              : navigate({ to: "/admin/course" })
          }
        >
          <ArrowLeft className="size-5" />
        </Button>
        <H1>{isEditing ? "Edit Course" : "Create Course"}</H1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        {/* ── Main Info Card ── */}
        <div className="rounded border bg-card shadow-sm">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
            {/* Left column */}
            <div className="space-y-5 border-b p-6 lg:border-b-0 lg:border-r">
              {/* Title */}
              <form.Field
                name="title"
                validators={{
                  onChange: ({ value }) => {
                    const r = z.string().min(1, "Title is required").safeParse(value);
                    return r.success ? undefined : r.error.issues[0].message;
                  },
                }}
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>Title</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Course title"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-xs text-destructive">
                        {field.state.meta.errors
                          .map((e) => (typeof e === "string" ? e : (e as any).message))
                          .join(", ")}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Description */}
              <form.Field
                name="description"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>Description</Label>
                    <Textarea
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Write a description..."
                      rows={4}
                    />
                  </div>
                )}
              />

              {/* Introduction Video URL */}
              <form.Field
                name="introductionVideoUrl"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return undefined;
                    const r = z.url().safeParse(value);
                    return r.success ? undefined : "Must be a valid URL";
                  },
                }}
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>Introduction Video URL</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="https://youtube.com/..."
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-xs text-destructive">
                        {field.state.meta.errors
                          .map((e) => (typeof e === "string" ? e : (e as any).message))
                          .join(", ")}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Registration URL */}
              <form.Field
                name="registrationUrl"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return undefined;
                    const r = z.url().safeParse(value);
                    return r.success ? undefined : "Must be a valid URL";
                  },
                }}
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>Registration URL</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="https://forms.google.com/..."
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-xs text-destructive">
                        {field.state.meta.errors
                          .map((e) => (typeof e === "string" ? e : (e as any).message))
                          .join(", ")}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Audiences */}
              <form.Field
                name="audiences"
                children={(field) => {
                  const current = field.state.value;
                  const isAll = current.includes("all");

                  const toggleAll = (checked: boolean) => {
                    field.handleChange(checked ? ["all"] : []);
                  };

                  const toggleIndividual = (option: string, checked: boolean) => {
                    if (checked) {
                      const withoutAll = current.filter((a) => a !== "all");
                      const next = [...withoutAll, option];
                      if (INDIVIDUAL_AUDIENCES.every((a) => next.includes(a))) {
                        field.handleChange(["all"]);
                      } else {
                        field.handleChange(next);
                      }
                    } else {
                      if (isAll) {
                        const next = INDIVIDUAL_AUDIENCES.filter((a) => a !== option);
                        field.handleChange(next.length ? next : ["all"]);
                      } else {
                        const next = current.filter((a) => a !== option);
                        field.handleChange(next.length ? next : ["all"]);
                      }
                    }
                  };

                  return (
                    <div className="space-y-2">
                      <Label>Target Audience</Label>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded border p-3">
                        {INDIVIDUAL_AUDIENCES.map((option) => (
                          <div key={option} className="flex items-center gap-2">
                            <input
                              id={`audience-${option}`}
                              type="checkbox"
                              checked={isAll || current.includes(option)}
                              onChange={(e) =>
                                toggleIndividual(option, e.target.checked)
                              }
                              className="size-4 accent-primary"
                            />
                            <Label
                              htmlFor={`audience-${option}`}
                              className="font-normal cursor-pointer"
                            >
                              {AUDIENCE_LABELS[option]}
                            </Label>
                          </div>
                        ))}
                        <div className="col-span-2 mt-1 border-t pt-2 flex items-center gap-2">
                          <input
                            id="audience-all"
                            type="checkbox"
                            checked={isAll}
                            onChange={(e) => toggleAll(e.target.checked)}
                            className="size-4 accent-primary"
                          />
                          <Label
                            htmlFor="audience-all"
                            className="font-normal cursor-pointer"
                          >
                            All
                          </Label>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            </div>

            {/* Right column */}
            <div className="space-y-6 p-6">
              {/* Thumbnail */}
              <form.Field
                name="thumbnail"
                children={(field) => (
                  <SingleMediaUpload
                    label="Thumbnail"
                    accept="image/png,image/jpeg,image/webp"
                    media={field.state.value}
                    onAdd={(file) => field.handleChange({ type: "new", file })}
                    onRemove={() => {
                      const current = field.state.value;
                      if (current?.type === "existing") {
                        form.setFieldValue("deletedThumbnailId", current.id);
                      }
                      field.handleChange(null);
                    }}
                  />
                )}
              />

              {/* Course Downloadable Content */}
              <form.Field
                name="downloadableContent"
                children={(field) => (
                  <DocumentList
                    label="Downloadable Content"
                    docs={field.state.value}
                    onChange={field.handleChange}
                    onDelete={(id) => {
                      const current = form.getFieldValue("deletedDocIds");
                      form.setFieldValue("deletedDocIds", [...current, id]);
                    }}
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* ── Chapters ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Chapters</h2>
            <form.Field
              name="chapters"
              children={(field) => (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    field.handleChange([...field.state.value, emptyChapter()])
                  }
                >
                  <Plus className="mr-1.5 size-3.5" />
                  Add Chapter
                </Button>
              )}
            />
          </div>

          <form.Field
            name="chapters"
            children={(field) =>
              field.state.value.length === 0 ? (
                <div className="rounded border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No chapters yet. Click "Add Chapter" to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {field.state.value.map((chapter, index) => (
                    <ChapterCard
                      key={index}
                      chapter={chapter}
                      index={index}
                      total={field.state.value.length}
                      onChange={(updated) => {
                        const next = [...field.state.value];
                        next[index] = updated;
                        field.handleChange(next);
                      }}
                      onMoveUp={() => {
                        if (index === 0) return;
                        const next = [...field.state.value];
                        [next[index - 1], next[index]] = [next[index], next[index - 1]];
                        field.handleChange(next);
                      }}
                      onMoveDown={() => {
                        if (index === field.state.value.length - 1) return;
                        const next = [...field.state.value];
                        [next[index], next[index + 1]] = [next[index + 1], next[index]];
                        field.handleChange(next);
                      }}
                      onRemove={() => {
                        // If it's an existing chapter, track it for deletion
                        if (chapter.id) {
                          const current = form.getFieldValue("deletedChapterIds");
                          form.setFieldValue("deletedChapterIds", [
                            ...current,
                            chapter.id,
                          ]);
                        }
                        field.handleChange(
                          field.state.value.filter((_, i) => i !== index),
                        );
                      }}
                    />
                  ))}
                </div>
              )
            }
          />
        </div>

        {/* Submit */}
        <form.Subscribe
          selector={(s) => [s.canSubmit, s.isSubmitting] as const}
          children={([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded"
            >
              {isSubmitting ? (
                <>
                  <Spinner />
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Course"
              )}
            </Button>
          )}
        />
      </form>
    </div>
  );
}

// ── Chapter Card ──────────────────────────────────────────────────────────────

function ChapterCard({
  chapter,
  index,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  chapter: ChapterEntry;
  index: number;
  total: number;
  onChange: (updated: ChapterEntry) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded border bg-card shadow-sm">
      {/* Chapter header */}
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <span className="text-sm font-medium text-muted-foreground">
          Chapter {index + 1}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            disabled={index === 0}
            onClick={onMoveUp}
          >
            <ChevronUp className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            disabled={index === total - 1}
            onClick={onMoveDown}
          >
            <ChevronDown className="size-4" />
          </Button>
          {/* Free / Locked toggle */}
          <button
            type="button"
            onClick={() => onChange({ ...chapter, isFree: !chapter.isFree })}
            className={cn(
              "rounded-full border px-3 py-0.5 text-xs font-medium transition-colors",
              chapter.isFree
                ? "border-green-300 bg-green-50 text-green-700"
                : "border-gray-300 bg-muted text-muted-foreground",
            )}
          >
            {chapter.isFree ? "Free" : "Locked"}
          </button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            onClick={onRemove}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
        {/* Left: text fields */}
        <div className="space-y-4 border-b p-4 lg:border-b-0 lg:border-r">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={chapter.title}
              onChange={(e) => onChange({ ...chapter, title: e.target.value })}
              placeholder="Chapter title"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={chapter.description}
              onChange={(e) => onChange({ ...chapter, description: e.target.value })}
              placeholder="Chapter description..."
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Video URL</Label>
            <Input
              value={chapter.videoUrl}
              onChange={(e) => onChange({ ...chapter, videoUrl: e.target.value })}
              placeholder="https://youtube.com/..."
            />
          </div>
        </div>

        {/* Right: downloadable content */}
        <div className="p-4">
          <DocumentList
            label="Downloadable Content"
            docs={chapter.downloadableContent}
            onChange={(docs) => onChange({ ...chapter, downloadableContent: docs })}
            onDelete={(id) => {
              onChange({
                ...chapter,
                deletedDocIds: [...chapter.deletedDocIds, id],
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Document List ─────────────────────────────────────────────────────────────

function DocumentList({
  label,
  docs,
  onChange,
  onDelete,
}: {
  label: string;
  docs: DocEntry[];
  onChange: (docs: DocEntry[]) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>

      {docs.length > 0 && (
        <ul className="space-y-2">
          {docs.map((doc, i) => (
            <li key={i} className="flex items-start gap-2">
              <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="flex-1 space-y-1">
                {doc.type === "existing" ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary underline underline-offset-4 hover:text-primary/80 truncate"
                    >
                      {doc.name || doc.url}
                    </a>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Input
                      value={doc.name}
                      onChange={(e) => {
                        const next = [...docs];
                        next[i] = { ...doc, name: e.target.value };
                        onChange(next);
                      }}
                      placeholder="Document name"
                      className="h-7 text-sm"
                    />
                    {doc.file ? (
                      <p className="text-xs text-muted-foreground truncate">
                        {doc.file.name}
                      </p>
                    ) : (
                      <label className="cursor-pointer text-xs text-primary underline">
                        Choose file
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const next = [...docs];
                            next[i] = { ...doc, file };
                            onChange(next);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (doc.type === "existing") {
                    onDelete(doc.id);
                  }
                  onChange(docs.filter((_, j) => j !== i));
                }}
                className="shrink-0 text-destructive hover:text-destructive/80"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          onChange([...docs, { type: "new", name: "", file: null }])
        }
      >
        <Plus className="mr-1.5 size-3.5" />
        Add Document
      </Button>
    </div>
  );
}
