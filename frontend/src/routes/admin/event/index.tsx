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
import { H1 } from "#/components/ui/typographyh1";
import { useEventListQuery } from "#/features/event/hooks/useEventListQuery";
import { EventColumns } from "#/features/event/table-types";
import DataTable from "#/components/data-table";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, RotateCcw } from "lucide-react";
import { useState, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";

export const Route = createFileRoute("/admin/event/")({
  component: RouteComponent,
});

const PAGE_SIZE = 15;

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const SORT_OPTIONS = [
  { value: "desc", label: "Newest first" },
  { value: "asc", label: "Oldest first" },
];

function RouteComponent() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [online, setOnline] = useState<boolean | null>(null);
  const [paid, setPaid] = useState<boolean | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setDebouncedSearch(val);
    setPage(1);
  }, 350);

  const handleSearch = (val: string) => {
    setSearch(val);
    debouncedSetSearch(val);
  };

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("");
    setOnline(null);
    setPaid(null);
    setSortOrder("desc");
    setPage(1);
  };

  const { data, isLoading, error } = useEventListQuery({
    search: debouncedSearch || undefined,
    status: status || undefined,
    online,
    paid,
    sortOrder,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const events = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 0;
  const total = data?.meta.total ?? 0;

  const hasActiveFilters =
    !!debouncedSearch || !!status || online != null || paid != null || sortOrder !== "desc";

  return (
    <>
      <div className="flex px-2 lg:px-10 items-center">
        <H1>Events</H1>
        <Button
          variant="default"
          className="ml-auto rounded shadow font-semibold"
          onClick={() => navigate({ to: "/admin/event/create" })}
        >
          <Plus strokeWidth={2} className="size-4" />
          Create Event
        </Button>
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
            value={status || "__all__"}
            onValueChange={(v) => { setStatus(v === "__all__" ? "" : v); setPage(1); }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value || "__all__"} value={o.value || "__all__"}>
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
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Online toggle */}
          <div className="flex rounded-md border overflow-hidden text-sm">
            {[
              { label: "Any mode", value: null },
              { label: "Online", value: true },
              { label: "In-person", value: false },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => { setOnline(opt.value); setPage(1); }}
                className={`px-3 py-1.5 transition-colors cursor-pointer ${
                  online === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Paid toggle */}
          <div className="flex rounded-md border overflow-hidden text-sm">
            {[
              { label: "Any fee", value: null },
              { label: "Paid", value: true },
              { label: "Free", value: false },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => { setPaid(opt.value); setPage(1); }}
                className={`px-3 py-1.5 transition-colors cursor-pointer ${
                  paid === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1.5 text-muted-foreground">
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
          )}

          {!isLoading && (
            <span className="ml-auto text-sm text-muted-foreground">
              {total} event{total !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <LoadingDataTable />
        ) : error ? (
          <p className="text-destructive text-sm">Could not load events.</p>
        ) : (
          <DataTable
            columns={EventColumns}
            data={events}
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
