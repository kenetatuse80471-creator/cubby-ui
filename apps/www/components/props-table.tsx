import type { ComponentPropsDoc } from "@/site/props";

/**
 * One table per component exported by the file.
 *
 * Wrapped in the same frame-and-surface pair as a preview (§5, technique 3;
 * reactbits applies it to `.prop-table-frame` too): frame radius 14 with 4px of
 * padding, surface radius 10 in the page's own colour. Type is measured — head 12
 * uppercase with the eyebrow's wide tracking, cells 13 — and the row divider is the
 * shell's alpha stroke, not a grey rule, so it fades out on a light background
 * instead of turning into a grid.
 */
export function PropsTable({ docs }: { docs: ComponentPropsDoc[] }) {
  if (docs.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {docs.map((doc) => (
        <div key={doc.displayName} className="flex flex-col gap-3">
          <h3
            id={`props-${doc.displayName}`}
            className="scroll-mt-site-sticky font-site-mono text-body-md text-text-1"
          >
            {doc.displayName}
          </h3>
          <div className="rounded-role-surface bg-film-1 p-1 inset-shadow-site-highlight">
            <div className="overflow-x-auto rounded-role-card border border-site-border bg-bg-app">
              <table className="w-full min-w-comp-popover-panel border-collapse text-left">
                <thead>
                  <tr className="border-b border-site-border">
                    {["Prop", "Type", "Default", "Description"].map((head) => (
                      <th
                        key={head}
                        scope="col"
                        className="px-4 py-3 text-site-eyebrow font-semibold text-text-3 uppercase"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {doc.props.map((prop) => (
                    <tr key={prop.name} className="border-b border-site-border last:border-b-0">
                      <td className="px-4 py-3 align-top font-site-mono text-site-code whitespace-nowrap text-text-1">
                        {prop.name}
                        {prop.required ? (
                          <span className="text-danger" title="Required">
                            {" *"}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 align-top font-site-mono text-site-code text-text-2">
                        {prop.type}
                      </td>
                      <td className="px-4 py-3 align-top font-site-mono text-site-code text-text-3">
                        {prop.defaultValue ?? "—"}
                      </td>
                      <td className="max-w-comp-empty-text px-4 py-3 align-top text-caption-sm text-text-2">
                        {prop.description || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
