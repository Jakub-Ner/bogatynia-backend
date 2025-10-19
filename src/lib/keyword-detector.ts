import ogloszeniaHandler  from './handlers/ogloszeniaHandler';

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

export interface KeywordAction {
  keyword: string;
  action: (emailData: EmailData) => Promise<void>;
}


export const EMAIL_KEYWORDS: KeywordAction[] = [
  {
    keyword: 'ogłoszenia',
    action: async (emailData) => {
        ogloszeniaHandler(emailData);
    }
  }
];

export function detectKeywords(subject: string): KeywordAction[] {
  const foundActions: KeywordAction[] = [];

  EMAIL_KEYWORDS.forEach(({ keyword, action }) => {
    if (subject.toLowerCase().includes(keyword)) {
      foundActions.push({ keyword, action });
    }
  });

  return foundActions;
}

export async function executeKeywordActions(emailData: EmailData, actions: KeywordAction[]): Promise<void> {
  for (const { keyword, action } of actions) {
    console.log(`Executing action for keyword: ${keyword}`);
    await action(emailData);
  }
}
