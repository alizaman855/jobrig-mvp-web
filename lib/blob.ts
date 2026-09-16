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

export async function uploadSignatureImage(quoteId: string, dataUrl: string) {
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(base64, "base64");
  const blob = await put(`quote-signatures/${quoteId}-${Date.now()}.png`, buffer, {
    access: "public",
    addRandomSuffix: false,
    contentType: "image/png",
  });
  return blob.url;
}
