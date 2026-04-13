import type { FC, ReactNode } from "react";
import { useEffect, useState } from "react";
import { useGetImage } from "../hooks/useGetImage";
import type { FetchResponce } from "../hooks/useFetch";

export interface ServerBackgroundProps {
  imageId: string;
  className: string;
  children?: ReactNode;
}

export const ServerBackground: FC<ServerBackgroundProps> = ({imageId, className, children}) => {
  const getImageState: FetchResponce<Blob> = useGetImage(imageId) as FetchResponce<Blob>;
  const [bgUrl, setBgUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!getImageState.data) return;

    const url = URL.createObjectURL(getImageState.data);
    setBgUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [getImageState.data]);

  const style =
    getImageState.error
      ? { backgroundColor: "#d1d5db" }
      : bgUrl
        ? { backgroundImage: `url(${bgUrl})` }
        : { backgroundColor: "#e5e7eb" };

  return (
    <div className={`bg-cover bg-center bg-no-repeat ${className}`} style={style}>
      {children}
    </div>
  );
};
