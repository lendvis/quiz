import { client } from "../client";

export async function getImage(id: string) {
  const responce = await client.get<Blob>(`/api/image/${id}`, {responseType: "blob"});
  
  return responce.data;
}
