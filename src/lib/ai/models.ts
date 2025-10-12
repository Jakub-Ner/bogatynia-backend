import { createAzure } from "@ai-sdk/azure";

const AZURE_BASE_URL = process.env.AZURE_BASE_URL;
const AZURE_API_KEY = process.env.AZURE_API_KEY;
const AZURE_DEPLOYMENT_NAME = process.env.AZURE_DEPLOYMENT_NAME || "gpt-4o";

export function getModel() {
  if (!AZURE_BASE_URL || !AZURE_API_KEY) {
    throw new Error(
      "AZURE_BASE_URL and AZURE_API_KEY environment variables must be set",
    );
  }

  const azure = createAzure({
    baseURL: AZURE_BASE_URL,
    apiKey: AZURE_API_KEY,
  });

  return azure(AZURE_DEPLOYMENT_NAME);
}
