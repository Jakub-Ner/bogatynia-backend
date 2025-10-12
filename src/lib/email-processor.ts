import { isTrustedEmail, validateEmailData } from './email-validator';
import { detectKeywords, executeKeywordActions } from './keyword-detector';

export async function processIncomingEmail(emailData: any): Promise<void> {
  if (!validateEmailData(emailData)) {
    console.log('Invalid email data received');
    return;
  }

  const fromEmail = emailData.From;
  const subject = emailData.Subject;

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

  executeKeywordActions(emailData, keywordActions);
}