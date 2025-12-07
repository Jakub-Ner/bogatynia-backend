import mammoth from 'mammoth';
import {
  formatAnnouncementsWithAI,
  extractDateFromSubject,
} from "../ai/ogloszenia";
import { saveToBlob } from "../storage/blobStorage";
import { extractMonthFromAttachment, formatPopeIntentionsWithAI } from '../ai/pope-intentions';

const MS_WORD_CONTENT_TYPE = "application/msword";
const DOCX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const ENCODING_BASE64 = "base64";

interface EmailAttachment {
  ContentType: string;
  Content: string;
  Name?: string;
}

interface EmailData {
  From?: string;
  Subject?: string;
  Attachments?: EmailAttachment[];
}

function findWordDocuments(attachments: EmailAttachment[]): EmailAttachment[] {
  return (
    attachments.filter(
      (attachment) =>
        attachment.ContentType === MS_WORD_CONTENT_TYPE ||
        attachment.ContentType === DOCX_CONTENT_TYPE,
    )
  );
}

function convertPlainTextToMarkdown(text: string): string {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n\n");
}

async function extractTextFromWordDocument(attachment: EmailAttachment): Promise<string> {
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

function parseAnnouncementsMetadata(date: string): string {
  return `---
title: "Ogłoszenia Parafialne"
date: ${date}
featured: true
draft: false
---

`;
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

async function processAnnouncementsAttachment(
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

async function processPopeIntentionsAttachment(
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

export default async function ogloszeniaHandler(
  emailData: EmailData,
): Promise<void> {
  const attachments = emailData.Attachments || [];

  const wordDocuments = findWordDocuments(attachments);
  if (!wordDocuments) {
    console.log("No Word document found in attachments");
    return;
  }

  const promises = [];
  for (const doc of wordDocuments) {
    if (!doc.Name) {
      console.log("Attachment has no name, skipping");
      continue;
    }
    const subject = emailData.Subject || "";
    const filename = doc.Name.toLowerCase();
    if (filename.includes("ogłoszenia")) {
      promises.push(processAnnouncementsAttachment(doc, subject));
    }
    if (/intencj.*papiesk/.test(filename)) {
      promises.push(processPopeIntentionsAttachment(doc, subject));
    }
  }
  await Promise.all(promises);
}
