/** Sponsor model name shown in product UI (hackathon / judge-facing). */
export const AI_SPONSOR_NAME = "Gemini";

/** User-safe message when the server AI provider is not configured. */
export function aiSponsorNotConfiguredMessage(): string {
  return `${AI_SPONSOR_NAME} AI is not configured on the server.`;
}
