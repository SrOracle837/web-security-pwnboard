"use client";

/**
 * Renders text with inline `code` backticks and ```code blocks``` as styled elements.
 */
export default function FormattedText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  // Split on code blocks (```...```) first, then inline backticks (`...`)
  const parts: { type: "text" | "code-block" | "inline-code"; content: string }[] = [];

  // Handle triple-backtick code blocks
  const blockRegex = /```([^`]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = blockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: "code-block", content: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }

  // Now process inline backticks within text parts
  const finalParts: { type: "text" | "code-block" | "inline-code"; content: string }[] = [];

  for (const part of parts) {
    if (part.type !== "text") {
      finalParts.push(part);
      continue;
    }

    const inlineRegex = /`([^`]+?)`/g;
    let inlineLastIndex = 0;
    let inlineMatch;

    while ((inlineMatch = inlineRegex.exec(part.content)) !== null) {
      if (inlineMatch.index > inlineLastIndex) {
        finalParts.push({ type: "text", content: part.content.slice(inlineLastIndex, inlineMatch.index) });
      }
      finalParts.push({ type: "inline-code", content: inlineMatch[1] });
      inlineLastIndex = inlineMatch.index + inlineMatch[0].length;
    }

    if (inlineLastIndex < part.content.length) {
      finalParts.push({ type: "text", content: part.content.slice(inlineLastIndex) });
    }
  }

  return (
    <span className={className}>
      {finalParts.map((part, i) => {
        if (part.type === "code-block") {
          return (
            <pre
              key={i}
              className="my-2 px-3 py-2 bg-subtle rounded-lg font-mono text-xs text-foreground overflow-x-auto whitespace-pre"
            >
              {part.content}
            </pre>
          );
        }
        if (part.type === "inline-code") {
          return (
            <code
              key={i}
              className="px-1.5 py-0.5 bg-subtle rounded text-[0.85em] font-mono text-foreground"
            >
              {part.content}
            </code>
          );
        }
        return <span key={i}>{part.content}</span>;
      })}
    </span>
  );
}
