import { generateText } from "ai";
import { getModel } from "./models";


export async function generate_response(prompt: string): Promise<string> {
  console.log("Generating response");
  try {
    const { text } = await generateText({
      model: getModel(),
      prompt: prompt,
      system:
        "Zwracasz jedynie tekst zgodnie z instrukcjami, bez żadnych dodatkowych komentarzy ani wyjaśnień.",
    });
    return text;
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
}
