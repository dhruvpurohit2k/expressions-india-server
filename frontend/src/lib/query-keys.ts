export const eventKeys = {
  all: ["event"] as const,
  list: (params: Record<string, unknown>) => [...eventKeys.all, "list", params] as const,
  detail: (id: string) => [...eventKeys.all, id] as const,
};

export const journalKeys = {
  all: ["journal"] as const,
  list: (params: Record<string, unknown>) => [...journalKeys.all, "list", params] as const,
  detail: (id: string) => [...journalKeys.all, id] as const,
};

export const enquiryKeys = {
  all: ["enquiry"] as const,
  list: (params: Record<string, unknown>) => [...enquiryKeys.all, "list", params] as const,
  detail: (id: string) => [...enquiryKeys.all, id] as const,
};

export const podcastKeys = {
  all: ["podcast"] as const,
  list: (params: Record<string, unknown>) => [...podcastKeys.all, "list", params] as const,
  detail: (id: string) => [...podcastKeys.all, id] as const,
};

export const audienceKeys = {
  all: ["audience"] as const,
};

export const articleKeys = {
  all: ["article"] as const,
  list: (params: Record<string, unknown>) => [...articleKeys.all, "list", params] as const,
  detail: (id: string) => [...articleKeys.all, id] as const,
};

export const courseKeys = {
  all: ["course"] as const,
  list: (params: Record<string, unknown>) => [...courseKeys.all, "list", params] as const,
  detail: (id: string) => ["course", id] as const,
  chapter: (courseId: string, chapterId: string) => ["course", courseId, "chapter", chapterId] as const,
  enrolled: (courseId: string, params: Record<string, unknown>) => ["course", courseId, "enrolled", params] as const,
  notEnrolled: (courseId: string, params: Record<string, unknown>) => ["course", courseId, "not-enrolled", params] as const,
};

export const teamKeys = {
  all: ["team"] as const,
};

export const almanacKeys = {
  all: ["almanac"] as const,
  list: (params: Record<string, unknown>) => [...almanacKeys.all, "list", params] as const,
  detail: (id: string) => [...almanacKeys.all, id] as const,
};

export const brochureKeys = {
  all: ["brochure"] as const,
  list: (params: Record<string, unknown>) => [...brochureKeys.all, "list", params] as const,
  detail: (id: string) => [...brochureKeys.all, id] as const,
};
