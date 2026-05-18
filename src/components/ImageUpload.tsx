"use client";

import { useState, useRef } from "react";
import ImageKit from "imagekit-javascript";
import api from "@/lib/axios";
import { Image as ImageIcon, Loader2, X } from "lucide-react";
import Image from "next/image";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "public_key",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/your_id",
});

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = "Upload Image" }: ImageUploadProps) {
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
      
      imagekit.upload(
        {
          file,
          fileName: file.name,
          tags: ["menuverse"],
          token: auth.token,
          signature: auth.signature,
          expire: auth.expire,
        },
        (err: any, result: any) => {
          setIsUploading(false);
          if (err) {
            console.error(err);
            alert("Upload failed. Please try again.");
          } else if (result?.url) {
            onChange(result.url);
          }
        }
      );
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
          <Image src={value} alt="Uploaded" fill className="object-cover" unoptimized />
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
