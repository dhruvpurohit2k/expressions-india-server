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

import { useArticleListQuery } from "#/features/article/hooks/useArticleListQuery";
import { ArticleColumns } from "#/features/article/table-types";

export const Route = createFileRoute("/admin/article/")({
  component: RouteComponent,
});

const PAGE_SIZE = 15;

const SORT_OPTIONS = [
  { value: "desc", label: "Newest first" },
  { value: "asc", label: "Oldest first" },
];

function RouteComponent() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [debouncedCategory, setDebouncedCategory] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setDebouncedSearch(val);
    setPage(1);
  }, 350);

  const debouncedSetCategory = useDebouncedCallback((val: string) => {
    setDebouncedCategory(val);
    setPage(1);
  }, 350);

  const handleSearch = (val: string) => {
    setSearch(val);
    debouncedSetSearch(val);
  };

  const handleCategory = (val: string) => {
    setCategory(val);
    debouncedSetCategory(val);
  };

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategory("");
    setDebouncedCategory("");
    setSortOrder("desc");
    setPage(1);
  };

  const { data, isLoading, error } = useArticleListQuery({
    search: debouncedSearch || undefined,
    category: debouncedCategory || undefined,
    sortOrder,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const articles = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 0;
  const total = data?.meta.total ?? 0;

  const hasActiveFilters = !!debouncedSearch || !!debouncedCategory || sortOrder !== "desc";

  return (
    <>
      <div className="flex px-2 lg:px-10 items-center">
        <H1>Articles</H1>
        <Button
          variant="default"
          className="ml-auto rounded shadow font-semibold"
          onClick={() => navigate({ to: "/admin/article/create" })}
        >
          <Plus strokeWidth={2} className="size-4" />
          New Article
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
            placeholder="Filter by category…"
            value={category}
            onChange={(e) => handleCategory(e.target.value)}
            className="w-48"
          />

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

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1.5 text-muted-foreground">
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
          )}

          {!isLoading && (
            <span className="ml-auto text-sm text-muted-foreground">
              {total} article{total !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <LoadingDataTable />
        ) : error ? (
          <p className="text-destructive text-sm">Could not load articles.</p>
        ) : (
          <DataTable
            columns={ArticleColumns}
            data={articles}
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
