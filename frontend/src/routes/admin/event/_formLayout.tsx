import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "#/components/ui/button";
import { ArrowLeft, CalendarIcon, FileText, Plus, X } from "lucide-react";
import { H1 } from "#/components/ui/typographyh1";
import { Label } from "#/components/ui/label";
import { Input } from "#/components/ui/input";
import { Textarea } from "#/components/ui/textarea";
import { Spinner } from "#/components/ui/spinner";
import {
  type EventData,
  INDIVIDUAL_AUDIENCES,
  AUDIENCE_LABELS,
} from "#/features/event/types";
import { cn } from "#/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "#/components/ui/calendar";
import { saveEvent } from "#/features/event/api/saveEvent";
import { eventKeys } from "#/lib/query-keys";
import {
  type LocalMedia,
  MediaUploadSection,
  SingleMediaUpload,
} from "#/components/media-upload";
import { presignAndUploadFiles } from "#/lib/presign";
import { z } from "zod";

export const Route = createFileRoute("/admin/event/_formLayout")({
  component: () => <></>,
});

type DocEntry =
  | { type: "existing"; id: string; name: string; url: string }
  | { type: "new"; name: string; file: File | null };

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
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary underline underline-offset-4 hover:text-primary/80 truncate block"
                  >
                    {doc.name || doc.url}
                  </a>
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
                  if (doc.type === "existing") onDelete(doc.id);
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

export function EventForm({ event }: { event?: EventData }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationFn: ({ formData, id }: { formData: FormData; id?: string }) =>
      saveEvent(formData, id),
    meta: { successMessage: "Event saved" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      if (event?.id) {
        navigate({ to: "/admin/event/$id", params: { id: event.id } });
      } else {
        navigate({ to: "/admin/event" });
      }
    },
  });

  const existingThumbnail: LocalMedia | null = event?.thumbnail
    ? {
      type: "existing",
      id: event.thumbnail.id,
      url: event.thumbnail.url,
      name: event.thumbnail.name,
    }
    : null;

  const existingPromotional: LocalMedia[] = (event?.promotionalMedia ?? []).map(
    (m) => ({ type: "existing", id: m.id, url: m.url, name: m.name }),
  );
  const existingMedias: LocalMedia[] = (event?.medias ?? []).map((m) => ({
    type: "existing",
    id: m.id,
    url: m.url,
    name: m.name,
  }));
  const existingDocuments: DocEntry[] = (event?.documents ?? []).map((m) => ({
    type: "existing",
    id: m.id,
    url: m.url,
    name: m.name,
  }));

  const existingPromotionalDocuments: DocEntry[] = (
    event?.promotionalDocuments ?? []
  ).map((m) => ({
    type: "existing",
    id: m.id,
    url: m.url,
    name: m.name,
  }));

  const form = useForm({
    defaultValues: {
      title: event?.title ?? "",
      description: event?.description ?? "",
      registrationUrl: event?.registrationUrl ?? "",
      location: event?.location ?? "",
      isOnline: event?.isOnline ?? false,
      isPaid: event?.isPaid ?? false,
      status: (event?.status ?? "upcoming") as "upcoming" | "completed",
      price: event?.price ?? (undefined as number | undefined),
      perks: event?.perks ?? ([] as string[]),
      videoLinks: event?.videoLinks?.map((l) => l.url) ?? ([] as string[]),
      audiences: event?.audiences?.length ? event.audiences : ["all"],
      startDate: event?.startDate ?? (undefined as Date | undefined),
      endDate: event?.endDate ?? (undefined as Date | undefined),
      startTime: event?.startTime ?? "",
      endTime: event?.endTime ?? "",
      promotionalVideoLinks:
        event?.promotionalVideoLinks?.map((l) => l.url) ?? ([] as string[]),
      thumbnail: existingThumbnail as LocalMedia | null,
      deletedThumbnailId: undefined as string | undefined,
      promotionalMedia: existingPromotional as LocalMedia[],
      medias: existingMedias as LocalMedia[],
      documents: existingDocuments as DocEntry[],
      promotionalDocuments: existingPromotionalDocuments as DocEntry[],
      deletedPromotionalMediaIds: [] as string[],
      deletedPromotionalDocumentIds: [] as string[],
      deletedMediaIds: [] as string[],
      deletedDocumentIds: [] as string[],
    },
    onSubmit: async ({ value }) => {
      const fd = new FormData();
      fd.append("title", value.title);
      if (value.description) fd.append("description", value.description);
      fd.append("registrationUrl", value.registrationUrl);
      fd.append("isOnline", String(value.isOnline));
      if (!value.isOnline && value.location)
        fd.append("location", value.location);
      fd.append("isPaid", String(value.isPaid));
      fd.append("status", value.status);
      if (value.isPaid && value.price != null)
        fd.append("price", String(value.price));
      if (value.perks.length) fd.append("perks", JSON.stringify(value.perks));
      const audiences = value.audiences.length ? value.audiences : ["all"];
      audiences.forEach((a) => fd.append("audiences", a));
      if (value.startDate)
        fd.append(
          "startDate",
          value.startDate.toISOString().replace(/\.\d+Z$/, "Z"),
        );
      if (value.endDate)
        fd.append(
          "endDate",
          value.endDate.toISOString().replace(/\.\d+Z$/, "Z"),
        );
      if (value.startTime) fd.append("startTime", value.startTime);
      if (value.endTime) fd.append("endTime", value.endTime);

      if (value.deletedThumbnailId)
        fd.append("deletedThumbnailId", value.deletedThumbnailId);

      // Presign + upload all new files directly to S3, then pass refs to server.
      if (value.thumbnail?.type === "new") {
        const [ref] = await presignAndUploadFiles([
          { file: value.thumbnail.file, name: value.thumbnail.file.name },
        ]);
        fd.append("thumbnailUpload", JSON.stringify(ref));
      }

      if (value.status === "upcoming") {
        const newPromo = value.promotionalMedia.filter(
          (m) => m.type === "new",
        ) as Extract<LocalMedia, { type: "new" }>[];
        if (newPromo.length > 0) {
          const refs = await presignAndUploadFiles(
            newPromo.map((m) => ({ file: m.file, name: m.file.name })),
          );
          refs.forEach((ref) =>
            fd.append("promotionalMediaUploads", JSON.stringify(ref)),
          );
        }
        value.promotionalVideoLinks.forEach((link) =>
          fd.append("promotionalVideoLinks", link),
        );
        value.deletedPromotionalMediaIds.forEach((id) =>
          fd.append("deletedPromotionalMediaIds", id),
        );

        const newPromoDocs = value.promotionalDocuments.filter(
          (d): d is Extract<DocEntry, { type: "new" }> =>
            d.type === "new" && d.file !== null,
        );
        if (newPromoDocs.length > 0) {
          const refs = await presignAndUploadFiles(
            newPromoDocs.map((d) => ({ file: d.file!, name: d.name })),
          );
          refs.forEach((ref) =>
            fd.append("promotionalDocumentUploads", JSON.stringify(ref)),
          );
        }
        value.deletedPromotionalDocumentIds.forEach((id) =>
          fd.append("deletedPromotionalDocumentIds", id),
        );
      } else {
        value.videoLinks.forEach((link) => fd.append("videoLinks", link));

        const newMedias = value.medias.filter(
          (m) => m.type === "new",
        ) as Extract<LocalMedia, { type: "new" }>[];
        if (newMedias.length > 0) {
          const refs = await presignAndUploadFiles(
            newMedias.map((m) => ({ file: m.file, name: m.file.name })),
          );
          refs.forEach((ref) => fd.append("mediaUploads", JSON.stringify(ref)));
        }

        const newDocs = value.documents.filter(
          (d): d is Extract<DocEntry, { type: "new" }> =>
            d.type === "new" && d.file !== null,
        );
        if (newDocs.length > 0) {
          const refs = await presignAndUploadFiles(
            newDocs.map((d) => ({ file: d.file!, name: d.name })),
          );
          refs.forEach((ref) =>
            fd.append("documentUploads", JSON.stringify(ref)),
          );
        }

        value.deletedMediaIds.forEach((id) => fd.append("deletedMediaIds", id));
        value.deletedDocumentIds.forEach((id) =>
          fd.append("deletedDocumentIds", id),
        );
      }

      await mutateAsync({ formData: fd, id: event?.id });
    },
  });

  const isEditing = !!event?.id;

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
              ? navigate({ to: "/admin/event/$id", params: { id: event!.id } })
              : navigate({ to: "/admin/event" })
          }
        >
          <ArrowLeft className="size-5" />
        </Button>
        <H1>{isEditing ? "Edit Event" : "Create Event"}</H1>
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
              validators={{
                onChange: ({ value }) => {
                  const r = z
                    .string()
                    .min(1, "Title is required")
                    .safeParse(value);
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
                    placeholder="Event title"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-destructive">
                      {field.state.meta.errors
                        .map((e) =>
                          typeof e === "string" ? e : (e as any).message,
                        )
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
                    placeholder="Write description here..."
                    rows={4}
                  />
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
                    placeholder="https://..."
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-destructive">
                      {field.state.meta.errors
                        .map((e) =>
                          typeof e === "string" ? e : (e as any).message,
                        )
                        .join(", ")}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Perks */}
            <form.Field
              name="perks"
              children={(field) => (
                <div className="space-y-2">
                  <Label>Details</Label>
                  {field.state.value.map((perk, index) => (
                    <div key={index} className="flex gap-2">
                      <Textarea
                        value={perk}
                        onChange={(e) => {
                          const updated = [...field.state.value];
                          updated[index] = e.target.value;
                          field.handleChange(updated);
                        }}
                        placeholder="Enter a detail..."
                        rows={2}
                        className="resize-none"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive hover:text-destructive"
                        onClick={() =>
                          field.handleChange(
                            field.state.value.filter((_, i) => i !== index),
                          )
                        }
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      field.handleChange([...field.state.value, ""])
                    }
                  >
                    <Plus className="mr-1.5 size-3.5" />
                    Add Detail
                  </Button>
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
                      const next = INDIVIDUAL_AUDIENCES.filter(
                        (a) => a !== option,
                      );
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

            {/* Start / End Date */}
            <div className="grid grid-cols-2 gap-4">
              <form.Field
                name="startDate"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.state.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 size-4" />
                          {field.state.value
                            ? format(field.state.value, "PP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.state.value}
                          onSelect={field.handleChange}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              />
              <form.Field
                name="endDate"
                validators={{
                  onChangeListenTo: ["startDate"],
                  onChange: ({ value, fieldApi }) => {
                    if (!value) return undefined;
                    const startDate = fieldApi.form.getFieldValue("startDate");
                    if (startDate && value < startDate)
                      return "End date must be on or after start date";
                    return undefined;
                  },
                }}
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.state.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 size-4" />
                          {field.state.value
                            ? format(field.state.value, "PP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.state.value}
                          onSelect={field.handleChange}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-xs text-destructive">
                        {field.state.meta.errors
                          .map((e) =>
                            typeof e === "string" ? e : (e as any).message,
                          )
                          .join(", ")}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Start / End Time */}
            <div className="grid grid-cols-2 gap-4">
              <form.Field
                name="startTime"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>Start Time</Label>
                    <Input
                      id={field.name}
                      type="time"
                      value={field.state.value ?? ""}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              />
              <form.Field
                name="endTime"
                validators={{
                  onChangeListenTo: ["startTime"],
                  onChange: ({ value, fieldApi }) => {
                    if (!value) return undefined;
                    const startTime = fieldApi.form.getFieldValue("startTime");
                    if (startTime && value < startTime)
                      return "End time must be after start time";
                    return undefined;
                  },
                }}
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name}>End Time</Label>
                    <Input
                      id={field.name}
                      type="time"
                      value={field.state.value ?? ""}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-xs text-destructive">
                        {field.state.meta.errors
                          .map((e) =>
                            typeof e === "string" ? e : (e as any).message,
                          )
                          .join(", ")}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Is Online */}
            <form.Field
              name="isOnline"
              children={(field) => (
                <div className="flex items-center gap-3">
                  <input
                    id={field.name}
                    type="checkbox"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className="size-4 accent-primary"
                  />
                  <Label htmlFor={field.name}>Online Event</Label>
                </div>
              )}
            />

            {/* Location — conditional on isOnline */}
            <form.Subscribe
              selector={(s) => s.values.isOnline}
              children={(isOnline) =>
                !isOnline ? (
                  <form.Field
                    name="location"
                    children={(field) => (
                      <div className="space-y-1.5">
                        <Label htmlFor={field.name}>Location</Label>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Venue / address"
                        />
                      </div>
                    )}
                  />
                ) : null
              }
            />

            {/* Is Paid */}
            <form.Field
              name="isPaid"
              children={(field) => (
                <div className="flex items-center gap-3">
                  <input
                    id={field.name}
                    type="checkbox"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className="size-4 accent-primary"
                  />
                  <Label htmlFor={field.name}>Paid Event</Label>
                </div>
              )}
            />

            {/* Price — conditional on isPaid */}
            <form.Subscribe
              selector={(s) => s.values.isPaid}
              children={(isPaid) =>
                isPaid ? (
                  <form.Field
                    name="price"
                    children={(field) => (
                      <div className="space-y-1.5">
                        <Label htmlFor={field.name}>Price (₹)</Label>
                        <Input
                          id={field.name}
                          type="number"
                          min={1}
                          value={field.state.value ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            )
                          }
                          placeholder="Enter price"
                        />
                      </div>
                    )}
                  />
                ) : null
              }
            />
          </div>

          {/* ── Right column ── */}
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

            {/* Status toggle */}
            <form.Field
              name="status"
              children={(field) => (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex overflow-hidden rounded border">
                    {(["upcoming", "completed"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => field.handleChange(s)}
                        className={cn(
                          "flex-1 px-4 py-2 text-sm font-medium capitalize transition-colors",
                          field.state.value === s
                            ? "bg-primary text-primary-foreground"
                            : "bg-card text-muted-foreground hover:bg-muted",
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            />

            {/* Status-conditional media sections */}
            <form.Subscribe
              selector={(s) => s.values.status}
              children={(status) =>
                status === "upcoming" ? (
                  <>
                    {/* Upcoming: promotional media */}
                    {/* Video Links */}
                    <form.Field
                      name="promotionalVideoLinks"
                      validators={{
                        onChange: ({ value }) => {
                          for (const link of value) {
                            if (!link) continue;
                            const r = z.url().safeParse(link);
                            if (!r.success)
                              return "All links must be valid URLs";
                          }
                          return undefined;
                        },
                      }}
                      children={(field) => (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">
                            Promo Video Links
                          </Label>
                          {field.state.value.map((link, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={link}
                                onChange={(e) => {
                                  const updated = [...field.state.value];
                                  updated[index] = e.target.value;
                                  field.handleChange(updated);
                                }}
                                placeholder="https://youtube.com/..."
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="shrink-0 text-destructive hover:text-destructive"
                                onClick={() =>
                                  field.handleChange(
                                    field.state.value.filter(
                                      (_, i) => i !== index,
                                    ),
                                  )
                                }
                              >
                                <X className="size-4" />
                              </Button>
                            </div>
                          ))}
                          {field.state.meta.errors.length > 0 && (
                            <p className="text-xs text-destructive">
                              {field.state.meta.errors
                                .map((e) =>
                                  typeof e === "string"
                                    ? e
                                    : (e as any).message,
                                )
                                .join(", ")}
                            </p>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              field.handleChange([...field.state.value, ""])
                            }
                          >
                            <Plus className="mr-1.5 size-3.5" />
                            Add Link
                          </Button>
                        </div>
                      )}
                    />
                    <form.Field
                      name="promotionalMedia"
                      children={(field) => (
                        <MediaUploadSection
                          label="Promotional Media"
                          accept="image/png,image/jpeg,image/webp,video/*"
                          mediaList={field.state.value}
                          onAdd={(files) => {
                            const newItems: LocalMedia[] = files.map((f) => ({
                              type: "new",
                              file: f,
                            }));
                            field.handleChange([
                              ...field.state.value,
                              ...newItems,
                            ]);
                          }}
                          onRemove={(index) => {
                            const item = field.state.value[index];
                            if (item?.type === "existing") {
                              const current = form.getFieldValue(
                                "deletedPromotionalMediaIds",
                              );
                              form.setFieldValue("deletedPromotionalMediaIds", [
                                ...current,
                                item.id,
                              ]);
                            }
                            field.handleChange(
                              field.state.value.filter((_, i) => i !== index),
                            );
                          }}
                        />
                      )}
                    />
                    <form.Field
                      name="promotionalDocuments"
                      children={(field) => (
                        <DocumentList
                          label="Promotional Documents"
                          docs={field.state.value}
                          onChange={field.handleChange}
                          onDelete={(id) => {
                            const current = form.getFieldValue(
                              "deletedPromotionalDocumentIds",
                            );
                            form.setFieldValue(
                              "deletedPromotionalDocumentIds",
                              [...current, id],
                            );
                          }}
                        />
                      )}
                    />
                  </>
                ) : (
                  /* Completed: media + documents */
                  <div className="space-y-6">
                    <form.Field
                      name="videoLinks"
                      validators={{
                        onChange: ({ value }) => {
                          for (const link of value) {
                            if (!link) continue;
                            const r = z.url().safeParse(link);
                            if (!r.success)
                              return "All links must be valid URLs";
                          }
                          return undefined;
                        },
                      }}
                      children={(field) => (
                        <div className="space-y-2">
                          <Label>Video Links</Label>
                          {field.state.value.map((link, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={link}
                                onChange={(e) => {
                                  const updated = [...field.state.value];
                                  updated[index] = e.target.value;
                                  field.handleChange(updated);
                                }}
                                placeholder="https://youtube.com/..."
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="shrink-0 text-destructive hover:text-destructive"
                                onClick={() =>
                                  field.handleChange(
                                    field.state.value.filter(
                                      (_, i) => i !== index,
                                    ),
                                  )
                                }
                              >
                                <X className="size-4" />
                              </Button>
                            </div>
                          ))}
                          {field.state.meta.errors.length > 0 && (
                            <p className="text-xs text-destructive">
                              {field.state.meta.errors
                                .map((e) =>
                                  typeof e === "string"
                                    ? e
                                    : (e as any).message,
                                )
                                .join(", ")}
                            </p>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              field.handleChange([...field.state.value, ""])
                            }
                          >
                            <Plus className="mr-1.5 size-3.5" />
                            Add Link
                          </Button>
                        </div>
                      )}
                    />
                    <form.Field
                      name="medias"
                      children={(field) => (
                        <MediaUploadSection
                          label="Media (Images)"
                          accept="image/png,image/jpeg,image/webp"
                          mediaList={field.state.value}
                          onAdd={(files) => {
                            const newItems: LocalMedia[] = files.map((f) => ({
                              type: "new",
                              file: f,
                            }));
                            field.handleChange([
                              ...field.state.value,
                              ...newItems,
                            ]);
                          }}
                          onRemove={(index) => {
                            const item = field.state.value[index];
                            if (item?.type === "existing") {
                              const current =
                                form.getFieldValue("deletedMediaIds");
                              form.setFieldValue("deletedMediaIds", [
                                ...current,
                                item.id,
                              ]);
                            }
                            field.handleChange(
                              field.state.value.filter((_, i) => i !== index),
                            );
                          }}
                        />
                      )}
                    />

                    <form.Field
                      name="documents"
                      children={(field) => (
                        <DocumentList
                          label="Documents"
                          docs={field.state.value}
                          onChange={field.handleChange}
                          onDelete={(id) => {
                            const current =
                              form.getFieldValue("deletedDocumentIds");
                            form.setFieldValue("deletedDocumentIds", [
                              ...current,
                              id,
                            ]);
                          }}
                        />
                      )}
                    />
                  </div>
                )
              }
            />

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
                    "Create Event"
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
