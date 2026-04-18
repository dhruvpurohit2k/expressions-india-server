import { createFileRoute } from "@tanstack/react-router";
import { useArticleQuery } from "#/features/article/hooks/useArticleQuery";
import { ArticleForm } from "../_formLayout";
import { H1 } from "#/components/ui/typographyh1";

export const Route = createFileRoute("/admin/article/edit/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: article, isLoading } = useArticleQuery(id);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading article...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex h-64 items-center justify-center">
        <H1>Article not found</H1>
      </div>
    );
  }

  return <ArticleForm article={article} />;
}
