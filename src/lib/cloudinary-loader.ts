import type { ImageLoaderProps } from "next/image";

export default function cloudinaryLoader({ src, width, quality }: ImageLoaderProps) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is required to render Cloudinary images.");
  const publicId = src.replace(/^\/+/, "").split("/").map(encodeURIComponent).join("/");
  const q = quality ?? "auto";
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_${q},c_limit,w_${width}/${publicId}`;
}
