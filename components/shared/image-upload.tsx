"use client";

import { useState, useRef } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  className?: string;
}

export function ImageUpload({ onUploadComplete, className }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local Preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setIsUploading(true);

    // Create FormData
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      onUploadComplete(data.url); // Pass URL back to parent form
    } catch (error) {
      console.error("Upload error", error);
      alert("Failed to upload image. Please try again.");
      setPreview(null); // Reset on failure
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onUploadComplete(""); // Clear URL in parent
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
      />

      {!preview ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border border-border hover:bg-secondary/50 transition-colors rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer min-h-[150px]"
        >
          <div className="bg-primary/10 p-3 rounded-full mb-3">
            <ImagePlus className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">Add Photos</p>
          <p className="text-xs text-muted-foreground mt-1">JPEG, PNG (Max 5MB)</p>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-border bg-secondary/30">
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="flex flex-col items-center text-white">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <span className="text-xs font-medium">Compressing & Watermarking...</span>
              </div>
            </div>
          )}
          
          <Image 
            src={preview} 
            alt="Evidence preview" 
            width={500} 
            height={300} 
            className="w-full h-auto max-h-[300px] object-cover"
          />

          {!isUploading && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 rounded-full w-8 h-8 shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}