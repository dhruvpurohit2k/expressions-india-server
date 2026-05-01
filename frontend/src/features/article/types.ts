import { z } from "zod";

export const ArticleListItemSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  author: z.string().nullable().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  publishedAt: z.coerce.date(),
});
export type ArticleListItem = z.infer<typeof ArticleListItemSchema>;

const MediaSchema = z.object({
  id: z.uuid(),
  url: z.string(),
  name: z.string(),
  fileType: z.string(),
});

export const ArticleSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  content: z.string(),
  author: z.string().nullable().optional(),
  audience: z.array(z.object({ name: z.string() })).default([]),
  medias: z.array(MediaSchema).default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type ArticleData = z.infer<typeof ArticleSchema>;
