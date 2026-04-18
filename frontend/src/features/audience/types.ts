import { z } from "zod";

export const AudienceListItemSchema = z.object({
  ID: z.number(),
  name: z.string(),
  introduction: z.string(),
});

export type AudienceListItem = z.infer<typeof AudienceListItemSchema>;
