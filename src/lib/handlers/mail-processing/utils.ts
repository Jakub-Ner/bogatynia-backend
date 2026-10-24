import mammoth from 'mammoth';

const ENCODING_BASE64 = "base64";

interface EmailAttachment {
  ContentType: string;
  Content: string;
  Name?: string;
}

function convertPlainTextToMarkdown(text: string): string {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n\n");
}

export async function extractTextFromWordDocument(attachment: EmailAttachment): Promise<string> {
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

export function findWordDocuments(attachments: EmailAttachment[]): EmailAttachment[] {
  const MS_WORD_CONTENT_TYPE = "application/msword";
  const DOCX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return (
    attachments.filter(
      (attachment) =>
        attachment.ContentType === MS_WORD_CONTENT_TYPE ||
        attachment.ContentType === DOCX_CONTENT_TYPE,
    )
  );
}
