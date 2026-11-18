export function getRecipeImageUrl(publicId: string | null | undefined, width = 1200): string | null {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName || !publicId) return null;
  const safeWidth = Math.min(Math.max(Math.round(width), 320), 2000);
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_${safeWidth}/${publicId}`;
}
