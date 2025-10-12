import ogloszeniaHandler  from './handlers/ogloszeniaHandler';


export interface KeywordAction {
  keyword: string;
  action: (emailData: any) => void;
}


export const EMAIL_KEYWORDS: KeywordAction[] = [
  {
    keyword: 'ogłoszenia',
    action: (emailData) => {
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

export function executeKeywordActions(emailData: any, actions: KeywordAction[]): void {
  actions.forEach(({ keyword, action }) => {
    console.log(`Executing action for keyword: ${keyword}`);
    action(emailData);
  });
}
