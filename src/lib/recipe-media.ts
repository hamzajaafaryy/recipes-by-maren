const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

function cloudinaryUrl(publicId: string | null | undefined, transform: string): string | null {
  if (!cloudName || !publicId) return null;
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${publicId}`;
}

export function getRecipeImageUrl(publicId: string | null | undefined, width = 1200): string | null {
  const safeWidth = Math.min(Math.max(Math.round(width), 320), 2000);
  return cloudinaryUrl(publicId, `f_auto,q_auto,w_${safeWidth}`);
}

export function getPinterestImageUrl(publicId: string | null | undefined): string | null {
  return cloudinaryUrl(publicId, "f_auto,q_auto,c_fill,g_auto,w_1000,h_1500");
}

export function getOpenGraphImageUrl(publicId: string | null | undefined): string | null {
  return cloudinaryUrl(publicId, "f_auto,q_auto,c_fill,g_auto,w_1200,h_630");
}
