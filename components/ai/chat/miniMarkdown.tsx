import type { ReactNode } from "react";

/**
 * Minimal, safe markdown renderer for assistant replies. Supports only what the
 * model actually emits: paragraphs, unordered bullet lists (`- ` / `* `), and
 * inline **bold**. Everything else renders as plain text.
 *
 * Safety: output is built exclusively from React elements and text nodes — never
 * `dangerouslySetInnerHTML` — so any HTML in the model output is escaped and
 * shown literally rather than executed. No sanitizer dependency needed.
 */

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  // Split on **bold** spans; odd indices are the bold captures.
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={`${keyPrefix}-b${i}`} className="font-semibold text-atlas-navy">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

type Block = { type: "p"; text: string } | { type: "ul"; items: string[] };

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: "p", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length > 0) {
      blocks.push({ type: "ul", items: list });
      list = [];
    }
  };

  for (const line of lines) {
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1].trim());
    } else if (line.trim() === "") {
      flushParagraph();
      flushList();
    } else {
      flushList();
      paragraph.push(line.trim());
    }
  }
  flushParagraph();
  flushList();
  return blocks;
}

export function MiniMarkdown({ text }: { text: string }) {
  const blocks = parseBlocks(text);
  return (
    <>
      {blocks.map((block, i) =>
        block.type === "ul" ? (
          <ul key={`blk-${i}`} className="my-1 list-disc space-y-1 pl-5">
            {block.items.map((item, j) => (
              <li key={`blk-${i}-${j}`}>{renderInline(item, `blk-${i}-${j}`)}</li>
            ))}
          </ul>
        ) : (
          <p key={`blk-${i}`} className="my-1 first:mt-0 last:mb-0">
            {renderInline(block.text, `blk-${i}`)}
          </p>
        )
      )}
    </>
  );
}
