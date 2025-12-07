import { generate_response } from "./utils";

const POPE_INTENTIONS_FORMATTING_PROMPT = `Jesteś narzędziem do formatowania dokumentów. Twoim zadaniem jest sformatowanie tekstu Papieskich Intencji Apostolstwa Modlitwy w czysty, dobrze ustrukturyzowany Markdown.

Instrukcje:
1. Główny tytuł sformatuj jako Nagłówek H1 (np. "# Intencja Papieska do Modlitwy Różańcowej")
2. Datę (miesiąc i rok) pomiń.
4. Intencję ogólną (temat) sformatuj jako Nagłówek H2 (np. "## O umiejętność zapobiegania samobójstwom")
5. Pod intencją umieść treść modlitwy jako zwykły tekst.
6. Nie dodawaj żadnych wyjaśnień ani komentarzy - zwróć jedynie markdown.

UWAGA:
1. Zignoruj ewentualne nagłówki/stopki dokumentu, jeśli nie są częścią treści intencji.

<document do sformatowania>
{{document}}
</document do sformatowania>
`;

export async function formatPopeIntentionsWithAI(rawText: string): Promise<string> {
  const prompt = POPE_INTENTIONS_FORMATTING_PROMPT.replace("{document}", rawText);
  const response = await generate_response(prompt);
  return response.replace(/```/g, "").trim();
}

export async function extractMonthFromAttachment(
  attachment: string,
): Promise<string> {
  console.log("Extracting month from attachment text");
  const prompt = `Extract the month and year from the following text. If found, return it in the format "YYYY-MM". If not found, return current month and year in the same format.
Text: ${attachment}`;

  try {
    const response = await generate_response(prompt);
    const trimmedResponse = response.trim();
    console.log("Extracted month:", trimmedResponse);
    return trimmedResponse;
  } catch (error) {
    console.error("Error extracting date from subject:", error);
  }
  return new Date().toISOString().slice(0, 7);
}

