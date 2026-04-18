import { z } from "zod";

const MediaSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  fileType: z.string().optional(),
});

export const BrochureListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  thumbnailUrl: z.string().nullable().optional(),
  pdfUrl: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
});

export const BrochureSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  thumbnail: MediaSchema.nullable().optional(),
  pdf: MediaSchema.nullable().optional(),
  createdAt: z.coerce.date(),
});

export const BrochureListSchema = z.array(BrochureListItemSchema);

export type BrochureListItem = z.infer<typeof BrochureListItemSchema>;
export type Brochure = z.infer<typeof BrochureSchema>;
