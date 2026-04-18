import { useForm } from "@tanstack/react-form";
import z from "zod";
import { Label } from "./ui/label";
import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { twMerge } from "tailwind-merge";
import { Button } from "./ui/button";
import { Save, UploadCloud, X } from "lucide-react";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function HomePageImageEdit({
  images,
}: {
  images: {
    success: boolean;
    data: {
      id: string;
      url: string;
    }[];
  };
}) {
  const { mutateAsync } = useHomePageImageMutate();
  const form = useForm({
    defaultValues: {
      images: images.data.map((image) => {
        return {
          id: image.id,
          url: image.url,
          type: "existing",
        } as ImageType;
      }),
      deletedImageIds: [] as string[],
    },
    onSubmit: async (value) => {
      const formData = new FormData();
      value.value.deletedImageIds.map((id) => {
        formData.append("deletedImageIds", id);
      });
      value.value.images.map((image) => {
        if (image.type === "new" && image.file) {
          formData.append("images", image.file);
        }
      });
      toast.promise(mutateAsync(formData), {
        loading: (
          <div className="flex items-center">
            <p className="text-lg text-yello-700">Saving...</p>
          </div>
        ),
        success: () => {
          return (
            <div className="flex items-center">
              <p className="text-lg text-emerald-700">
                Updated Home Page Images Successfully
              </p>
            </div>
          );
        },

        error: () => {
          return (
            <div className="flex items-center">
              <p className="text-lg text-red">SAVING FAILED</p>
            </div>
          );
        },
        position: "top-center",
      });
    },
  });
  const [current, setCurrent] = useState<number>(-1);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const uploadButtonRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!carouselApi) return;
    setCurrent(carouselApi.selectedScrollSnap() + 1);
    const onSelect = () => {
      setCurrent(carouselApi.selectedScrollSnap() + 1);
    };
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
      setCurrent(1);
    };
  }, [carouselApi]);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      objectUrlsRef.current.clear();
    };
  }, []);
  if (!images) {
    return null;
  }
  return (
    <div className="m-10 max-h-200 p-10 border border-neutral-500 rounded flex flex-col">
      <p className="text-red-500 text-3xl">Change Home page Photo graphs</p>
      <form
        className="flex flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.Field
          name={"images"}
          validators={{ onChange: HomePageImageSchema.shape.images }}
          children={(field) => (
            <div className="mt-3 flex flex-col gap-5">
              <Label htmlFor={field.name} className="text-neutral-600 text-md ">
                Upload Images that you want to show on the home page
              </Label>

              {/* 1. The Multi-File Input */}
              <Input
                id={field.name}
                type="file"
                ref={uploadButtonRef}
                accept="image/png, image/jpeg, image/webp, application/pdf"
                className={twMerge(
                  "text-neutral-600 bg-red invisible absolute",
                  field.state.meta.errors.length ? "border-destructive" : "",
                )}
                onChange={(e) => {
                  // Convert FileList to a standard Array
                  const files = e.target.files;
                  if (!files || files.length == 0) return;
                  const newImage: ImageType = {
                    type: "new",
                    file: files[0],
                  };
                  field.handleChange([...field.state.value, newImage]);
                }}
              />
              <Button
                type="button"
                variant={"default"}
                className="font-bold text-md self-start"
                onClick={() => {
                  uploadButtonRef.current?.click();
                }}
              >
                <UploadCloud className="size-5" />
                Upload Images/PDFs
              </Button>

              {/* 2. Validation Errors */}
              {field.state.meta.errors.length ? (
                <em className="text-sm font-medium text-destructive block">
                  {field.state.meta.errors
                    .map((err) =>
                      typeof err === "string" ? err : (err as any).message,
                    )
                    .join(", ")}
                </em>
              ) : null}

              {/* 3. The Carousel Preview */}
              {field.state.value.length > 0 ? (
                <div className="px-12 py-10 h-full items-center!">
                  {/* Padding prevents arrows from hiding behind content */}
                  <Carousel
                    opts={{
                      align: "start",
                      loop: true,
                    }}
                    setApi={setCarouselApi}
                    className="w-full max-w-xs mx-auto"
                  >
                    <CarouselContent>
                      {field.state.value.map((file, index) => {
                        let url: string = "";
                        if (file.type === "existing" && file.url) {
                          url = file.url;
                        } else if (file.file) {
                          url = URL.createObjectURL(file.file);
                          objectUrlsRef.current.add(url);
                        }
                        return (
                          <CarouselItem key={index} className="basis-full">
                            <div className="relative group p-1">
                              <div className="overflow-hidden rounded-md border shadow-sm aspect-square">
                                <img
                                  src={url}
                                  alt={`Preview ${index}`}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                              {/* Delete Button (Appears top right of each image) */}
                              <Button
                                type="button"
                                variant="default"
                                size="icon"
                                className="absolute top-0 right-0 h-6 w-6 rounded-full opacity-100 shadow-md transition-opacity hover:opacity-100"
                                onClick={() => {
                                  if (file.type === "existing" && file.id) {
                                    const currentDeletedIds =
                                      form.getFieldValue("deletedImageIds");
                                    form.setFieldValue("deletedImageIds", [
                                      ...currentDeletedIds,
                                      file.id,
                                    ]);
                                  }
                                  const updatedFiles = field.state.value.filter(
                                    (_, i) => i !== index,
                                  );
                                  field.handleChange(updatedFiles);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </CarouselItem>
                        );
                      })}
                    </CarouselContent>
                    {/* Carousel Navigation Arrows */}
                    <CarouselPrevious
                      type="button"
                      className="text-red-500 size-10 border-2 border-red-500"
                    />
                    <CarouselNext
                      type="button"
                      className="text-red-500 size-10 border-2 border-red-500"
                    />
                  </Carousel>
                  <div className="flex justify-center">
                    <p className="text-lg text-neutral-500">{`${current} of ${field.state.value.length}`}</p>
                  </div>
                </div>
              ) : (
                <div className="justify-self-center mt-5 mx-auto self-center flex">
                  <p className="text-neutral-500">Upload images</p>
                </div>
              )}
            </div>
          )}
        />
        <Button type="submit" className="text-md font-bold self-center">
          <Save strokeWidth={3} className="size-4!" />
          Submit
        </Button>
      </form>
    </div>
  );
}

const ImageSchema = z.object({
  id: z.uuidv7().optional(),
  url: z.url().optional(),
  type: z.enum(["existing", "new"]),
  file: z.instanceof(File).optional(),
});
export const HomePageImageSchema = z.object({
  images: z
    .array(ImageSchema)
    .max(5, { message: "Only allowed to upload 5 images." }),
});
type ImageType = z.infer<typeof ImageSchema>;
// type HomePageImageData = z.infer<typeof HomePageImageSchema>;


async function saveHomePageImages(formData: FormData) {
  const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/admin/promotion`, {
    method: "PUT",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload images");
  return res.json();
}

function useHomePageImageMutate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => {
      return saveHomePageImages(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepageimage"] });
    },
    onError: (error: Error) => {
      alert("Failed to submit event " + error.message);
    },
  });
}
