import { CopyButton } from "@/components/copy-button";
import { highlight } from "@/site/highlight";

/**
 * A block of code, highlighted at build time.
 *
 * Geometry is measured (reference spec §6.1 item 8): wrapper at radius 12
 * (`--site-radius-block`), a header carrying the language badge and the file path,
 * body at 13px on a 20px line, no line numbers.
 *
 * The HTML comes from Shiki on the server, so no highlighter reaches the browser;
 * `dangerouslySetInnerHTML` is how every Shiki integration hands it over, and the
 * input is this repository's own source files, never anything a visitor typed.
 *
 * NEXT EXECUTOR: §6.1 also asks for a collapse to 375px with an `h-32` gradient and
 * a «Show all» control. Not built — it is behaviour for the visual pass, and the
 * block is honest without it.
 */
export async function CodeBlock({
  code,
  lang,
  label,
}: {
  code: string;
  lang: string;
  /** Usually the file path this code was read from. */
  label?: string;
}) {
  const html = await highlight(code, lang);

  return (
    <div className="overflow-hidden rounded-site-block border border-site-border bg-bg-well">
      <div className="flex h-control-h-lg items-center gap-2 border-b border-site-border px-3">
        <span className="rounded-role-tag bg-film-2 px-2 py-px text-site-eyebrow text-text-2 uppercase">
          {lang}
        </span>
        {label ? (
          <span className="truncate font-site-mono text-site-code text-text-3">{label}</span>
        ) : null}
        <span className="ml-auto">
          <CopyButton text={code} label="Copy code" />
        </span>
      </div>
      <div
        className="overflow-x-auto p-4 font-site-mono text-site-code [&_pre]:bg-transparent!"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
