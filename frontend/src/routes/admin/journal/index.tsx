import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, RotateCcw } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import { H1 } from "#/components/ui/typographyh1";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Skeleton } from "#/components/ui/skeleton";
import DataTable from "#/components/data-table";
import { useJournalListQuery } from "#/features/journal/hooks/useJournalListQuery";
import { JournalColumns } from "#/features/journal/table-types";

export const Route = createFileRoute("/admin/journal/")({
  component: RouteComponent,
});

const PAGE_SIZE = 15;

function RouteComponent() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [yearInput, setYearInput] = useState("");
  const [year, setYear] = useState<number | undefined>(undefined);

  const debouncedSetSearch = useDebouncedCallback((v: string) => { setDebouncedSearch(v); setPage(1); }, 350);

  const handleSearch = (v: string) => { setSearch(v); debouncedSetSearch(v); };

  const handleYear = (v: string) => {
    setYearInput(v);
    const n = parseInt(v, 10);
    setYear(v === "" || isNaN(n) ? undefined : n);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch(""); setDebouncedSearch("");
    setYearInput(""); setYear(undefined);
    setPage(1);
  };

  const { data, isLoading, error } = useJournalListQuery({
    search: debouncedSearch || undefined,
    year,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const journals = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 0;
  const total = data?.meta.total ?? 0;
  const hasActiveFilters = !!debouncedSearch || !!year;

  return (
    <>
      <div className="flex px-2 lg:px-10 items-center">
        <H1>Journals</H1>
        <Button
          className="ml-auto lg:text-md rounded text-sm lg:p-5"
          onClick={() => navigate({ to: "/admin/journal/create" })}
        >
          <Plus strokeWidth={2} className="lg:size-5! size-4!" />
          Add Journal
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
          <Input
            placeholder="Filter by year…"
            value={yearInput}
            onChange={(e) => handleYear(e.target.value)}
            className="w-36"
            type="number"
            min={1900}
            max={2100}
          />
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1.5 text-muted-foreground">
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
          )}
          {!isLoading && (
            <span className="ml-auto text-sm text-muted-foreground">
              {total} journal{total !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <LoadingDataTable />
        ) : error ? (
          <div className="py-10 text-center text-muted-foreground">
            Could not load journals.
          </div>
        ) : (
          <DataTable
            columns={JournalColumns}
            data={journals}
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
