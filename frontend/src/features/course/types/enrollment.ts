import { z } from "zod";

export const EnrolledUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  phone: z.string(),
});

export type EnrolledUser = z.infer<typeof EnrolledUserSchema>;
