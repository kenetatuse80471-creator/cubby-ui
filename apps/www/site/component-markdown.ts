import { findCatalogEntry } from "@/site/catalog";
import { examplesFor, readExampleSource } from "@/site/examples";
import { getComponentProps } from "@/site/props";
import { GITHUB_URL, installCommandFor, pageUrlFor, SITE_URL } from "@/site/site";
import { codeLanguage, readOptionalRepoFile } from "@/site/source-files";

/**
 * The markdown mirror of a component page, served at `/r/<slug>.md`.
 *
 * Adapted from beUI (`lib/component-markdown.ts`), MIT, Copyright (c) 2026 Saurabh
 * Chauhan — see THIRD-PARTY-NOTICES.md: the document's shape (front matter, install,
 * dependencies, usage, API reference, source) is theirs. Its content comes from this
 * repository's own catalogue and registry.
 *
 * It exists for the readers that do not run JavaScript: an agent asked to install a
 * component gets the install line, the usage and the props in one plain-text fetch,
 * instead of parsing the HTML page.
 */

function escapeTableCell(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
}

function propsSection(filePath: string) {
  const docs = getComponentProps(filePath);
  if (docs.length === 0) return [];

  const lines: string[] = [];
  for (const doc of docs) {
    lines.push(`### ${doc.displayName}`, "");
    lines.push("| Prop | Type | Default | Required | Description |");
    lines.push("| --- | --- | --- | --- | --- |");
    for (const prop of doc.props) {
      lines.push(
        `| \`${prop.name}\` | \`${escapeTableCell(prop.type)}\` | ` +
          `${prop.defaultValue ? `\`${escapeTableCell(prop.defaultValue)}\`` : "—"} | ` +
          `${prop.required ? "Yes" : "No"} | ${escapeTableCell(prop.description) || "—"} |`,
      );
    }
    lines.push("");
  }
  return lines;
}

export async function buildComponentMarkdown(slug: string) {
  const entry = findCatalogEntry(slug);
  if (!entry) return null;

  const { item } = entry;
  const pageUrl = pageUrlFor(entry.slug);
  const examples = examplesFor(entry.slug);

  const lines: string[] = [
    "---",
    `title: ${JSON.stringify(item.title)}`,
    `description: ${JSON.stringify(item.description)}`,
    `group: ${JSON.stringify(entry.group)}`,
    `version: ${JSON.stringify(item.version ?? "unversioned")}`,
    `documentation: ${JSON.stringify(pageUrl)}`,
    `markdown: ${JSON.stringify(`${SITE_URL}/r/${entry.slug}.md`)}`,
    `registry: ${JSON.stringify(`${SITE_URL}/r/${entry.slug}.json`)}`,
    `license: ${JSON.stringify("MIT")}`,
    "---",
    "",
    `# ${item.title}`,
    "",
    `> ${item.description}`,
    "",
    "## Install",
    "",
    "```bash",
    installCommandFor(entry.slug),
    "```",
    "",
  ];

  if (item.docs) lines.push("## Notes", "", item.docs, "");

  lines.push("## Dependencies", "");
  lines.push(
    item.dependencies.length > 0
      ? item.dependencies.map((dependency) => `- \`${dependency}\``).join("\n")
      : "No external packages.",
  );
  lines.push("");

  if (item.registryDependencies.length > 0) {
    lines.push("## Registry dependencies", "");
    lines.push(item.registryDependencies.map((dependency) => `- \`${dependency}\``).join("\n"));
    lines.push("");
  }

  if (examples) {
    lines.push("## Usage", "");
    for (const example of examples) {
      const source = await readExampleSource(example);
      lines.push(`### ${example.title}`, "", `\`\`\`${codeLanguage(example.file)}`, source.trim(), "```", "");
    }
  }

  const propsLines = item.files.flatMap((file) => propsSection(file.path));
  if (propsLines.length > 0) lines.push("## Props", "", ...propsLines);

  lines.push("## Source", "");
  for (const file of item.files) {
    const source = await readOptionalRepoFile(file.path);
    if (!source) continue;
    lines.push(`### \`${file.path}\``, "", `\`\`\`${codeLanguage(file.path)}`, source.trim(), "```", "");
  }

  lines.push(`- Page: ${pageUrl}`, `- Repository: ${GITHUB_URL}`, "");

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}
