import mammoth from 'mammoth';
import {
  formatOgloszeniaWithAI,
  extractDateFromSubject,
} from "../ai/ogloszenia";
import { saveToBlob } from "../storage/blobStorage";

const MS_WORD_CONTENT_TYPE = "application/msword";
const DOCX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const ENCODING_BASE64 = "base64";

function findWordDocument(attachments: any[]): any | null {
  return (
    attachments.find(
      (attachment) =>
        attachment.ContentType === MS_WORD_CONTENT_TYPE ||
        attachment.ContentType === DOCX_CONTENT_TYPE,
    ) || null
  );
}

function convertPlainTextToMarkdown(text: string): string {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n\n");
}

async function extractTextFromWordDocument(attachment: any): Promise<string> {
  const content = attachment.Content;
  const buffer = Buffer.from(content, ENCODING_BASE64);

  console.log("Buffer length:", buffer.length);
  try {
    const result = await mammoth.convertToHtml({ buffer });
    return convertPlainTextToMarkdown(result.value);
  } catch (error) {
    console.error("Error extracting text from Word document:", error);
    throw error;
  }
}

async function saveMarkdownToFile(
  markdown: string,
  filename: string,
): Promise<void> {
  const fs = await import("fs/promises");
  await fs.writeFile(filename, markdown, "utf-8");
}

function parseMetadata(date: string): string {
  return `---
title: "Ogłoszenia Parafialne"
date: ${date}
featured: true
draft: false
---

`;
}

export default async function ogloszeniaHandler(
  emailData: any,
): Promise<void> {
  const attachments = emailData.Attachments || [];

  const wordDocument = findWordDocument(attachments);

  if (!wordDocument) {
    console.log("No Word document found in attachments");
    return;
  }

  const rawText = await extractTextFromWordDocument(wordDocument);

  let formattedMarkdown = await formatOgloszeniaWithAI(rawText);
  const ogloszeniaDate = await extractDateFromSubject(emailData);
  formattedMarkdown = parseMetadata(ogloszeniaDate) + formattedMarkdown;

  const title = `ogloszenia/${ogloszeniaDate}.md`;
  const blobUrl = await saveToBlob(formattedMarkdown, title);
  console.log(`Markdown saved to Vercel Blob: ${blobUrl}`);
}
