import { type FC, useEffect, useState } from "react";

interface ImageFromBlobProps {
  blob: Blob;
}

export const ImageFromBlob: FC<ImageFromBlobProps> = ({ blob }) => {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(blob);
    setSrc(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [blob]);

  return <img src={src ?? undefined} />;
};
