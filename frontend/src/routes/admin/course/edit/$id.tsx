import { createFileRoute } from "@tanstack/react-router";
import { useCourseQuery } from "#/features/course/hooks/useCourseQuery";
import { CourseForm } from "../_formLayout";
import { H1 } from "#/components/ui/typographyh1";

export const Route = createFileRoute("/admin/course/edit/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: course, isLoading } = useCourseQuery(id);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-64 items-center justify-center">
        <H1>Course not found</H1>
      </div>
    );
  }

  return <CourseForm course={course} />;
}
