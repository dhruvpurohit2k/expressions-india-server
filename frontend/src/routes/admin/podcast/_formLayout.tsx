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
import { type Podcast } from "#/features/podcast/types";
import { savePodcast } from "#/features/podcast/api/savePodcast";
import { podcastKeys } from "#/lib/query-keys";
import { INDIVIDUAL_AUDIENCES, AUDIENCE_LABELS } from "#/features/event/types";
import { z } from "zod";

export const Route = createFileRoute("/admin/podcast/_formLayout")({
  component: () => <></>,
});

export function PodcastForm({ podcast }: { podcast?: Podcast }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      savePodcast(body, podcast?.id),
    meta: { successMessage: "Podcast saved" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: podcastKeys.all });
      if (podcast?.id) {
        navigate({ to: "/admin/podcast/$id", params: { id: podcast.id } });
      } else {
        navigate({ to: "/admin/podcast" });
      }
    },
  });

  const form = useForm({
    defaultValues: {
      title: podcast?.title ?? "",
      link: podcast?.link ?? "",
      description: podcast?.description ?? "",
      tags: podcast?.tags ?? "",
      transcript: podcast?.transcript ?? "",
      audiences: podcast?.audiences?.length ? podcast.audiences : ["all"],
    },
    onSubmit: async ({ value }) => {
      await mutateAsync({
        title: value.title,
        link: value.link,
        ...(value.description ? { description: value.description } : {}),
        tags: value.tags,
        ...(value.transcript ? { transcript: value.transcript } : {}),
        audiences: value.audiences.length ? value.audiences : ["all"],
      });
    },
  });

  const isEditing = !!podcast?.id;

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
                to: "/admin/podcast/$id",
                params: { id: podcast!.id },
              })
              : navigate({ to: "/admin/podcast" })
          }
        >
          <ArrowLeft className="size-5" />
        </Button>
        <H1>{isEditing ? "Edit Podcast" : "Create Podcast"}</H1>
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
                  <Label htmlFor={field.name}>Title <span className="text-destructive">*</span></Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Podcast title"
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

            {/* Tags */}
            <form.Field
              name="tags"
              children={(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Tags</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="mental health, students, wellness"
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated tags
                  </p>
                </div>
              )}
            />

            {/* Transcript */}
            <form.Field
              name="transcript"
              children={(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Transcript</Label>
                  <Textarea
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Paste the full transcript here..."
                    rows={8}
                  />
                </div>
              )}
            />
          </div>

          {/* ── Right column ── */}
          <div className="space-y-6 p-6">
            {/* Link */}
            <form.Field
              name="link"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return undefined;
                  const r = z.url().safeParse(value);
                  return r.success ? undefined : "Must be a valid URL";
                },
              }}
              children={(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Podcast Link <span className="text-destructive">*</span></Label>
                  <Input
                    id={field.name}
                    type="url"
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
                            className="cursor-pointer font-normal"
                          >
                            {AUDIENCE_LABELS[option]}
                          </Label>
                        </div>
                      ))}
                      <div className="col-span-2 mt-1 flex items-center gap-2 border-t pt-2">
                        <input
                          id="audience-all"
                          type="checkbox"
                          checked={isAll}
                          onChange={(e) => toggleAll(e.target.checked)}
                          className="size-4 accent-primary"
                        />
                        <Label
                          htmlFor="audience-all"
                          className="cursor-pointer font-normal"
                        >
                          All
                        </Label>
                      </div>
                    </div>
                  </div>
                );
              }}
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
                    "Create Podcast"
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
