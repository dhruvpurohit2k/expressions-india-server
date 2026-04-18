import { type ColumnDef } from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import type { CourseListItem } from "./types";
import { format } from "date-fns";

export const CourseColumns: ColumnDef<CourseListItem>[] = [
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
    accessorKey: "audiences",
    header: "Audiences",
    cell: ({ row }) => {
      return row.original.audiences.join(", ");
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return format(row.original.createdAt, "dd-MM-yy, hh : mm");
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ row }) => {
      return format(row.original.updatedAt, "dd-MM-yy, hh : mm");
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Link
          to="/admin/course/$id"
          params={{ id: row.original.id }}
          className="text-lg underline text-blue-200 hover:text-blue-600"
        >
          View
        </Link>
      );
    },
  },
];
