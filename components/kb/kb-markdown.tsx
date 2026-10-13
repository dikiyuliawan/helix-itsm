import type { ReactNode } from "react";

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${keyPrefix}-b-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return <span key={`${keyPrefix}-t-${index}`}>{part}</span>;
  });
}

export function KbMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  let ordered = false;

  const flushList = (key: string) => {
    if (list.length === 0) return;
    const items = list.map((item, index) => (
      <li key={`${key}-li-${index}`}>{renderInline(item, `${key}-${index}`)}</li>
    ));
    blocks.push(
      ordered ? (
        <ol
          key={key}
          className="ml-5 list-decimal space-y-1.5 text-sm text-muted-foreground"
        >
          {items}
        </ol>
      ) : (
        <ul
          key={key}
          className="ml-5 list-disc space-y-1.5 text-sm text-muted-foreground"
        >
          {items}
        </ul>
      ),
    );
    list = [];
  };

  lines.forEach((raw, index) => {
    const line = raw.trimEnd();
    const key = `block-${index}`;

    if (/^##\s+/.test(line)) {
      flushList(`${key}-pre`);
      blocks.push(
        <h2
          key={key}
          className="mt-6 font-heading text-base font-semibold tracking-tight text-foreground first:mt-0"
        >
          {renderInline(line.replace(/^##\s+/, ""), key)}
        </h2>,
      );
      return;
    }

    if (/^-\s+/.test(line)) {
      if (ordered) flushList(`${key}-switch`);
      ordered = false;
      list.push(line.replace(/^-\s+/, ""));
      return;
    }

    if (/^\d+\.\s+/.test(line)) {
      if (!ordered) flushList(`${key}-switch`);
      ordered = true;
      list.push(line.replace(/^\d+\.\s+/, ""));
      return;
    }

    flushList(`${key}-flush`);

    if (line.trim() === "") return;

    blocks.push(
      <p key={key} className="text-sm leading-relaxed text-muted-foreground">
        {renderInline(line, key)}
      </p>,
    );
  });

  flushList("block-final");

  return <div className="space-y-3">{blocks}</div>;
}
