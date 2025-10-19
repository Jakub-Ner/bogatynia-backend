import { generateText, generateObject } from "ai";
import { z } from "zod";
import { getModel } from "./models";

const OGLOSZENIA_FORMATTING_PROMPT = `Jesteś narzędziem do formatowania dokumentów. Twoim zadaniem jest sformatowanie tekstu polskich ogłoszeń parafialnych w czysty, dobrze ustrukturyzowany Markdown.

Instrukcje:
1. Sformatuj dokument zgodnie z poprawną składnią Markdown.
2. Wszystkie daty OZNACZ POGRUBIENIEM, używając składni **data**.
3. Życzenia i błogosławieństwa (zazwyczaj na końcu, takie jak "ŻYCZĘ WSZYSTKIM", "POKOJU", "RADOŚCI", "SZCZĘŚĆ BOŻE") OZNACZ KURSYWĄ, używając składni *tekst*.
4. Upewnij się, że do ogłoszeń nie zostały dodane żadne metadane
5. Nie dodawaj żadnych wyjaśnień ani komentarzy - zwróć jedynie markdown

UWAGA: 
1. Czesto w stópce albo w nagłówku znajdują się informacje o parafii, księdzu, kontakcie itp. Zignoruj te informacje i nie umieszczaj ich w sformatowanym dokumencie. 
2. Nie dodawaj żadnych metadanych

<document do sformatowania>
{{document}}
</document do sformatowania>
`;

const getClosestSunday = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  let daysUntilClosestSunday = -dayOfWeek;

  if (dayOfWeek > 3) {
    daysUntilClosestSunday += 7;
  }

  today.setDate(today.getDate() + daysUntilClosestSunday);

  return today.toISOString().split("T")[0];
};

const dateExtractionSchema = z.object({
  date: z
    .iso.date()
    .nullable()
    .describe(
      "The extracted date in ISO 8601 format (YYYY-MM-DD), or null if no date is found in the subject",
    ),
});

export async function extractDateFromSubject(subject: string): Promise<string> {
  console.log("Extracting date from subject:", subject);
  try {
    const { object } = await generateObject({
      model: getModel(),
      schema: dateExtractionSchema,
      prompt: `Extract the date from the email subject. If the date (formatted as DD.MM.YYYY, with Roman numerals permitted for the month) is found, convert it to ISO 8601 (YYYY-MM-DD); otherwise, return null.
Subject: ${subject}`,
    });

    if (object.date) {
      const date = object.date.toString();
      console.log("Extracted date:", date);
      return date;
    }
  } catch (error) {
    console.error("Error extracting date from subject:", error);
  }

  const date = getClosestSunday();
  console.log("No date found, defaulting to closest Sunday:", date);
  return date;
}

async function generate_response(prompt: string): Promise<string> {
  console.log("Generating response");
  try {
    const { text } = await generateText({
      model: getModel(),
      prompt: prompt,
      system:
        "Jesteś konwerterem tekstu na markdown. Zwracasz jedynie markdown zgodnie z instrukcjami, bez żadnych dodatkowych komentarzy ani wyjaśnień.",
    });
    return text;
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
}

export async function formatOgloszeniaWithAI(rawText: string): Promise<string> {
  const prompt = OGLOSZENIA_FORMATTING_PROMPT.replace("{document}", rawText);
  const response = await generate_response(prompt);
  return response.replace(/```/g, "").trim();
}
