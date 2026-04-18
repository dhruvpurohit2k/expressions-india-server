import { type ColumnDef } from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import type { EnquiryListItem } from "./types";
import { format } from "date-fns";

export const EnquiryColumns: ColumnDef<EnquiryListItem>[] = [
  {
    id: "sno",
    header: "S.No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "subject",
    header: "Subject",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return format(row.original.createdAt, "dd-MM-yy, hh : mm");
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Link
          to="/admin/enquiry/$id"
          params={{ id: row.original.id }}
          className="text-lg underline text-blue-200 hover:text-blue-600"
        >
          View
        </Link>
      );
    },
  },
];
