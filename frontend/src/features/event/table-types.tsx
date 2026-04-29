import { type ColumnDef } from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import type { EventListData } from "./types";
import { format } from "date-fns";

export const EventColumns: ColumnDef<EventListData>[] = [
  {
    id: "sno",
    header: "S.No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "title",
    header: "Event Title",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original.status;
      const colours: Record<string, string> = {
        upcoming: "bg-blue-50 text-blue-700",
        completed: "bg-green-50 text-green-700",
        cancelled: "bg-red-50 text-red-700",
      };
      return (
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${colours[s] ?? "bg-muted text-muted-foreground"}`}>
          {s || "—"}
        </span>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => row.original.startDate ? format(row.original.startDate, "PPP") : "—",
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
      if (!row.original.endDate) return null;
      return format(row.original.endDate, "PPP");
    },
  },
  {
    accessorKey: "isOnline",
    header: "Is Online",
  },
  {
    accessorKey: "isPaid",
    header: "Is Paid",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Link
          to="/admin/event/$id"
          params={{ id: row.original.id }}
          className="text-lg underline text-blue-200 hover:text-blue-600"
        >
          View
        </Link>
      );
    },
  },
];
