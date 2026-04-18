import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEnquiryQuery } from "#/features/enquiry/hooks/useEnquiryQuery";
import { H1 } from "#/components/ui/typographyh1";
import { Button } from "#/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "#/components/ui/alert-dialog";
import { ArrowLeft, Mail, Phone, Trash2 } from "lucide-react";
import { cn } from "#/lib/utils";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enquiryKeys } from "#/lib/query-keys";
import { apiFetch, ApiError, parseMutationResponse } from "#/lib/api";

export const Route = createFileRoute("/admin/enquiry/$id")({
  component: RouteComponent,
});

function InfoCard({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border bg-card p-4 shadow-sm", className)}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: enquiry, isLoading, error } = useEnquiryQuery(id);

  const { mutate: deleteEnquiry, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const response = await apiFetch(
        `${import.meta.env.VITE_SERVER_URL}/admin/enquiry/${id}`,
        { method: "DELETE" },
      );
      await parseMutationResponse(response);
    },
    meta: { successMessage: "Enquiry deleted" },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enquiryKeys.all });
      navigate({ to: "/admin/enquiry" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading enquiry...</p>
      </div>
    );
  }

  if (error || !enquiry) {
    const is404 = error instanceof ApiError && error.status === 404;
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">
          {is404 ? "Enquiry not found." : (error?.message ?? "Something went wrong.")}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/admin/enquiry" })}
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Back to Enquiries
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/admin/enquiry" })}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <H1>{enquiry.name}</H1>
            <p className="text-sm text-muted-foreground">
              Received {format(enquiry.createdAt, "PPP 'at' p")}
            </p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDeleting}>
              <Trash2 className="mr-1.5 size-3.5" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete enquiry?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the enquiry from {enquiry.name}.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteEnquiry()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-4 lg:col-span-2">
          <InfoCard label="Subject">
            <p className="font-medium">{enquiry.subject}</p>
          </InfoCard>

          <InfoCard label="Message">
            <p className="whitespace-pre-wrap leading-relaxed">
              {enquiry.message}
            </p>
          </InfoCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <InfoCard label="Designation">
            <p>{enquiry.designation}</p>
          </InfoCard>

          <InfoCard label="Contact">
            <div className="space-y-2">
              <a
                href={`mailto:${enquiry.email}`}
                className="flex items-center gap-2 text-primary underline underline-offset-4 hover:text-primary/80"
              >
                <Mail className="size-4 shrink-0" />
                {enquiry.email}
              </a>
              <a
                href={`tel:${enquiry.phone}`}
                className="flex items-center gap-2 hover:text-primary"
              >
                <Phone className="size-4 shrink-0" />
                {enquiry.phone}
              </a>
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}
