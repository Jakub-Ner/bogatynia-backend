import { formatWypominkiWithAI } from "../../../ai/wypominki";
import { saveToBlob } from "../../../storage/blobStorage";
import { extractTextFromWordDocument } from "../utils";

interface EmailAttachment {
  ContentType: string;
  Content: string;
  Name?: string;
}

function parseWypominkiMetadata(title?: string): string {
  const date = new Date().toISOString().split("T")[0];
  const displayTitle = title || "Wypominki";
  return `---
title: "${displayTitle}"
date: ${date}
featured: true
draft: false
---

`;
}

export async function processWypominkiAttachment(
  wordDocument: EmailAttachment,
): Promise<void> {
  const rawText = await extractTextFromWordDocument(wordDocument);
  console.log("Raw extracted text length:", rawText.length);

  let formattedMarkdown = await formatWypominkiWithAI(rawText);
  formattedMarkdown = parseWypominkiMetadata() + formattedMarkdown;

  const title = `wypominki/wypominki.md`;
  const blobUrl = await saveToBlob(formattedMarkdown, title);
  console.log(`Markdown saved to Vercel Blob: ${blobUrl}`);
}
