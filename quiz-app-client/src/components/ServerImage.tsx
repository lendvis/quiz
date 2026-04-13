import type { FC } from "react";
import { WithApi } from "./withApi";
import { useGetImage } from "../hooks/useGetImage";
import { ImageErrorFallback } from "./common/fallbacks/ImageFallback";
import { ImageFromBlob } from "./ImageFromBlob";

export interface ServerImageProps {
  imageId: string;
}

export const ServerImage: FC<ServerImageProps> = ({ imageId }) => {
  const getImageState = useGetImage(imageId);

  return (
    <WithApi<Blob> response={getImageState} fallback={<ImageErrorFallback />}>
      {(blob) => <ImageFromBlob blob={blob} />}
    </WithApi>
  );
};
