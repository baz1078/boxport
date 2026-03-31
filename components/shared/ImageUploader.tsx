"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useUploadThing } from "@/lib/uploadthing";

interface UploadedImage {
  url: string;
  key: string;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?: number;
}

export function ImageUploader({ images, onImagesChange, maxImages = 10 }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload } = useUploadThing("listingImages", {
    onClientUploadComplete: (res) => {
      const newImages = res.map((file) => ({ url: file.url, key: file.key }));
      onImagesChange([...images, ...newImages]);
      setIsUploading(false);
      toast.success(`${newImages.length} photo${newImages.length > 1 ? "s" : ""} uploaded`);
    },
    onUploadError: (error) => {
      setIsUploading(false);
      toast.error(`Upload failed: ${error.message}`);
    },
    onUploadBegin: () => {
      setIsUploading(true);
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const remaining = maxImages - images.length;
      if (remaining <= 0) {
        toast.error(`Maximum ${maxImages} photos allowed`);
        return;
      }
      const filesToUpload = acceptedFiles.slice(0, remaining);
      await startUpload(filesToUpload);
    },
    [images, maxImages, startUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: maxImages,
    disabled: isUploading || images.length >= maxImages,
  });

  const removeImage = (key: string) => {
    onImagesChange(images.filter((img) => img.key !== key));
  };

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {images.map((img, index) => (
            <div key={img.key} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
              <Image
                src={img.url}
                alt={`Container photo ${index + 1}`}
                fill
                className="object-cover"
              />
              {index === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-primary-foreground text-[10px] text-center py-0.5 font-medium">
                  Cover
                </div>
              )}
              <button
                type="button"
                onClick={() => removeImage(img.key)}
                className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop Zone */}
      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Uploading photos...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Drop photos here, or click to browse</p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP up to 10MB · {images.length}/{maxImages} photos
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
