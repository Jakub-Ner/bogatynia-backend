import { isTrustedEmail, validateEmailData } from './email-validator';
import { detectKeywords, executeKeywordActions } from './keyword-detector';

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

export async function processIncomingEmail(emailData: unknown): Promise<void> {
  if (!validateEmailData(emailData)) {
    console.log('Invalid email data received');
    return;
  }

  const typedEmailData = emailData as EmailData;
  const fromEmail = typedEmailData.From || '';
  const subject = typedEmailData.Subject || '';

  console.log(`Processing email from: ${fromEmail}, subject: ${subject}`);

  if (!isTrustedEmail(fromEmail)) {
    console.log(`Email from ${fromEmail} is not from a trusted sender. Ignoring.`);
    return;
  }

  console.log(`Email from ${fromEmail} is from a trusted sender. Processing...`);

  const keywordActions = detectKeywords(subject);

  if (keywordActions.length === 0) {
    console.log(`No keywords found in subject: ${subject}`);
    return;
  }

  executeKeywordActions(typedEmailData, keywordActions);
}