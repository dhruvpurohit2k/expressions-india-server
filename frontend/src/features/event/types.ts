import { z } from "zod";


export const PROGRAM_STATUS = ["upcoming", "completed", "cancelled"] as const;

export const INDIVIDUAL_AUDIENCES = [
  "student",
  "teacher",
  "parent",
  "head_of_department",
  "mental_health_professional",
  "counselor",
] as const;

export const AUDIENCE_LABELS: Record<string, string> = {
  student: "Student",
  teacher: "Teacher",
  parent: "Parent",
  head_of_department: "Head of Department",
  mental_health_professional: "Mental Health Professional",
  counselor: "Counselor",
  all: "All",
};

export const MediaSchema = z.object({
  id: z.uuid(),
  url: z.url(),
  name: z.string(),
  fileType: z.string(),
});
export type MediaData = z.infer<typeof MediaSchema>;

export const EventListSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  status: z.string().default(""),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  isOnline: z.boolean(),
  isPaid: z.boolean(),
});
export const EventSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string(),
  perks: z.array(z.string()).nullish().transform((v) => v ?? []),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  isOnline: z.boolean(),
  location: z.string().nullable(),
  isPaid: z.boolean(),
  price: z.number().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  registrationUrl: z.string(),
  promotionalMedia: z.array(MediaSchema),
  promotionalDocuments: z.array(MediaSchema),
  medias: z.array(MediaSchema),
  documents: z.array(MediaSchema),
  videoLinks: z.array(z.object({ id: z.string(), url: z.string() })),
  promotionalVideoLinks: z.array(z.object({ id: z.string(), url: z.string() })),
  status: z.enum(["upcoming", "completed"]),
  audiences: z.array(z.string()).nullish().transform((v) => v ?? []),
  thumbnail: MediaSchema.nullable().optional(),
});
export type EventListData = z.infer<typeof EventListSchema>;
export type EventData = z.infer<typeof EventSchema>;
