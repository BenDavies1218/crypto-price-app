"use client";

import React, { useState, useEffect } from "react";
import Image, { type ImageProps } from "next/image";

// Fallback image Must be PNG Type
import fallbackImage from "/public/no-image-svgrepo-com.png";

// ImageWithFallback Type
interface ImageWithFallbackProps extends ImageProps {
  fallback?: ImageProps["src"];
}

// ImageWithFallback Component
const ImageWithFallback = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fallback = fallbackImage,
  alt,
  src,
  ...props
}: ImageWithFallbackProps) => {
  // State for error
  const [error, setError] = useState<React.SyntheticEvent<
    HTMLImageElement,
    Event
  > | null>(null);

  // Reset error state
  useEffect(() => {
    setError(null);
  }, [src]);

  return (
    <Image
      alt={alt}
      onError={setError}
      src={error ? fallbackImage : src}
      {...props}
    />
  );
};

export default ImageWithFallback;
