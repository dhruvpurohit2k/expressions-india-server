import type { ColumnDef } from "@tanstack/react-table";
import type { PodcastListItem } from "./types";
import { Link } from "@tanstack/react-router";

export const PodcastColumns: ColumnDef<PodcastListItem>[] = [
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
    accessorKey: "createdAt",
    header: "Created At",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Link
          to="/admin/podcast/$id"
          params={{ id: row.original.id }}
          className="text-lg underline text-blue-200 hover:text-blue-600"
        >
          View
        </Link>
      );
    },
  },
];
