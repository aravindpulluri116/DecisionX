export async function delay(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}
