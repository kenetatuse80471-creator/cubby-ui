import type { ComponentPropsDoc } from "@/site/props";

/** One table per component exported by the file. Plain, scrollable, no decoration. */
export function PropsTable({ docs }: { docs: ComponentPropsDoc[] }) {
  if (docs.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {docs.map((doc) => (
        <div key={doc.displayName} className="flex flex-col gap-2">
          <h3 className="text-heading-h3 text-text-1">{doc.displayName}</h3>
          <div className="overflow-x-auto rounded-site-block border border-site-border">
            <table className="w-full min-w-comp-popover-panel border-collapse text-left">
              <thead>
                <tr className="border-b border-site-border bg-film-1">
                  <th className="px-3 py-2 text-site-eyebrow font-semibold text-text-2 uppercase">Prop</th>
                  <th className="px-3 py-2 text-site-eyebrow font-semibold text-text-2 uppercase">Type</th>
                  <th className="px-3 py-2 text-site-eyebrow font-semibold text-text-2 uppercase">Default</th>
                  <th className="px-3 py-2 text-site-eyebrow font-semibold text-text-2 uppercase">Description</th>
                </tr>
              </thead>
              <tbody>
                {doc.props.map((prop) => (
                  <tr key={prop.name} className="border-b border-site-border last:border-b-0">
                    <td className="px-3 py-2 align-top font-site-mono text-site-code text-text-1">
                      {prop.name}
                      {prop.required ? <span className="text-danger"> *</span> : null}
                    </td>
                    <td className="px-3 py-2 align-top font-site-mono text-site-code text-text-2">
                      {prop.type}
                    </td>
                    <td className="px-3 py-2 align-top font-site-mono text-site-code text-text-3">
                      {prop.defaultValue ?? "—"}
                    </td>
                    <td className="max-w-comp-empty-text px-3 py-2 align-top text-caption-sm text-text-2">
                      {prop.description || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
