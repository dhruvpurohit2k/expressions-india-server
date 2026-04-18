import { createFileRoute } from "@tanstack/react-router";
import { CourseForm } from "./_formLayout";

export const Route = createFileRoute("/admin/course/create")({
  component: () => <CourseForm />,
});
