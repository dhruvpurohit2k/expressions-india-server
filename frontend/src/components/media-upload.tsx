import { useRef } from "react";
import { Button } from "#/components/ui/button";
import { UploadCloud, X } from "lucide-react";

export type LocalMedia =
  | { type: "existing"; id: string; url: string; name: string }
  | { type: "new"; file: File };

export function mediaPreviewUrl(m: LocalMedia): string {
  if (m.type === "new") return URL.createObjectURL(m.file);
  return m.url;
}

export function MediaUploadSection({
  label,
  accept,
  mediaList,
  onAdd,
  onRemove,
}: {
  label: string;
  accept: string;
  mediaList: LocalMedia[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="invisible absolute w-0"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onAdd(files);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
      >
        <UploadCloud className="mr-2 size-4" />
        Upload
      </Button>

      {mediaList.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {mediaList.map((m, i) => {
            const url = mediaPreviewUrl(m);
            const isPdf =
              m.type === "new"
                ? m.file.type === "application/pdf"
                : m.name?.endsWith(".pdf");
            return (
              <div key={i} className="group relative">
                <div className="aspect-square overflow-hidden rounded-md border bg-muted">
                  {isPdf ? (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      PDF
                    </div>
                  ) : (
                    <img
                      src={url}
                      alt={`preview ${i}`}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow transition-opacity group-hover:opacity-100"
                >
                  <X className="size-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SingleMediaUpload({
  label,
  accept,
  media,
  onAdd,
  onRemove,
}: {
  label: string;
  accept: string;
  media: LocalMedia | null;
  onAdd: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="invisible absolute w-0"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onAdd(file);
          e.target.value = "";
        }}
      />

      {media ? (
        <div className="group relative w-fit">
          <div className="h-32 w-32 overflow-hidden rounded-md border bg-muted">
            {(media.type === "new"
              ? media.file.type === "application/pdf"
              : media.name?.endsWith(".pdf")) ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                PDF
              </div>
            ) : (
              <img
                src={mediaPreviewUrl(media)}
                alt="preview"
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow transition-opacity group-hover:opacity-100"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <UploadCloud className="mr-2 size-4" />
          Upload
        </Button>
      )}
    </div>
  );
}
