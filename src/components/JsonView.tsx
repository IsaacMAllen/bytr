import { useMemo } from "react";
import { prettyJSON } from "@/lib/utils";

/**
 * Lightweight syntax highlighter for compact JSON blocks.
 *
 * We deliberately avoid pulling in `react-json-view` / `react18-json-view` /
 * Prism — they each add a few hundred KB and we only need three colours
 * (key / string / number).  Tokenising on a regex keeps the bundle tight.
 */
export function JsonView({ value }: { value: unknown }) {
  const html = useMemo(() => syntaxHighlight(prettyJSON(value, 2)), [value]);
  return (
    <pre
      className="code overflow-x-auto whitespace-pre rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-slate-200"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function syntaxHighlight(json: string): string {
  const escaped = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(
    /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "text-amber-300"; // numbers
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? "text-sky-300" : "text-emerald-300";
      } else if (/true|false/.test(match)) {
        cls = "text-violet-300";
      } else if (/null/.test(match)) {
        cls = "text-rose-300";
      }
      return `<span class="${cls}">${match}</span>`;
    },
  );
}
