import { z } from "zod";

export const EnquiryListItemSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  subject: z.string(),
  designation: z.string(),
  email: z.string(),
  phone: z.string(),
  createdAt: z.coerce.date(),
});
export type EnquiryListItem = z.infer<typeof EnquiryListItemSchema>;

export const EnquirySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  subject: z.string(),
  designation: z.string(),
  email: z.string(),
  message: z.string(),
  phone: z.string(),
  createdAt: z.coerce.date(),
});
