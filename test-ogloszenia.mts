import { formatAnnouncementsWithAI, extractDateFromSubject } from "./src/lib/ai/ogloszenia";
import { readFileSync } from "fs";

async function main() {
  const raw = readFileSync("output.md", "utf8");
  const result = await formatAnnouncementsWithAI(raw);
  console.log(result);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
