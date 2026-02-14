export function normalizeName(input: string): string {
  if (!input) return "";

  return input
    .trim()
    .split(/\s+/) // split on whitespace
    .map((word) =>
      word
        .split("-")
        .map((part) =>
          part.length === 0
            ? part
            : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join("-")
    )
    .join(" ");
}
