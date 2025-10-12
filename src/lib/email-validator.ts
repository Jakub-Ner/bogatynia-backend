import dotenv from 'dotenv';

dotenv.config();

export function isTrustedEmail(fromEmail: string): boolean {
  const trustedEmails = process.env.TRUSTED_EMAILS?.split(',') || [];

  return trustedEmails.some(email =>
    email.trim().toLowerCase() === fromEmail.trim().toLowerCase()
  );
}

export function validateEmailData(emailData: any): boolean {
  return emailData &&
         emailData.From &&
         emailData.Subject;
}
