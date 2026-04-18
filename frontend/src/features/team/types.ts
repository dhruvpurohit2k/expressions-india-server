import { z } from "zod";

export const MemberSchema = z.object({
  id: z.string(),
  position: z.string(),
  holders: z.array(z.string()),
});

export const TeamSchema = z.object({
  id: z.string(),
  description: z.string(),
  members: z.array(MemberSchema),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Team = z.infer<typeof TeamSchema>;
export type Member = z.infer<typeof MemberSchema>;
