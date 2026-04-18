import { type ColumnDef } from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import type { ArticleListItem } from "./types";
import { format } from "date-fns";

export const ArticleColumns: ColumnDef<ArticleListItem>[] = [
  {
    id: "sno",
    header: "S.No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "publishedAt",
    header: "Published At",
    cell: ({ row }) => format(row.original.publishedAt, "dd MMM yyyy"),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link
        to="/admin/article/$id"
        params={{ id: row.original.id }}
        className="text-sm underline text-blue-200 hover:text-blue-600"
      >
        View
      </Link>
    ),
  },
];
