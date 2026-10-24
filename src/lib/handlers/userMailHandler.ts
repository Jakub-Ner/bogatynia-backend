import { findWordDocuments } from "./mail-processing/utils";
import { processAnnouncementsAttachment } from "./mail-processing/announcements/process";
import { processPopeIntentionsAttachment } from "./mail-processing/pope-intentions/process";
import { processWypominkiAttachment } from "./mail-processing/wypominki/process";

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

export default async function userMailHandler(
  emailData: EmailData,
): Promise<void> {
  const attachments = emailData.Attachments || [];

  const wordDocuments = findWordDocuments(attachments);
  if (!wordDocuments || wordDocuments.length === 0) {
    console.log("No Word document found in attachments");
    return;
  }

  const promises = [];
  const subject = emailData.Subject || "";
  for (const doc of wordDocuments) {
    if (!doc.Name) {
      console.log("Attachment has no name, skipping");
      continue;
    }
    const filename = doc.Name.toLowerCase();
    if (filename.includes("ogłoszenia")) {
      promises.push(processAnnouncementsAttachment(doc, subject));
      continue;
    }
    if (/intencj.*papiesk/.test(filename)) {
      promises.push(processPopeIntentionsAttachment(doc, subject));
      continue;
    }
    if (filename.includes("wypominki") || filename.includes("wypominek")) {
      promises.push(processWypominkiAttachment(doc));
      continue;
    }
  }
  await Promise.all(promises);
}

export { userMailHandler };
