import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import { H1 } from "#/components/ui/typographyh1";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Skeleton } from "#/components/ui/skeleton";
import DataTable from "#/components/data-table";
import { useEnquiryListQuery } from "#/features/enquiry/hooks/useEnquiryListQuery";
import { EnquiryColumns } from "#/features/enquiry/table-types";

export const Route = createFileRoute("/admin/enquiry/")({
  component: RouteComponent,
});

const PAGE_SIZE = 15;

function RouteComponent() {
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [debouncedName, setDebouncedName] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useState("");
  const [debouncedPhone, setDebouncedPhone] = useState("");

  const debouncedSetName = useDebouncedCallback((v: string) => { setDebouncedName(v); setPage(1); }, 350);
  const debouncedSetEmail = useDebouncedCallback((v: string) => { setDebouncedEmail(v); setPage(1); }, 350);
  const debouncedSetPhone = useDebouncedCallback((v: string) => { setDebouncedPhone(v); setPage(1); }, 350);

  const handleName = (v: string) => { setName(v); debouncedSetName(v); };
  const handleEmail = (v: string) => { setEmail(v); debouncedSetEmail(v); };
  const handlePhone = (v: string) => { setPhone(v); debouncedSetPhone(v); };

  const resetFilters = () => {
    setName(""); setDebouncedName("");
    setEmail(""); setDebouncedEmail("");
    setPhone(""); setDebouncedPhone("");
    setPage(1);
  };

  const { data, isLoading, error } = useEnquiryListQuery({
    name: debouncedName || undefined,
    email: debouncedEmail || undefined,
    phone: debouncedPhone || undefined,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const enquiries = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 0;
  const total = data?.meta.total ?? 0;
  const hasActiveFilters = !!debouncedName || !!debouncedEmail || !!debouncedPhone;

  return (
    <>
      <div className="flex px-2 lg:px-10 items-center">
        <H1>Enquiries</H1>
      </div>

      <div className="px-2 lg:px-10 space-y-4">
        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Filter by name…"
            value={name}
            onChange={(e) => handleName(e.target.value)}
            className="w-44"
          />
          <Input
            placeholder="Filter by email…"
            value={email}
            onChange={(e) => handleEmail(e.target.value)}
            className="w-48"
          />
          <Input
            placeholder="Filter by phone…"
            value={phone}
            onChange={(e) => handlePhone(e.target.value)}
            className="w-40"
          />
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1.5 text-muted-foreground">
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
          )}
          {!isLoading && (
            <span className="ml-auto text-sm text-muted-foreground">
              {total} enquir{total !== 1 ? "ies" : "y"}
            </span>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <LoadingDataTable />
        ) : error ? (
          <p className="text-destructive text-sm">Could not load enquiries.</p>
        ) : (
          <DataTable
            columns={EnquiryColumns}
            data={enquiries}
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
