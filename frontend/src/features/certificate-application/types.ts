import { z } from "zod";

export const CertApplicationSchema = z.object({
  id: z.string(),
  formUrl: z.string(),
  openFrom: z.coerce.date().nullable().optional(),
  openUntil: z.coerce.date().nullable().optional(),
  closedMessage: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
});

export type CertApplication = z.infer<typeof CertApplicationSchema>;
