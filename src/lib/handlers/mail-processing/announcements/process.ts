import { formatAnnouncementsWithAI, extractDateFromSubject } from "../../../ai/ogloszenia";
import { saveToBlob } from "../../../storage/blobStorage";
import { extractTextFromWordDocument } from "../utils";

const MS_WORD_CONTENT_TYPE = "application/msword";
const DOCX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const ENCODING_BASE64 = "base64";

interface EmailAttachment {
  ContentType: string;
  Content: string;
  Name?: string;
}

function parseAnnouncementsMetadata(date: string): string {
  return `---
title: "Ogłoszenia Parafialne"
date: ${date}
featured: true
draft: false
---

`;
}

export async function processAnnouncementsAttachment(
  wordDocument: EmailAttachment,
  subject: string,
): Promise<void> {
  const rawText = await extractTextFromWordDocument(wordDocument);
  console.log("Raw extracted text length:", rawText.length);

  let formattedMarkdown = await formatAnnouncementsWithAI(rawText);
  const ogloszeniaDate = await extractDateFromSubject(subject);
  formattedMarkdown = parseAnnouncementsMetadata(ogloszeniaDate) + formattedMarkdown;

  const title = `ogloszenia/${ogloszeniaDate}.md`;
  const blobUrl = await saveToBlob(formattedMarkdown, title);
  console.log(`Markdown saved to Vercel Blob: ${blobUrl}`);
}
