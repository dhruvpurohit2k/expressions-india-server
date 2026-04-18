import { createFileRoute } from "@tanstack/react-router";
import { ArticleForm } from "./_formLayout";

export const Route = createFileRoute("/admin/article/create")({
  component: () => <ArticleForm />,
});
