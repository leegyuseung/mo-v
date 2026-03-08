export function parseCommaSeparatedTextInput(input: string): string[] | null {
  const parsed = input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : null;
}
