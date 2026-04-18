import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "#/components/ui/button";
import { ArrowLeft, Plus, X, UploadCloud } from "lucide-react";
import { H1 } from "#/components/ui/typographyh1";
import { Label } from "#/components/ui/label";
import { Input } from "#/components/ui/input";
import { Textarea } from "#/components/ui/textarea";
import { Spinner } from "#/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { cn } from "#/lib/utils";
import { journalKeys } from "#/lib/query-keys";
import { MONTHS } from "#/lib/months";
import { saveJournal } from "#/features/journal/api/saveJournal";
import {
  type LocalMedia,
  SingleMediaUpload,
} from "#/components/media-upload";
import type { Journal } from "#/features/journal/types";
import { useRef } from "react";

export const Route = createFileRoute("/admin/journal/_formLayout")({
  component: () => <></>,
});

type FormChapter = {
  id?: string;
  title: string;
  description: string;
  media: LocalMedia | null;
  deletedMediaId: string | null;
  authors: string[];
};

function emptyChapter(): FormChapter {
  return {
    title: "",
    description: "",
    media: null,
    deletedMediaId: null,
    authors: [""],
  };
}

function ChapterMediaUpload({
  media,
  onAdd,
  onRemove,
}: {
  media: LocalMedia | null;
  onAdd: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Chapter PDF</p>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="invisible absolute w-0"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onAdd(file);
          e.target.value = "";
        }}
      />
      {media ? (
        <div className="group relative w-fit">
          <div className="flex h-16 items-center gap-2 rounded border bg-muted px-3 text-xs text-muted-foreground">
            PDF:{" "}
            {media.type === "new"
              ? media.file.name
              : media.name}
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow transition-opacity group-hover:opacity-100"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <UploadCloud className="mr-2 size-4" />
          Upload PDF
        </Button>
      )}
    </div>
  );
}

export function JournalForm({ journal }: { journal?: Journal }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationFn: ({ formData, id }: { formData: FormData; id?: string }) =>
      saveJournal(formData, id),
    meta: { successMessage: "Journal saved" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.all });
      if (journal?.id) {
        navigate({ to: "/admin/journal/$id", params: { id: journal.id } });
      } else {
        navigate({ to: "/admin/journal" });
      }
    },
  });

  const existingCover: LocalMedia | null = journal?.media
    ? {
        type: "existing",
        id: journal.media.id,
        url: journal.media.url,
        name: journal.media.name,
      }
    : null;

  const existingChapters: FormChapter[] =
    journal?.chapters.map((ch) => ({
      id: ch.id,
      title: ch.title,
      description: ch.description ?? "",
      media: ch.media
        ? {
            type: "existing" as const,
            id: ch.media.id,
            url: ch.media.url,
            name: ch.media.name,
          }
        : null,
      deletedMediaId: null,
      authors: ch.authors.length > 0 ? ch.authors.map((a) => a.name) : [""],
    })) ?? [];

  const form = useForm({
    defaultValues: {
      title: journal?.title ?? "",
      description: journal?.description ?? "",
      volume: journal?.volume ?? (undefined as number | undefined),
      issue: journal?.issue ?? (undefined as number | undefined),
      startMonth: journal?.startMonth ?? "",
      endMonth: journal?.endMonth ?? "",
      year: journal?.year ?? (undefined as number | undefined),
      coverMedia: existingCover as LocalMedia | null,
      deletedCoverMediaId: null as string | null,
      chapters: existingChapters.length > 0 ? existingChapters : [emptyChapter()],
      deletedChapterIds: [] as string[],
    },
    onSubmit: async ({ value }) => {
      const fd = new FormData();
      fd.append("title", value.title);
      if (value.description) fd.append("description", value.description);
      if (value.volume != null) fd.append("volume", String(value.volume));
      if (value.issue != null) fd.append("issue", String(value.issue));
      if (value.startMonth) fd.append("startMonth", value.startMonth);
      if (value.endMonth) fd.append("endMonth", value.endMonth);
      if (value.year != null) fd.append("year", String(value.year));

      // Cover media
      if (value.coverMedia?.type === "new") {
        fd.append("coverMedia", value.coverMedia.file);
      }
      if (value.deletedCoverMediaId) {
        fd.append("deletedCoverMediaId", value.deletedCoverMediaId);
      }

      // Chapters metadata (JSON) + files indexed
      const chaptersMeta = value.chapters.map((ch, i) => ({
        id: ch.id,
        title: ch.title,
        description: ch.description,
        authors: ch.authors.filter((a) => a.trim() !== ""),
        deletedMediaId: ch.deletedMediaId,
        hasNewMedia: ch.media?.type === "new",
      }));
      fd.append("chapters", JSON.stringify(chaptersMeta));

      value.chapters.forEach((ch, i) => {
        if (ch.media?.type === "new") {
          fd.append(`chapterMedia_${i}`, ch.media.file);
        }
      });

      if (value.deletedChapterIds.length) {
        fd.append("deletedChapterIds", JSON.stringify(value.deletedChapterIds));
      }

      await mutateAsync({ formData: fd, id: journal?.id });
    },
  });

  const isEditing = !!journal?.id;

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
              ? navigate({
                  to: "/admin/journal/$id",
                  params: { id: journal!.id },
                })
              : navigate({ to: "/admin/journal" })
          }
        >
          <ArrowLeft className="size-5" />
        </Button>
        <H1>{isEditing ? "Edit Journal" : "Create Journal"}</H1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="rounded border bg-card shadow-sm"
      >
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
          {/* ── Left column ── */}
          <div className="space-y-5 border-b p-6 lg:border-b-0 lg:border-r">
            {/* Title */}
            <form.Field
              name="title"
              children={(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Title</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Journal title"
                  />
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
                    placeholder="Write description here..."
                    rows={3}
                  />
                </div>
              )}
            />

            {/* Volume & Issue */}
            <div className="grid grid-cols-2 gap-4">
              <form.Field
                name="volume"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>Volume</Label>
                    <Input
                      id={field.name}
                      type="number"
                      min={1}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                      placeholder="e.g. 12"
                    />
                  </div>
                )}
              />
              <form.Field
                name="issue"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>Issue</Label>
                    <Input
                      id={field.name}
                      type="number"
                      min={1}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                      placeholder="e.g. 3"
                    />
                  </div>
                )}
              />
            </div>

            {/* Start Month & End Month */}
            <div className="grid grid-cols-2 gap-4">
              <form.Field
                name="startMonth"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label>Start Month</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={field.handleChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
              <form.Field
                name="endMonth"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label>End Month</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={field.handleChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
            </div>

            {/* Year */}
            <form.Field
              name="year"
              children={(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Year</Label>
                  <Input
                    id={field.name}
                    type="number"
                    min={1900}
                    max={2100}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    placeholder="e.g. 2025"
                  />
                </div>
              )}
            />

            {/* Cover Media */}
            <form.Field
              name="coverMedia"
              children={(field) => (
                <SingleMediaUpload
                  label="Cover Image / PDF"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  media={field.state.value}
                  onAdd={(file) => {
                    field.handleChange({ type: "new", file });
                  }}
                  onRemove={() => {
                    const current = field.state.value;
                    if (current?.type === "existing") {
                      form.setFieldValue("deletedCoverMediaId", current.id);
                    }
                    field.handleChange(null);
                  }}
                />
              )}
            />
          </div>

          {/* ── Right column: Chapters ── */}
          <div className="space-y-5 p-6">
            <Label className="text-base">Chapters</Label>

            <form.Field
              name="chapters"
              children={(chaptersField) => (
                <div className="space-y-4">
                  {chaptersField.state.value.map((chapter, chIdx) => (
                    <div
                      key={chIdx}
                      className="relative space-y-3 rounded border p-4"
                    >
                      {/* Remove chapter */}
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Chapter {chIdx + 1}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive"
                          onClick={() => {
                            const ch = chaptersField.state.value[chIdx];
                            if (ch.id) {
                              const current =
                                form.getFieldValue("deletedChapterIds");
                              form.setFieldValue("deletedChapterIds", [
                                ...current,
                                ch.id,
                              ]);
                            }
                            chaptersField.handleChange(
                              chaptersField.state.value.filter(
                                (_, i) => i !== chIdx,
                              ),
                            );
                          }}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>

                      {/* Chapter title */}
                      <div className="space-y-1">
                        <Label className="text-xs">Title</Label>
                        <Input
                          value={chapter.title}
                          onChange={(e) => {
                            const updated = [...chaptersField.state.value];
                            updated[chIdx] = {
                              ...updated[chIdx],
                              title: e.target.value,
                            };
                            chaptersField.handleChange(updated);
                          }}
                          placeholder="Chapter title"
                        />
                      </div>

                      {/* Chapter description */}
                      <div className="space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Textarea
                          value={chapter.description}
                          onChange={(e) => {
                            const updated = [...chaptersField.state.value];
                            updated[chIdx] = {
                              ...updated[chIdx],
                              description: e.target.value,
                            };
                            chaptersField.handleChange(updated);
                          }}
                          placeholder="Chapter description"
                          rows={2}
                        />
                      </div>

                      {/* Chapter media (PDF) */}
                      <ChapterMediaUpload
                        media={chapter.media}
                        onAdd={(file) => {
                          const updated = [...chaptersField.state.value];
                          updated[chIdx] = {
                            ...updated[chIdx],
                            media: { type: "new", file },
                          };
                          chaptersField.handleChange(updated);
                        }}
                        onRemove={() => {
                          const updated = [...chaptersField.state.value];
                          const current = updated[chIdx];
                          updated[chIdx] = {
                            ...current,
                            media: null,
                            deletedMediaId:
                              current.media?.type === "existing"
                                ? current.media.id
                                : null,
                          };
                          chaptersField.handleChange(updated);
                        }}
                      />

                      {/* Authors */}
                      <div className="space-y-2">
                        <Label className="text-xs">Authors</Label>
                        {chapter.authors.map((author, aIdx) => (
                          <div key={aIdx} className="flex gap-2">
                            <Input
                              value={author}
                              onChange={(e) => {
                                const updated = [
                                  ...chaptersField.state.value,
                                ];
                                const newAuthors = [
                                  ...updated[chIdx].authors,
                                ];
                                newAuthors[aIdx] = e.target.value;
                                updated[chIdx] = {
                                  ...updated[chIdx],
                                  authors: newAuthors,
                                };
                                chaptersField.handleChange(updated);
                              }}
                              placeholder="Author name"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="shrink-0 text-destructive hover:text-destructive"
                              onClick={() => {
                                const updated = [
                                  ...chaptersField.state.value,
                                ];
                                updated[chIdx] = {
                                  ...updated[chIdx],
                                  authors: updated[chIdx].authors.filter(
                                    (_, i) => i !== aIdx,
                                  ),
                                };
                                chaptersField.handleChange(updated);
                              }}
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updated = [...chaptersField.state.value];
                            updated[chIdx] = {
                              ...updated[chIdx],
                              authors: [...updated[chIdx].authors, ""],
                            };
                            chaptersField.handleChange(updated);
                          }}
                        >
                          <Plus className="mr-1.5 size-3.5" />
                          Add Author
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Add chapter — at the bottom so user doesn't scroll up */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      chaptersField.handleChange([
                        ...chaptersField.state.value,
                        emptyChapter(),
                      ])
                    }
                  >
                    <Plus className="mr-1.5 size-4" />
                    Add Chapter
                  </Button>
                </div>
              )}
            />

            {/* Submit */}
            <form.Subscribe
              selector={(s) => [s.canSubmit, s.isSubmitting] as const}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit} className="w-full rounded">
                  {isSubmitting ? (
                    <>
                      <Spinner />
                      Saving...
                    </>
                  ) : isEditing ? (
                    "Save Changes"
                  ) : (
                    "Create Journal"
                  )}
                </Button>
              )}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
