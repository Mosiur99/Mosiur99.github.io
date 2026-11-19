export interface TextPart {
  text: string;
  strong: boolean;
}

/** Splits text marked with **double asterisks** into plain and bold parts. */
export function splitEmphasis(text: string): TextPart[] {
  const parts = text.split('**');
  if (parts.length % 2 === 0) throw new Error(`Unclosed ** in: ${text}`);
  return parts
    .map((part, index) => ({ text: part, strong: index % 2 === 1 }))
    .filter((part) => part.text.length > 0);
}
