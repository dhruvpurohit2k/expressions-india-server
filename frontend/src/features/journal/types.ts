import { z } from "zod";

export const JournalListItemSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  startMonth: z.string(),
  endMonth: z.string(),
  volume: z.number(),
  issue: z.number(),
  year: z.number(),
});
export type JournalListItem = z.infer<typeof JournalListItemSchema>;

export const MediaSchema = z.object({
  id: z.uuid(),
  fileType: z.string(),
  url: z.string(),
  name: z.string(),
});
export type Media = z.infer<typeof MediaSchema>;
export const AuthorSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});
export type Author = z.infer<typeof AuthorSchema>;
export const JournalChapterSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string().nullable(),
  media: MediaSchema,
  authors: z.array(AuthorSchema),
});
export type JournalChapter = z.infer<typeof JournalChapterSchema>;

export const JournalSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string().nullable(),
  startMonth: z.string(),
  endMonth: z.string(),
  year: z.number(),
  volume: z.number(),
  issue: z.number(),
  media: MediaSchema,
  chapters: z.array(JournalChapterSchema),
});

export type Journal = z.infer<typeof JournalSchema>;
