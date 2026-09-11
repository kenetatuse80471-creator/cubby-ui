import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CodeBlock } from "@/components/code-block";
import { InstallCommand } from "@/components/install-command";
import { NewBadge } from "@/components/new-badge";
import { PropsTable } from "@/components/props-table";
import {
  catalogByGroup,
  catalogNeighbours,
  catalogSlugs,
  entryIsNew,
  findCatalogEntry,
} from "@/site/catalog";
import { examplesFor, readExampleSource } from "@/site/examples";
import { getComponentProps } from "@/site/props";
import { dependencyName, registryDependencySlug } from "@/site/registry-data";
import { codeLanguage, readRepoFile } from "@/site/source-files";

export const dynamic = "force-static";

export function generateStaticParams() {
  return catalogSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = findCatalogEntry(slug);
  if (!entry) return {};
  return {
    title: entry.item.title,
    description: entry.item.description,
    alternates: { canonical: `/components/${entry.slug}` },
  };
}

/** The catalogue, as the left column. Part of the shell the next executor restyles. */
function CatalogueNav({ current }: { current: string }) {
  return (
    <nav aria-label="Components" className="flex flex-col gap-5">
      {catalogByGroup().map(({ group, entries }) => (
        <div key={group.id} className="flex flex-col gap-1">
          <span className="px-2 text-site-eyebrow text-text-3 uppercase">{group.title}</span>
          {entries.map((entry) => (
            <Link
              key={entry.slug}
              href={`/components/${entry.slug}`}
              aria-current={entry.slug === current ? "page" : undefined}
              className={
                entry.slug === current
                  ? "rounded-role-control bg-film-2 px-2 py-1 text-ui-md text-text-1"
                  : "rounded-role-control px-2 py-1 text-ui-md-regular text-text-2 hover:bg-film-1 hover:text-text-1"
              }
            >
              {entry.item.title}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

/** «On this page» — the right column. Built from the very sections rendered below. */
function OnThisPage({ sections }: { sections: { id: string; title: string }[] }) {
  return (
    <nav aria-label="On this page" className="flex flex-col gap-2">
      <span className="text-site-eyebrow text-text-3 uppercase">On this page</span>
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="text-ui-md-regular text-text-2 hover:text-text-1"
        >
          {section.title}
        </a>
      ))}
    </nav>
  );
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = findCatalogEntry(slug);
  if (!entry) notFound();

  const { item } = entry;
  const examples = examplesFor(entry.slug);
  const exampleSources = examples
    ? await Promise.all(
        examples.map(async (example) => ({ example, source: await readExampleSource(example) })),
      )
    : [];
  const sources = await Promise.all(
    item.files.map(async (file) => ({ file, source: await readRepoFile(file.path) })),
  );
  const propDocs = item.files.flatMap((file) => getComponentProps(file.path));
  const { previous, next } = catalogNeighbours(entry.slug);

  const sections = [
    ...exampleSources.map(({ example }) => ({
      id: `example-${example.id}`,
      title: example.title,
    })),
    { id: "install", title: "Install" },
    { id: "source", title: "Source" },
    { id: "dependencies", title: "Dependencies" },
    ...(propDocs.length > 0 ? [{ id: "props", title: "Props" }] : []),
  ];

  return (
    /*
     * Three columns, measured: sidebar 240, content 816, «On this page» 256, gutter 32
     * (reference spec §6.1). Those add up to 1376, which is wider than the spec's own
     * 1280 container — on the references the docs shell is full-bleed and only the
     * landing is capped, so that is what happens here: no `max-w-site` on this row,
     * and the content column carries the 816 cap itself.
     */
    <div className="mx-auto flex w-full gap-site-gutter px-site-gutter py-site-section-top">
      <aside className="hidden w-site-sidebar shrink-0 lg:block">
        <div className="sticky top-site-header">
          <CatalogueNav current={entry.slug} />
        </div>
      </aside>

      <article className="flex min-w-0 max-w-site-content flex-1 flex-col gap-10">
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-site-h2 text-text-1">{item.title}</h1>
            {entryIsNew(entry) ? <NewBadge /> : null}
            {item.version ? (
              <span className="font-site-mono text-site-code text-text-3">v{item.version}</span>
            ) : null}
          </div>
          <p className="text-body-md text-text-body">{item.description}</p>
        </header>

        {/*
          NEXT EXECUTOR: preview and code are two stacked blocks on purpose. The
          registry's own `Tabs` primitive is not in `main` yet; when it is, wrap each
          example below in one `Tabs` with a «Preview» and a «Code» panel — the pair is
          already there (`exampleSources` holds the rendered component and the source of
          the very same file), so only the container changes. Spec §6.1 item 4 describes
          the pill: radius `--radius-full`, height 40, padding 4.
        */}
        {exampleSources.map(({ example, source }) => (
          <section key={example.id} id={`example-${example.id}`} className="flex flex-col gap-3">
            <h2 className="text-heading-h2 text-text-1">{example.title}</h2>
            <div className="flex min-h-comp-surface-header items-center justify-center rounded-site-well border border-site-border bg-bg-surface p-8 inset-shadow-site-highlight">
              <example.Component />
            </div>
            <CodeBlock code={source} lang={codeLanguage(example.file)} label={example.file} />
          </section>
        ))}

        <section id="install" className="flex flex-col gap-3">
          <h2 className="text-heading-h2 text-text-1">Install</h2>
          <InstallCommand slug={entry.slug} />
          {item.docs ? (
            <p className="whitespace-pre-line text-caption-sm text-text-2">{item.docs}</p>
          ) : null}
        </section>

        <section id="source" className="flex flex-col gap-3">
          <h2 className="text-heading-h2 text-text-1">Source</h2>
          {sources.map(({ file, source }) => (
            <details key={file.path}>
              <summary className="cursor-pointer rounded-site-block px-3 py-2 font-site-mono text-site-code text-text-2 hover:bg-film-1 hover:text-text-1">
                {file.path}
              </summary>
              <div className="pt-3">
                <CodeBlock code={source} lang={codeLanguage(file.path)} label={file.path} />
              </div>
            </details>
          ))}
        </section>

        <section id="dependencies" className="flex flex-col gap-4">
          <h2 className="text-heading-h2 text-text-1">Dependencies</h2>
          <div className="flex flex-col gap-2">
            <span className="text-site-eyebrow text-text-3 uppercase">Packages</span>
            {item.dependencies.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {item.dependencies.map((dependency) => (
                  <li
                    key={dependency}
                    className="rounded-site-block border border-site-border-strong px-2 py-1 font-site-mono text-site-code text-text-2"
                  >
                    {dependencyName(dependency)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-caption-sm text-text-2">No external packages.</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-site-eyebrow text-text-3 uppercase">Registry</span>
            {item.registryDependencies.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {item.registryDependencies.map((dependency) => {
                  const dependencySlug = registryDependencySlug(dependency);
                  return (
                    <li key={dependency}>
                      <Link
                        href={`/components/${dependencySlug}`}
                        className="inline-block rounded-site-block border border-site-border-strong px-2 py-1 font-site-mono text-site-code text-text-2 hover:text-text-1"
                      >
                        {dependencySlug}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-caption-sm text-text-2">Nothing else from the registry.</p>
            )}
          </div>
        </section>

        {propDocs.length > 0 ? (
          <section id="props" className="flex flex-col gap-3">
            <h2 className="text-heading-h2 text-text-1">Props</h2>
            <PropsTable docs={propDocs} />
          </section>
        ) : null}

        <nav className="flex items-center justify-between gap-4 border-t border-site-border pt-6">
          {previous ? (
            <Link
              href={`/components/${previous.slug}`}
              className="flex flex-col gap-1 text-ui-md-regular text-text-2 hover:text-text-1"
            >
              <span className="text-site-eyebrow text-text-3 uppercase">Previous</span>
              {previous.item.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/components/${next.slug}`}
              className="flex flex-col items-end gap-1 text-ui-md-regular text-text-2 hover:text-text-1"
            >
              <span className="text-site-eyebrow text-text-3 uppercase">Next</span>
              {next.item.title}
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>

      <aside className="hidden w-site-toc shrink-0 xl:block">
        <div className="sticky top-site-header">
          <OnThisPage sections={sections} />
        </div>
      </aside>
    </div>
  );
}
