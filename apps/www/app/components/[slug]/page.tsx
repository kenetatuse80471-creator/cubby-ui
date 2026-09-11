import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { CodeBlock } from "@/components/code-block";
import { ExampleTabs } from "@/components/example-tabs";
import { InstallBlock } from "@/components/install-block";
import { NewBadge } from "@/components/new-badge";
import { PreviewWell } from "@/components/preview-well";
import { PropsTable } from "@/components/props-table";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/registry/cubby/ui/button";
import { Icon } from "@/registry/cubby/ui/icon";
import { catalogNeighbours, catalogSlugs, entryIsNew, findCatalogEntry } from "@/site/catalog";
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

/**
 * One section of a component page.
 *
 * The rule separating them is measured (§1.3): a 1px alpha stroke, 20px of air
 * above it and 20 below. It is the only horizontal line on the page, and the first
 * section does without it — a rule under the description would read as a header
 * underline rather than as a divider.
 *
 * The heading carries the `id` the table of contents reads (`components/docs-toc.tsx`
 * collects `h2[id]` and `h3[id]` from the rendered page), so a section added here
 * appears in the right column without anyone maintaining a second list.
 */
function Section({
  id,
  title,
  tocLabel,
  aside,
  first,
  children,
}: {
  id: string;
  title: string;
  /** Shorter wording for the 256px column, when the heading is long. */
  tocLabel?: string;
  /** Right-hand side of the heading row — a file badge, usually. */
  aside?: ReactNode;
  first?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex scroll-mt-site-sticky flex-col gap-4",
        !first && "border-t border-site-border pt-5",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={id} data-toc-label={tocLabel} className="text-heading-h2 text-text-1">
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** The file an example lives in — monospace on a 13 % film, as measured (§1.1). */
function FileBadge({ path }: { path: string }) {
  return (
    <span className="rounded-role-tag bg-film-2 px-2 py-1 font-site-mono text-caption-sm text-text-2">
      {path}
    </span>
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

  return (
    <article className="flex flex-col gap-6">
      <nav aria-label="Breadcrumb" className="text-ui-md-regular text-text-2">
        <Link
          href="/components"
          className="transition-colors duration-(--site-dur-base) ease-site hover:text-text-1"
        >
          Components
        </Link>
        <span aria-hidden className="px-2 text-text-3">
          /
        </span>
        <span className="text-text-1">{item.title}</span>
      </nav>

      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-site-h1 font-semibold text-text-1">{item.title}</h1>
          {entryIsNew(entry) ? <NewBadge /> : null}
          {item.version ? (
            <span className="font-site-mono text-site-code text-text-3">v{item.version}</span>
          ) : null}
          {/*
            The page as plain text, for an agent. `/r/<slug>.md` is the markdown
            mirror this site already serves; a link is all it takes, and a link is
            honest in a way a «Copy page» button that silently writes to the
            clipboard is not.
          */}
          <a
            href={`/r/${entry.slug}.md`}
            className={cn(
              buttonVariants({ variant: "secondary", size: "compact" }),
              "sm:ml-auto",
            )}
          >
            View as Markdown
          </a>
        </div>
        <p className="max-w-site-lead text-site-lead text-text-body">{item.description}</p>
      </header>

      <div className="mt-4 flex flex-col gap-5">
        {exampleSources.map(({ example, source }, index) => (
          <Section
            key={example.id}
            id={`example-${example.id}`}
            title={example.title}
            aside={<FileBadge path={example.file} />}
            first={index === 0}
          >
            <ExampleTabs
              preview={
                <PreviewWell>
                  <example.Component />
                </PreviewWell>
              }
              code={
                <CodeBlock
                  code={source}
                  lang={codeLanguage(example.file)}
                  label={example.file}
                />
              }
            />
          </Section>
        ))}

        <Section id="install" title="Installation" first={exampleSources.length === 0}>
          <InstallBlock
            slug={entry.slug}
            dependencies={item.dependencies}
            files={item.files.map((file) => file.path)}
          />
          {/*
            The registry's own note for this item. It arrives as plain text with its
            own line breaks (`tokens` explains an import order that way), so it keeps
            them — inside a quiet panel rather than loose under the box, where a
            three-line `@import` listing reads like leftover output.
          */}
          {item.docs ? (
            <div className="rounded-site-block border border-site-border bg-film-1 px-4 py-3">
              <p className="whitespace-pre-line text-caption-sm text-text-2">{item.docs}</p>
            </div>
          ) : null}

          <h3
            id="dependencies"
            className="mt-2 text-heading-h3 scroll-mt-site-sticky text-text-1"
          >
            Dependencies
          </h3>
          <div className="flex flex-col gap-3">
            <DependencyRow label="Packages">
              {item.dependencies.length > 0 ? (
                item.dependencies.map((dependency) => (
                  <Chip key={dependency}>{dependencyName(dependency)}</Chip>
                ))
              ) : (
                <span className="text-caption-sm text-text-3">None.</span>
              )}
            </DependencyRow>
            <DependencyRow label="Registry">
              {item.registryDependencies.length > 0 ? (
                item.registryDependencies.map((dependency) => {
                  const dependencySlug = registryDependencySlug(dependency);
                  return (
                    <Link key={dependency} href={`/components/${dependencySlug}`}>
                      <Chip interactive>{dependencySlug}</Chip>
                    </Link>
                  );
                })
              ) : (
                <span className="text-caption-sm text-text-3">None.</span>
              )}
            </DependencyRow>
          </div>
        </Section>

        <Section id="source" title="Source">
          <div className="flex flex-col gap-4">
            {sources.map(({ file, source }) => (
              <CodeBlock
                key={file.path}
                code={source}
                lang={codeLanguage(file.path)}
                label={file.path}
              />
            ))}
          </div>
        </Section>

        {propDocs.length > 0 ? (
          <Section id="props" title="Props">
            <PropsTable docs={propDocs} />
          </Section>
        ) : null}
      </div>

      <nav
        aria-label="Neighbouring components"
        className="mt-4 grid grid-cols-1 gap-3 border-t border-site-border pt-5 sm:grid-cols-2"
      >
        {previous ? (
          <NeighbourLink
            href={`/components/${previous.slug}`}
            eyebrow="Previous"
            title={previous.item.title}
            direction="previous"
          />
        ) : (
          <span />
        )}
        {next ? (
          <NeighbourLink
            href={`/components/${next.slug}`}
            eyebrow="Next"
            title={next.item.title}
            direction="next"
          />
        ) : null}
      </nav>
    </article>
  );
}

function DependencyRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-site-eyebrow font-semibold text-text-3 uppercase">{label}</span>
      <span className="flex flex-wrap items-center gap-2">{children}</span>
    </div>
  );
}

function Chip({ children, interactive }: { children: ReactNode; interactive?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-control-h-sm items-center rounded-role-tag border border-site-border px-2",
        "font-site-mono text-site-code text-text-2",
        "transition-colors duration-(--site-dur-base) ease-site",
        interactive && "hover:border-site-border-strong hover:text-text-1",
      )}
    >
      {children}
    </span>
  );
}

/**
 * Previous / next. One box each, and the hover changes exactly one property — the
 * stroke, 5 % to 10 % (§5, technique 7). No lift, no shadow, no tint.
 */
function NeighbourLink({
  href,
  eyebrow,
  title,
  direction,
}: {
  href: string;
  eyebrow: string;
  title: string;
  direction: "previous" | "next";
}) {
  const forward = direction === "next";
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-site-block border border-site-border px-4 py-3",
        "transition-colors duration-(--site-dur-panel) ease-site hover:border-site-border-strong",
        forward && "sm:col-start-2 sm:flex-row-reverse sm:text-right",
      )}
    >
      <Icon
        icon={forward ? ArrowRight01Icon : ArrowLeft01Icon}
        size="lg"
        className="text-text-3"
      />
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-site-eyebrow font-semibold text-text-3 uppercase">{eyebrow}</span>
        <span className="truncate text-ui-md text-text-1">{title}</span>
      </span>
    </Link>
  );
}
