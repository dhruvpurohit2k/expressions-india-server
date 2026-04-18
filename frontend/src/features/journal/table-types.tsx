import { type ColumnDef } from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import type { JournalListItem } from "./types";

export const JournalColumns: ColumnDef<JournalListItem>[] = [
  {
    id: "sno",
    header: "S.No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "title",
    header: " Title",
  },
  {
    accessorKey: "volume",
    header: "Volume",
  },
  {
    accessorKey: "issue",
    header: "Issue",
  },
  {
    accessorKey: "startMonth",
    header: "From the Month",
  },
  {
    accessorKey: "endMonth",
    header: "To the Month",
  },
  {
    accessorKey: "year",
    header: "Year",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Link
          to="/admin/journal/$id"
          params={{ id: row.original.id }}
          className="text-lg underline text-blue-200 hover:text-blue-600"
        >
          View
        </Link>
      );
    },
  },
];
