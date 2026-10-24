import { generate_response } from "./utils";

const WYPOMINKI_FORMATTING_PROMPT = `Jesteś narzędziem do formatowania dokumentów. Twoim zadaniem jest sformatowanie tekstu "Wypominki" parafialnych w czysty, dobrze ustrukturyzowany Markdown.

Instrukcje:
1. Sformatuj dokument zgodnie z poprawną składnią Markdown
2. Zachowaj tytuły, nagłówki i strukturę tabel jeśli istnieją.
3. Ustal, czy dokument zawiera tabelę z porządkiem modlitw za zmarłych. Jeśli tak, zachowaj ją w czytelnej formie Markdown.
4. Nie dodawaj żadnych wyjaśnień ani komentarzy - zwróć jedynie markdown
5. Nie dodawaj metadanych.
6. Dla tytułu użyj nagłówka H3

<przykład sformatowanego dokumentu>
### Porządek Modlitw za Zmarłych – „Wypominki” – w Parafii Św. Marii Magdaleny 


| Data | Dzień tygodnia | Godzina | Ulice / Grupa, za którą są modlitwy |
| :--- | :--- | :--- | :--- |
| **3.11** | poniedziałek | 16:30 | Mickiewicza, Wiejska |

</przykład sformatowanego dokumentu>

UWAGA:
1. Często w nagłówku/stopce znajdują się informacje o parafii, księdzu, kontakcie itp. Zignoruj je, jeśli nie są niezbędne dla treści "Wypominek".
2. Nie dodawaj żadnych metadanych

<document do sformatowania>
{{document}}
</document do sformatowania>
`;

export async function formatWypominkiWithAI(rawText: string): Promise<string> {
  const prompt = WYPOMINKI_FORMATTING_PROMPT.replace("{{document}}", rawText);
  const response = await generate_response(prompt);
  return response.replace(/```/g, "").trim();
}
