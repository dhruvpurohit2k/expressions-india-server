import { z } from "zod";

export const PodcastListItemSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  createdAt: z.coerce.date(),
});

export type PodcastListItem = z.infer<typeof PodcastListItemSchema>;

export const PodcastSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  link: z.url(),
  description: z.string().nullable(),
  tags: z.string(),
  transcript: z.string().nullable(),
  audiences: z.array(z.string()),
});

export type Podcast = z.infer<typeof PodcastSchema>;
