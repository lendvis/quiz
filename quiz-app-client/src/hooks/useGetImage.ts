import { getImage } from "../api/image/getImage";
import { useAutoFetch } from "./useAutoFetch";

export function useGetImage(id: string) {
    return useAutoFetch(() => getImage(id), [id]);
}
