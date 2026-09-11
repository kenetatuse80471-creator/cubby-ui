import { CodeShell } from "@/components/code-shell";
import { highlight } from "@/site/highlight";

/**
 * A block of code, highlighted at build time.
 *
 * The HTML comes from Shiki on the server, so no highlighter reaches the browser;
 * `dangerouslySetInnerHTML` is how every Shiki integration hands it over, and the
 * input is this repository's own source files, never anything a visitor typed.
 * Everything interactive around it — the copy button, the collapse — lives in
 * `CodeShell`, which is the client half.
 *
 * When a block collapses: 18 lines at 13/20 is 360px, just under the measured
 * 375px cap (§1.4), so anything longer is worth folding and anything shorter would
 * gain a control that saves no space.
 */
const COLLAPSE_ABOVE_LINES = 18;

export async function CodeBlock({
  code,
  lang,
  label,
  collapsible = true,
}: {
  code: string;
  lang: string;
  /** Usually the file path this code was read from. */
  label?: string;
  /** `false` for a one-line command, where a collapse would be theatre. */
  collapsible?: boolean;
}) {
  const trimmed = code.trimEnd();
  const html = await highlight(trimmed, lang);
  const lines = trimmed.split("\n").length;

  return (
    <CodeShell
      lang={lang}
      label={label}
      copyText={trimmed}
      collapsible={collapsible && lines > COLLAPSE_ABOVE_LINES}
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </CodeShell>
  );
}
