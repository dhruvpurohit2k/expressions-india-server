import { apiFetch } from "./api";

interface PresignRequestItem {
  contentType: string;
  fileName: string;
}

interface PresignResponseItem {
  id: string;
  presignedUrl: string;
  url: string;
  contentType: string;
  fileName: string;
}

export interface UploadedMediaRef {
  id: string;
  name: string;
  fileType: string;
  url: string;
}

async function presignFiles(
  items: PresignRequestItem[],
): Promise<PresignResponseItem[]> {
  const res = await apiFetch(
    `${import.meta.env.VITE_SERVER_URL}/admin/upload/presign`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(items),
    },
  );
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error?.message ?? "Failed to get presigned URLs");
  }
  return json.data as PresignResponseItem[];
}

async function uploadToS3(presignedUrl: string, file: File): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Upload failed with status ${res.status}`);
  }
}

/**
 * Presigns and uploads a batch of files directly to S3/MinIO.
 * Returns UploadedMediaRef for each file, ready to JSON-serialize into form fields.
 */
export async function presignAndUploadFiles(
  files: Array<{ file: File; name: string }>,
): Promise<UploadedMediaRef[]> {
  if (files.length === 0) return [];

  const presignItems = files.map(({ file, name }) => ({
    contentType: file.type || "application/octet-stream",
    fileName: name,
  }));

  const presigned = await presignFiles(presignItems);

  await Promise.all(
    presigned.map(({ presignedUrl }, i) => uploadToS3(presignedUrl, files[i].file)),
  );

  return presigned.map(({ id, url, contentType }, i) => ({
    id,
    name: files[i].name,
    fileType: contentType,
    url,
  }));
}
