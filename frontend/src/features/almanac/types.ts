import { z } from "zod";

const MediaSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  fileType: z.string().optional(),
});

export const AlmanacListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  thumbnailUrl: z.string().nullable().optional(),
  pdfUrl: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
});

export const AlmanacSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  thumbnail: MediaSchema.nullable().optional(),
  pdf: MediaSchema.nullable().optional(),
  createdAt: z.coerce.date(),
});

export const AlmanacListSchema = z.array(AlmanacListItemSchema);

export type AlmanacListItem = z.infer<typeof AlmanacListItemSchema>;
export type Almanac = z.infer<typeof AlmanacSchema>;
