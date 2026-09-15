import "server-only";
import { put } from "@vercel/blob";

export async function uploadBusinessLogo(businessId: string, file: File) {
  const extension = file.name.split(".").pop() || "png";
  const blob = await put(`business-logos/${businessId}-${Date.now()}.${extension}`, file, {
    access: "public",
    addRandomSuffix: false,
  });
  return blob.url;
}
