import { useState } from "react";
import { cn } from "@/lib/utils";

interface Image {
  url: string;
  alt: string;
}

interface ProductGalleryProps {
  images: Image[];
}

export const ProductGallery = ({ images }: ProductGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="grid gap-4">
      <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
        <img
          src={images[selectedImage].url}
          alt={images[selectedImage].alt}
          className="h-full w-full object-cover object-center animate-fadeIn"
        />
      </div>
      <div className="flex gap-4 overflow-auto pb-2">
        {images.map((image, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(idx)}
            className={cn(
              "relative aspect-square w-20 flex-shrink-0 cursor-pointer rounded-md bg-gray-100 overflow-hidden",
              selectedImage === idx && "ring-2 ring-primary"
            )}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="h-full w-full object-cover object-center"
            />
          </button>
        ))}
      </div>
    </div>
  );
};