import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import { H1 } from "#/components/ui/typographyh1";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { Skeleton } from "#/components/ui/skeleton";
import DataTable from "#/components/data-table";

import { useCourseListQuery } from "#/features/course/hooks/useCourseListQuery";
import { CourseColumns } from "#/features/course/table-types";
import { INDIVIDUAL_AUDIENCES, AUDIENCE_LABELS } from "#/features/event/types";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/admin/course/")({
  component: RouteComponent,
});

const PAGE_SIZE = 15;

const SORT_FIELD_OPTIONS = [
  { value: "createdAt", label: "Created" },
  { value: "updatedAt", label: "Updated" },
];

const SORT_DIR_OPTIONS = [
  { value: "desc", label: "Newest first" },
  { value: "asc", label: "Oldest first" },
];

function RouteComponent() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedAudiences, setSelectedAudiences] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<"createdAt" | "updatedAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setDebouncedSearch(val);
    setPage(1);
  }, 350);

  const handleSearch = (val: string) => {
    setSearch(val);
    debouncedSetSearch(val);
  };

  const toggleAudience = (key: string) => {
    setSelectedAudiences((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedAudiences(new Set());
    setSortField("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const audiencesParam = selectedAudiences.size > 0
    ? Array.from(selectedAudiences).join(",")
    : undefined;

  const { data, isLoading, error } = useCourseListQuery({
    search: debouncedSearch || undefined,
    audiences: audiencesParam,
    sortField,
    sortOrder,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const courses = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 0;
  const total = data?.meta.total ?? 0;

  const hasActiveFilters =
    !!debouncedSearch || selectedAudiences.size > 0 || sortField !== "createdAt" || sortOrder !== "desc";

  return (
    <>
      <div className="flex px-2 lg:px-10 items-center gap-2">
        <H1>Courses</H1>
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            className="rounded shadow font-semibold"
            onClick={() => navigate({ to: "/admin/certificate-application" })}
          >
            Certificate Application
          </Button>
          <Button
            variant="default"
            className="rounded shadow font-semibold"
            onClick={() => navigate({ to: "/admin/course/create" })}
          >
            <Plus strokeWidth={2} className="size-4" />
            New Course
          </Button>
        </div>
      </div>

      <div className="px-2 lg:px-10 space-y-4">
        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Search by title…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-56"
          />

          <Select
            value={sortField}
            onValueChange={(v) => { setSortField(v as "createdAt" | "updatedAt"); setPage(1); }}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_FIELD_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortOrder}
            onValueChange={(v) => { setSortOrder(v as "asc" | "desc"); setPage(1); }}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_DIR_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1.5 text-muted-foreground">
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
          )}

          {!isLoading && (
            <span className="ml-auto text-sm text-muted-foreground">
              {total} course{total !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Audience filter chips */}
        <div className="flex flex-wrap gap-2">
          {INDIVIDUAL_AUDIENCES.map((key) => {
            const active = selectedAudiences.has(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleAudience(key)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50",
                )}
              >
                {AUDIENCE_LABELS[key]}
              </button>
            );
          })}
        </div>

        {/* Table */}
        {isLoading ? (
          <LoadingDataTable />
        ) : error ? (
          <p className="text-destructive text-sm">Could not load courses.</p>
        ) : (
          <DataTable
            columns={CourseColumns}
            data={courses}
            pagination={{ page, totalPages, onPageChange: setPage }}
          />
        )}
      </div>
    </>
  );
}

function LoadingDataTable() {
  return (
    <div className="rounded border mt-4">
      <div className="border-b px-4 py-3 flex gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20 ml-auto" />
      </div>
      <div className="divide-y">
        {Array.from({ length: 8 }).map((_, i) => (
          <div className="flex gap-4 px-4 py-4" key={i}>
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
