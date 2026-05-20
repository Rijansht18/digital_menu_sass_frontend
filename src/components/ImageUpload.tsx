"use client";

import { useState, useRef } from "react";
import ImageKit from "imagekit-javascript";
import imageCompression from "browser-image-compression";
import api from "@/lib/axios";
import { Image as ImageIcon, Loader2, X } from "lucide-react";
import Image from "next/image";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "public_key",
  urlEndpoint:
    process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ||
    "https://ik.imagekit.io/your_id",
});

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  /** If provided, upload will be placed in this ImageKit folder (overrides restaurant/category defaults) */
  folderPath?: string;
  /** Optional category id or slug to include in folder/tags */
  category?: string;
  /** Additional tags to include on upload */
  tags?: string[];
}

export function ImageUpload({
  value,
  onChange,
  label = "Upload Image",
  folderPath,
  category,
  tags: additionalTags = [],
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const authenticator = async () => {
    try {
      const response = await api.get("/upload/imagekit-auth");
      return response.data.data;
    } catch (error: any) {
      throw new Error("Authentication request failed");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const auth = await authenticator();
      // Compress the image on the frontend before uploading and convert to WebP
      let fileToUpload: File | Blob = file;
      try {
        const options = {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
          fileType: "image/webp",
          initialQuality: 0.85,
        };

        const compressed = await imageCompression(file, options);
        const toWebpName = (name: string) => {
          const base = name.replace(/\.[^/.]+$/, "");
          return `${base}.webp`;
        };

        if (compressed instanceof File) {
          // ensure filename ends with .webp
          const name = toWebpName(compressed.name);
          fileToUpload = new File([compressed], name, {
            type: compressed.type,
          });
        } else {
          const name = toWebpName(file.name);
          fileToUpload = new File([compressed], name, { type: "image/webp" });
        }
      } catch (compressionErr) {
        console.warn(
          "Image compression failed, uploading original file:",
          compressionErr,
        );
        fileToUpload = file;
      }

      // Prepare organized folder and tags. Callers must pass slug-based folderPath/category.
      const finalFolder = folderPath || undefined;

      const finalTags = ["menuverse", ...additionalTags];
      if (category) finalTags.push(`category:${category}`);

      const uploadOptions: any = {
        file: fileToUpload,
        fileName: fileToUpload instanceof File ? fileToUpload.name : file.name,
        tags: finalTags,
        token: auth.token,
        signature: auth.signature,
        expire: auth.expire,
      };

      if (finalFolder) uploadOptions.folder = finalFolder;

      imagekit.upload(uploadOptions, (err: any, result: any) => {
        setIsUploading(false);
        if (err) {
          console.error(err);
          alert("Upload failed. Please try again.");
        } else if (result?.url) {
          onChange(result.url);
        }
      });
    } catch (err) {
      console.error(err);
      setIsUploading(false);
      alert("Failed to authenticate upload. Check console.");
    }
  };

  return (
    <div className="space-y-2">
      <label className="label">{label}</label>

      {value ? (
        <div className="relative w-full h-32 rounded-xl overflow-hidden group border border-surface-border">
          <Image
            src={value}
            alt="Uploaded"
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={() => onChange("")}
              className="btn-danger btn-sm"
            >
              <X className="w-4 h-4 mr-1" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-32 rounded-xl border-2 border-dashed border-surface-border flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-surface-elevated transition-colors"
        >
          {isUploading ? (
            <div className="flex flex-col items-center text-text-muted">
              <Loader2 className="w-6 h-6 animate-spin mb-2 text-brand-400" />
              <span className="text-sm">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-text-muted">
              <ImageIcon className="w-6 h-6 mb-2 text-brand-400" />
              <span className="text-sm">Click to upload</span>
              <span className="text-xs mt-1">JPEG, PNG, WEBP</span>
            </div>
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
