import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { ArrowLeft, Search, UserCheck, UserMinus, UserPlus, X } from "lucide-react";

import { H1 } from "#/components/ui/typographyh1";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Skeleton } from "#/components/ui/skeleton";
import { useEnrolledUsersQuery } from "#/features/course/hooks/useEnrolledUsersQuery";
import { useNotEnrolledUsersQuery } from "#/features/course/hooks/useNotEnrolledUsersQuery";
import { useEnrollUser, useRevokeAccess } from "#/features/course/hooks/useEnrollmentMutations";
import type { EnrolledUser } from "#/features/course/types/enrollment";

export const Route = createFileRoute("/admin/course/enrollment/$id")({
  component: RouteComponent,
});

const PAGE_SIZE = 10;

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/admin/course/$id", params: { id } })}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <H1>Manage Enrollment</H1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <EnrolledPanel courseId={id} />
        <GrantAccessPanel courseId={id} />
      </div>
    </div>
  );
}

// ── Enrolled Users Panel ──────────────────────────────────────────────────────

function EnrolledPanel({ courseId }: { courseId: string }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setDebouncedSearch(val);
    setPage(1);
  }, 350);

  const { data, isLoading } = useEnrolledUsersQuery(courseId, {
    search: debouncedSearch || undefined,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const { mutate: revoke, isPending: isRevoking } = useRevokeAccess(courseId);

  const users = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 0;
  const total = data?.meta.total ?? 0;

  return (
    <Panel
      title="Enrolled"
      icon={<UserCheck className="size-4 text-green-600" />}
      count={total}
      search={search}
      onSearch={(v) => { setSearch(v); debouncedSetSearch(v); }}
      isLoading={isLoading}
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
    >
      {users.length === 0 ? (
        <EmptyState text="No enrolled users" />
      ) : (
        users.map((user) => (
          <UserRow key={user.id} user={user}>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-destructive hover:text-destructive"
              disabled={isRevoking}
              onClick={() => revoke(user.id)}
            >
              <UserMinus className="mr-1.5 size-3.5" />
              Revoke
            </Button>
          </UserRow>
        ))
      )}
    </Panel>
  );
}

// ── Grant Access Panel ────────────────────────────────────────────────────────

function GrantAccessPanel({ courseId }: { courseId: string }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setDebouncedSearch(val);
    setPage(1);
  }, 350);

  const { data, isLoading } = useNotEnrolledUsersQuery(courseId, {
    search: debouncedSearch || undefined,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const { mutate: grant, isPending: isGranting } = useEnrollUser(courseId);

  const users = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 0;
  const total = data?.meta.total ?? 0;

  return (
    <Panel
      title="Grant Access"
      icon={<UserPlus className="size-4 text-primary" />}
      count={total}
      search={search}
      onSearch={(v) => { setSearch(v); debouncedSetSearch(v); }}
      isLoading={isLoading}
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
    >
      {users.length === 0 ? (
        <EmptyState text="No users available" />
      ) : (
        users.map((user) => (
          <UserRow key={user.id} user={user}>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-primary hover:text-primary"
              disabled={isGranting}
              onClick={() => grant(user.id)}
            >
              <UserPlus className="mr-1.5 size-3.5" />
              Grant
            </Button>
          </UserRow>
        ))
      )}
    </Panel>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function Panel({
  title,
  icon,
  count,
  search,
  onSearch,
  isLoading,
  page,
  totalPages,
  onPageChange,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  search: string;
  onSearch: (v: string) => void;
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-lg border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        {icon}
        <span className="font-semibold">{title}</span>
        <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {count}
        </span>
      </div>

      <div className="border-b px-4 py-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by name, email or phone…"
            className="pl-8 pr-8"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 divide-y overflow-auto">
        {isLoading ? <UserListSkeleton /> : children}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-2.5">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function UserRow({ user, children }: { user: EnrolledUser; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {user.name || <span className="italic text-muted-foreground">No name</span>}
        </p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        {user.phone && <p className="truncate text-xs text-muted-foreground">{user.phone}</p>}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function UserListSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </>
  );
}
