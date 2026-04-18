import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, X } from "lucide-react";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { Spinner } from "#/components/ui/spinner";
import { saveTeam } from "#/features/team/api/saveTeam";
import { teamKeys } from "#/lib/query-keys";
import type { Team } from "#/features/team/types";

export const Route = createFileRoute("/admin/team/_formLayout")({
  component: () => <></>,
});

type PositionEntry = {
  id?: string;
  position: string;
  holders: string[];
};

function emptyPosition(): PositionEntry {
  return { position: "", holders: [""] };
}

export function TeamForm({ team }: { team?: Team }) {
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationFn: (payload: Parameters<typeof saveTeam>[0]) =>
      saveTeam(payload, team?.id),
    meta: { successMessage: "Team saved" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });

  const existingPositions: PositionEntry[] = (team?.members ?? []).map((m) => ({
    id: m.id,
    position: m.position,
    holders: m.holders.length ? m.holders : [""],
  }));

  const form = useForm({
    defaultValues: {
      description: team?.description ?? "",
      positions: existingPositions.length ? existingPositions : [emptyPosition()],
    },
    onSubmit: async ({ value }) => {
      await mutateAsync({
        description: value.description,
        members: value.positions.map((p) => ({
          position: p.position,
          holders: p.holders.filter((h) => h.trim() !== ""),
        })),
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      {/* ── Description ── */}
      <div className="space-y-4 rounded border bg-card p-6 shadow-sm">
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
                placeholder="Describe the team's role..."
                rows={3}
              />
            </div>
          )}
        />
      </div>

      {/* ── Positions ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Positions</h2>
          <form.Field
            name="positions"
            children={(field) => (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  field.handleChange([...field.state.value, emptyPosition()])
                }
              >
                <Plus className="mr-1.5 size-3.5" />
                Add Position
              </Button>
            )}
          />
        </div>

        <form.Field
          name="positions"
          children={(field) =>
            field.state.value.length === 0 ? (
              <div className="rounded border border-dashed p-8 text-center text-sm text-muted-foreground">
                No positions yet. Click "Add Position" to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {field.state.value.map((pos, index) => (
                  <PositionCard
                    key={index}
                    position={pos}
                    index={index}
                    onChange={(updated) => {
                      const next = [...field.state.value];
                      next[index] = updated;
                      field.handleChange(next);
                    }}
                    onRemove={() =>
                      field.handleChange(
                        field.state.value.filter((_, i) => i !== index),
                      )
                    }
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
          <Button type="submit" disabled={!canSubmit} className="w-full rounded">
            {isSubmitting ? (
              <>
                <Spinner />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        )}
      />
    </form>
  );
}

// ── Position Card ─────────────────────────────────────────────────────────────

function PositionCard({
  position,
  index,
  onChange,
  onRemove,
}: {
  position: PositionEntry;
  index: number;
  onChange: (updated: PositionEntry) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b px-4 py-2.5">
        <span className="text-sm font-medium text-muted-foreground">
          Position {index + 1}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="ml-auto size-7 text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="space-y-4 p-4">
        <div className="space-y-1.5">
          <Label>Position Title</Label>
          <Input
            value={position.position}
            onChange={(e) => onChange({ ...position, position: e.target.value })}
            placeholder="e.g. Program Director"
          />
        </div>

        <div className="space-y-2">
          <Label>People</Label>
          {position.holders.map((holder, hi) => (
            <div key={hi} className="flex items-center gap-2">
              <Input
                value={holder}
                onChange={(e) => {
                  const next = [...position.holders];
                  next[hi] = e.target.value;
                  onChange({ ...position, holders: next });
                }}
                placeholder="Full name"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                disabled={position.holders.length === 1}
                onClick={() =>
                  onChange({
                    ...position,
                    holders: position.holders.filter((_, i) => i !== hi),
                  })
                }
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() =>
              onChange({ ...position, holders: [...position.holders, ""] })
            }
          >
            <Plus className="mr-1.5 size-3.5" />
            Add Person
          </Button>
        </div>
      </div>
    </div>
  );
}
