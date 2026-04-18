import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "#/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination?: PaginationProps;
}

/** Returns the page numbers to display, with -1 representing an ellipsis gap. */
function buildPageWindow(page: number, totalPages: number): number[] {
  const delta = 2;
  const keep = new Set<number>();
  keep.add(1);
  keep.add(totalPages);
  for (let i = page - delta; i <= page + delta; i++) {
    if (i >= 1 && i <= totalPages) keep.add(i);
  }

  const sorted = Array.from(keep).sort((a, b) => a - b);
  const result: number[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push(-1);
    result.push(sorted[i]);
  }
  return result;
}

export default function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const showPagination = pagination && pagination.totalPages > 1;

  return (
    <div>
      <Table className="mt-10">
        <TableHeader className="">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-red rounded">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="lg:text-xl text-xs text-white"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="bg-white"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="text-xs lg:text-lg text-neutral-600 h-auto whitespace-normal align-top"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {showPagination && (
        <div className="flex items-center justify-center gap-1 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => pagination.onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="size-4" />
          </Button>

          {buildPageWindow(pagination.page, pagination.totalPages).map(
            (p, i) =>
              p === -1 ? (
                <span
                  key={`ellipsis-${i}`}
                  className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground select-none"
                >
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === pagination.page ? "default" : "outline"}
                  size="sm"
                  onClick={() => pagination.onPageChange(p)}
                  className={cn(
                    "h-8 w-8 p-0 text-sm",
                    p === pagination.page && "pointer-events-none",
                  )}
                >
                  {p}
                </Button>
              ),
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => pagination.onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
