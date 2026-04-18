import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "#/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { H1 } from "#/components/ui/typographyh1";
import { Label } from "#/components/ui/label";
import { Input } from "#/components/ui/input";
import { Textarea } from "#/components/ui/textarea";
import { Spinner } from "#/components/ui/spinner";
import { type LocalMedia, SingleMediaUpload } from "#/components/media-upload";
import { presignAndUploadFiles } from "#/lib/presign";
import { almanacKeys } from "#/lib/query-keys";
import { saveAlmanac } from "#/features/almanac/api/saveAlmanac";
import type { Almanac } from "#/features/almanac/types";
import { z } from "zod";

export const Route = createFileRoute("/admin/almanac/_formLayout")({
  component: () => <></>,
});

export function AlmanacForm({ almanac }: { almanac?: Almanac }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationFn: ({ formData, id }: { formData: FormData; id?: string }) =>
      saveAlmanac(formData, id),
    meta: { successMessage: "Almanac saved" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: almanacKeys.all });
      if (almanac?.id) {
        navigate({ to: "/admin/almanac/$id", params: { id: almanac.id } });
      } else {
        navigate({ to: "/admin" });
      }
    },
  });

  const existingThumbnail: LocalMedia | null = almanac?.thumbnail
    ? {
      type: "existing",
      id: almanac.thumbnail.id,
      url: almanac.thumbnail.url,
      name: almanac.thumbnail.name,
    }
    : null;

  const existingPDF: LocalMedia | null = almanac?.pdf
    ? {
      type: "existing",
      id: almanac.pdf.id,
      url: almanac.pdf.url,
      name: almanac.pdf.name,
    }
    : null;

  const form = useForm({
    defaultValues: {
      title: almanac?.title ?? "",
      description: almanac?.description ?? "",
      thumbnail: existingThumbnail as LocalMedia | null,
      deletedThumbnailId: null as string | null,
      pdf: existingPDF as LocalMedia | null,
      deletedPDFId: null as string | null,
    },
    onSubmit: async ({ value }) => {
      const fd = new FormData();
      fd.append("title", value.title);
      if (value.description) fd.append("description", value.description);

      if (value.deletedThumbnailId) {
        fd.append("deletedThumbnailId", value.deletedThumbnailId);
      }
      if (value.deletedPDFId) {
        fd.append("deletedPDFId", value.deletedPDFId);
      }

      if (value.thumbnail?.type === "new") {
        const [ref] = await presignAndUploadFiles([
          { file: value.thumbnail.file, name: value.thumbnail.file.name },
        ]);
        fd.append("thumbnailUpload", JSON.stringify(ref));
      }

      if (value.pdf?.type === "new") {
        const [ref] = await presignAndUploadFiles([
          { file: value.pdf.file, name: value.pdf.file.name },
        ]);
        fd.append("pdfUpload", JSON.stringify(ref));
      }

      await mutateAsync({ formData: fd, id: almanac?.id });
    },
  });

  const isEditing = !!almanac?.id;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() =>
            isEditing
              ? navigate({
                to: "/admin/almanac/$id",
                params: { id: almanac!.id },
              })
              : navigate({ to: "/admin/almanac" })
          }
        >
          <ArrowLeft className="size-5" />
        </Button>
        <H1>{isEditing ? "Edit Almanac" : "Create Almanac"}</H1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-5 rounded border bg-card p-6 shadow-sm"
      >
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
                placeholder="Almanac title"
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
                placeholder="Short description..."
                rows={3}
              />
            </div>
          )}
        />

        {/* Thumbnail */}
        <form.Field
          name="thumbnail"
          children={(field) => (
            <SingleMediaUpload
              label="Thumbnail Image"
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

        {/* PDF */}
        <form.Field
          name="pdf"
          children={(field) => (
            <SingleMediaUpload
              label="PDF File"
              accept="application/pdf"
              media={field.state.value}
              onAdd={(file) => field.handleChange({ type: "new", file })}
              onRemove={() => {
                const current = field.state.value;
                if (current?.type === "existing") {
                  form.setFieldValue("deletedPDFId", current.id);
                }
                field.handleChange(null);
              }}
            />
          )}
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
                "Create Almanac"
              )}
            </Button>
          )}
        />
      </form>
    </div>
  );
}
