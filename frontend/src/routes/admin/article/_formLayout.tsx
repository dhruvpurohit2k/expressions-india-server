import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, X } from "lucide-react";
import { z } from "zod";

import { H1 } from "#/components/ui/typographyh1";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { Spinner } from "#/components/ui/spinner";
import { type LocalMedia, MediaUploadSection } from "#/components/media-upload";
import {
  INDIVIDUAL_AUDIENCES,
  AUDIENCE_LABELS,
} from "#/features/event/types";
import { saveArticle } from "#/features/article/api/saveArticle";
import { articleKeys } from "#/lib/query-keys";
import type { ArticleData } from "#/features/article/types";

export const Route = createFileRoute("/admin/article/_formLayout")({
  component: () => <></>,
});

export function ArticleForm({ article }: { article?: ArticleData }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!article?.id;

  const existingMedias: LocalMedia[] = (article?.medias ?? []).map((m) => ({
    type: "existing",
    id: m.id,
    url: m.url,
    name: m.name,
  }));

  const { mutateAsync } = useMutation({
    mutationFn: (formData: FormData) =>
      saveArticle(formData, article?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.all });
      navigate({ to: "/admin/article" });
    },
  });

  const form = useForm({
    defaultValues: {
      title: article?.title ?? "",
      category: article?.category ?? "",
      content: article?.content ?? "",
      audiences: article?.audience?.length ? article.audience.map((a) => a.name) : ["all"],
      medias: existingMedias as LocalMedia[],
      deletedMediaIds: [] as string[],
    },
    onSubmit: async ({ value }) => {
      const fd = new FormData();
      fd.append("title", value.title);
      fd.append("category", value.category);
      fd.append("content", value.content);
      const audiences = value.audiences.length ? value.audiences : ["all"];
      audiences.forEach((a) => fd.append("audiences", a));
      value.medias.forEach((m) => {
        if (m.type === "new") fd.append("medias", m.file);
      });
      value.deletedMediaIds.forEach((id) => fd.append("deletedMediaIds", id));
      await mutateAsync(fd);
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
          onClick={() => navigate({ to: "/admin/article" })}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <H1>{isEditing ? "Edit Article" : "Create Article"}</H1>
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
                  const r = z.string().min(1, "Title is required").safeParse(value);
                  return r.success ? undefined : r.error.issues[0].message;
                },
              }}
              children={(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Title <span className="text-destructive">*</span></Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Article title"
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

            {/* Category */}
            <form.Field
              name="category"
              validators={{
                onChange: ({ value }) => {
                  const r = z.string().min(1, "Category is required").safeParse(value);
                  return r.success ? undefined : r.error.issues[0].message;
                },
              }}
              children={(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Category <span className="text-destructive">*</span></Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. Mental Health, Education"
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

            {/* Audience */}
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

            {/* Content */}
            <form.Field
              name="content"
              validators={{
                onChange: ({ value }) => {
                  const r = z.string().min(1, "Content is required").safeParse(value);
                  return r.success ? undefined : r.error.issues[0].message;
                },
              }}
              children={(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Content <span className="text-destructive">*</span></Label>
                  <Textarea
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Write the article content here..."
                    className="min-h-64"
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
          </div>

          {/* ── Right column ── */}
          <div className="space-y-6 p-6">
            {/* Media */}
            <form.Field
              name="medias"
              children={(field) => (
                <MediaUploadSection
                  label="Images"
                  accept="image/png,image/jpeg,image/webp"
                  mediaList={field.state.value}
                  onAdd={(files) => {
                    const newItems: LocalMedia[] = files.map((f) => ({
                      type: "new",
                      file: f,
                    }));
                    field.handleChange([...field.state.value, ...newItems]);
                  }}
                  onRemove={(index) => {
                    const item = field.state.value[index];
                    if (item?.type === "existing") {
                      const current = form.getFieldValue("deletedMediaIds");
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
                    "Create Article"
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
