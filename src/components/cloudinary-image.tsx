import Image, { type ImageProps } from "next/image";
import cloudinaryLoader from "@/lib/cloudinary-loader";

type Props = Omit<ImageProps, "src" | "loader"> & {
  publicId: string;
};

export default function CloudinaryImage({ publicId, alt, ...props }: Props) {
  return <Image {...props} src={publicId} alt={alt} loader={cloudinaryLoader} />;
}
