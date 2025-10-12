import { put } from "@vercel/blob";

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export async function saveToBlob(
  content: string,
  filename: string,
): Promise<string> {
  if (!BLOB_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN environment variable is not set");
  }

  console.log(`Saving file to blob storage: ${filename}`);
  const blob = await put(filename, content, {
    access: "public",
    token: BLOB_TOKEN,
    allowOverwrite: true
  });

  return blob.url;
}

