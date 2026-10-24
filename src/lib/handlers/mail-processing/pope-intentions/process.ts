import { formatPopeIntentionsWithAI, extractMonthFromAttachment } from "../../../ai/pope-intentions";
import { saveToBlob } from "../../../storage/blobStorage";
import { extractTextFromWordDocument } from "../utils";

interface EmailAttachment {
  ContentType: string;
  Content: string;
  Name?: string;
}

function parsePopeIntentionsMetadata(month: string): string {
  const date = new Date().toISOString().split("T")[0];
  return `---
title: "Intencja Papieska"
date: "${date}"
category: "Intencja Papieska"
month: "${month}"
draft: false
---
`;
}

export async function processPopeIntentionsAttachment(
  wordDocument: EmailAttachment,
  subject: string,
): Promise<void> {
  const rawText = await extractTextFromWordDocument(wordDocument);
  console.log("Raw extracted text length:", rawText.length);

  let formattedMarkdown = await formatPopeIntentionsWithAI(rawText);
  const monthAndYear = await extractMonthFromAttachment(subject);
  formattedMarkdown = parsePopeIntentionsMetadata(monthAndYear) + formattedMarkdown;

  const title = `pope-intentions/${monthAndYear}.md`;
  const blobUrl = await saveToBlob(formattedMarkdown, title);
  console.log(`Markdown saved to Vercel Blob: ${blobUrl}`);
}
