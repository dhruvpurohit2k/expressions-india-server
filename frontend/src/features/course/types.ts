import { z } from "zod";

export const CourseListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  thumbnailUrl: z.string().nullable().optional(),
  audiences: z.array(z.string()),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type CourseListItem = z.infer<typeof CourseListItemSchema>;

const CourseMediaSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  fileType: z.string(),
});

const CourseChapterSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullish().transform((v) => v ?? ""),
  videoLinkUrl: z.string().nullish().transform((v) => v ?? ""),
  isFree: z.boolean(),
  downloadableContent: z.array(CourseMediaSchema).nullish().transform((v) => v ?? []),
});

export const CourseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  thumbnail: CourseMediaSchema.nullable().optional(),
  introductionVideoUrl: z.string().default(""),
  registrationUrl: z.string().nullable().optional(),
  downloadableContent: z.array(CourseMediaSchema).nullish().transform((v) => v ?? []),
  audiences: z.array(z.string()).nullish().transform((v) => v ?? []),
  chapters: z.array(CourseChapterSchema).nullish().transform((v) => v ?? []),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// ChapterDetailSchema matches CourseChapterDTO from the chapter endpoint
export const ChapterDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().default(""),
  videoLinkUrl: z.string().default(""),
  isFree: z.boolean(),
  downloadableContent: z.array(CourseMediaSchema).nullish().transform((v) => v ?? []),
});

export type CourseMedia = z.infer<typeof CourseMediaSchema>;
export type CourseChapter = z.infer<typeof CourseChapterSchema>;
export type CourseData = z.infer<typeof CourseSchema>;
export type ChapterDetail = z.infer<typeof ChapterDetailSchema>;
