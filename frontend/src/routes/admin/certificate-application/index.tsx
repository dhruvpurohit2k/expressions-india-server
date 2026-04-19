import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { format } from "date-fns";
import { z } from "zod";
import { ArrowLeft, CalendarIcon, Pencil, Trash2 } from "lucide-react";

import { H1 } from "#/components/ui/typographyh1";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { Spinner } from "#/components/ui/spinner";
import { Skeleton } from "#/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "#/components/ui/popover";
import { Calendar } from "#/components/ui/calendar";
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
import { certApplicationKeys } from "#/lib/query-keys";
import { useCertApplicationsQuery } from "#/features/certificate-application/hooks/useCertApplicationsQuery";
import { saveCertApplication } from "#/features/certificate-application/api/saveCertApplication";
import { deleteCertApplication } from "#/features/certificate-application/api/deleteCertApplication";
import type { CertApplication } from "#/features/certificate-application/types";

export const Route = createFileRoute("/admin/certificate-application/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useCertApplicationsQuery();
  const existing = data?.[0] ?? null;
  const [editing, setEditing] = useState(false);

  if (isLoading) return <LoadingSkeleton onBack={() => navigate({ to: "/admin/course" })} />;
  if (error) return (
    <div className="px-2 lg:px-10 pt-6">
      <p className="text-destructive text-sm">Failed to load certificate application.</p>
    </div>
  );

  const showForm = !existing || editing;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editing ? setEditing(false) : navigate({ to: "/admin/course" })}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <H1>Certificate Application</H1>
      </div>

      {showForm ? (
        <CertApplicationForm
          existing={editing ? existing : null}
          onSuccess={() => setEditing(false)}
        />
      ) : (
        <ExistingCard record={existing!} onEdit={() => setEditing(true)} />
      )}
    </div>
  );
}

function ExistingCard({ record, onEdit }: { record: CertApplication; onEdit: () => void }) {
  const queryClient = useQueryClient();
  const { mutateAsync: doDelete, isPending } = useMutation({
    mutationFn: () => deleteCertApplication(record.id),
    meta: { successMessage: "Deleted" },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: certApplicationKeys.all }),
  });

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-4">
        <p className="font-semibold text-lg">Certificate Application</p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="icon" onClick={onEdit}>
            <Pencil className="size-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete certificate application?</AlertDialogTitle>
                <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => doDelete()}
                  disabled={isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isPending ? <Spinner /> : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Form URL</p>
        <a
          href={record.formUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary underline-offset-4 hover:underline break-all"
        >
          {record.formUrl}
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Opens</p>
          <p className="text-sm">
            {record.openFrom ? format(record.openFrom, "dd MMM yyyy") : "—"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Closes</p>
          <p className="text-sm">
            {record.openUntil ? format(record.openUntil, "dd MMM yyyy") : "—"}
          </p>
        </div>
      </div>

      {record.closedMessage && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Closed message</p>
          <p className="text-sm">{record.closedMessage}</p>
        </div>
      )}

      <div className="rounded-md border px-4 py-2 bg-muted/40">
        <StatusBadge record={record} />
      </div>
    </div>
  );
}

function StatusBadge({ record }: { record: CertApplication }) {
  const now = new Date();
  let label: string;
  let cls: string;
  if (record.openFrom && now < record.openFrom) {
    label = "Upcoming"; cls = "text-yellow-600";
  } else if (record.openUntil && now > record.openUntil) {
    label = "Closed"; cls = "text-muted-foreground";
  } else {
    label = "Open"; cls = "text-green-600";
  }
  return (
    <p className="text-sm font-medium">
      Status: <span className={cls}>{label}</span>
    </p>
  );
}

function CertApplicationForm({
  existing,
  onSuccess,
}: {
  existing: CertApplication | null;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationFn: (payload: Parameters<typeof saveCertApplication>[0]) =>
      saveCertApplication(payload, existing?.id),
    meta: { successMessage: existing ? "Saved" : "Created" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certApplicationKeys.all });
      onSuccess();
    },
  });

  const form = useForm({
    defaultValues: {
      formUrl: existing?.formUrl ?? "",
      openFrom: existing?.openFrom ?? null as Date | null,
      openUntil: existing?.openUntil ?? null as Date | null,
      closedMessage: existing?.closedMessage ?? "",
    },
    onSubmit: async ({ value }) => {
      await mutateAsync({
        formUrl: value.formUrl,
        openFrom: value.openFrom?.toISOString() ?? null,
        openUntil: value.openUntil?.toISOString() ?? null,
        closedMessage: value.closedMessage || null,
      });
    },
  });

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}
      className="space-y-5 rounded-lg border bg-card p-6 shadow-sm"
    >
      {/* Form URL */}
      <form.Field
        name="formUrl"
        validators={{
          onChange: ({ value }) => {
            const r = z.string().url("Must be a valid URL").safeParse(value);
            return r.success ? undefined : r.error.issues[0].message;
          },
        }}
        children={(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.name}>Google Form URL</Label>
            <Input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="https://forms.google.com/..."
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-destructive">
                {field.state.meta.errors.map((e) => typeof e === "string" ? e : (e as any).message).join(", ")}
              </p>
            )}
          </div>
        )}
      />

      {/* Date range */}
      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="openFrom"
          children={(field) => (
            <div className="space-y-1.5">
              <Label>Applications Open</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !field.state.value && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {field.state.value ? format(field.state.value, "PP") : "No date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.state.value ?? undefined} onSelect={(d) => field.handleChange(d ?? null)} autoFocus />
                  {field.state.value && (
                    <div className="p-2 border-t">
                      <Button type="button" variant="ghost" size="sm" className="w-full" onClick={() => field.handleChange(null)}>
                        Clear
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          )}
        />

        <form.Field
          name="openUntil"
          children={(field) => (
            <div className="space-y-1.5">
              <Label>Applications Close</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !field.state.value && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {field.state.value ? format(field.state.value, "PP") : "No date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.state.value ?? undefined} onSelect={(d) => field.handleChange(d ?? null)} autoFocus />
                  {field.state.value && (
                    <div className="p-2 border-t">
                      <Button type="button" variant="ghost" size="sm" className="w-full" onClick={() => field.handleChange(null)}>
                        Clear
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          )}
        />
      </div>

      {/* Closed message */}
      <form.Field
        name="closedMessage"
        children={(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.name}>
              Closed message <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder='Leave blank to show "Check back later for certification applications."'
              rows={2}
            />
          </div>
        )}
      />

      <form.Subscribe
        selector={(s) => [s.canSubmit, s.isSubmitting] as const}
        children={([canSubmit, isSubmitting]) => (
          <Button type="submit" disabled={!canSubmit} className="w-full rounded">
            {isSubmitting ? <><Spinner /> Saving...</> : existing ? "Save Changes" : "Create"}
          </Button>
        )}
      />
    </form>
  );
}

function LoadingSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button type="button" variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="size-5" />
        </Button>
        <Skeleton className="h-8 w-56" />
      </div>
      <div className="rounded-lg border p-6 space-y-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
        </div>
      </div>
    </div>
  );
}
