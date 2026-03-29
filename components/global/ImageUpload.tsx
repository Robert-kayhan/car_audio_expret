"use client";

import React, { useRef, useState } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value = [],
  onChange,
  multiple = true,
  maxFiles = 5,
  label = "Upload Images",
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const uploadImageToS3 = async (file: File): Promise<string> => {
    const res = await fetch("/api/upload-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to get upload URL");
    }

    const { uploadUrl, fileUrl } = data.data;

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error("Failed to upload image");
    }

    return fileUrl;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const selectedFiles = Array.from(files);

    const imageFiles = selectedFiles.filter((file) =>
      ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)
    );

    if (imageFiles.length === 0) {
      alert("Please select valid image files");
      return;
    }

    const remainingSlots = maxFiles - value.length;

    if (remainingSlots <= 0) {
      alert(`You can upload maximum ${maxFiles} images`);
      return;
    }

    const filesToUpload = multiple
      ? imageFiles.slice(0, remainingSlots)
      : imageFiles.slice(0, 1);

    try {
      setUploading(true);

      const uploadedUrls: string[] = [];

      for (const file of filesToUpload) {
        const url = await uploadImageToS3(file);
        uploadedUrls.push(url);
      }

      if (multiple) {
        onChange([...value, ...uploadedUrls]);
      } else {
        onChange(uploadedUrls);
      }
    } catch (error) {
      console.error(error);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    await handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="w-full space-y-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <div
        className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-200 cursor-pointer ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-gray-100"
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);
        }}
        onDrop={onDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center text-center space-y-3">
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
              <p className="text-sm text-gray-600">Uploading images...</p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-white shadow flex items-center justify-center">
                <Upload className="w-7 h-7 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Click or drag images here
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, JPEG, WEBP allowed
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Max {maxFiles} image{maxFiles > 1 ? "s" : ""}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {value.map((img, index) => (
            <div
              key={`${img}-${index}`}
              className="relative group rounded-2xl overflow-hidden border bg-white shadow-sm"
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                {img ? (
                  <img
                    src={img}
                    alt={`upload-${index}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>

              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-2">
                <p className="text-xs text-gray-500 truncate">
                  Image {index + 1}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;