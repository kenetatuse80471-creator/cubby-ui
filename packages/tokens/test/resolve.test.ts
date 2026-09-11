import assert from "node:assert/strict";
import { test } from "node:test";

import {
  aliasTarget,
  buildIndex,
  cssVariableName,
  emittedValue,
  nameFromPath,
  parseCodeSyntax,
  resolveValue,
  TokenBuildError,
} from "../src/resolve.ts";
import type { Collection, TokensFile, Variable } from "../src/schema.ts";

/** Minimal well-formed export: two hidden primitives, a themed colour, a chain of aliases. */
function fixture(overrides: Partial<TokensFile> = {}): TokensFile {
  const primitives: Collection = {
    name: "Primitives",
    modes: ["Value"],
    hidden: true,
    variables: [
      variable("gray/920", "COLOR", { Value: "#17181A" }, null),
      variable("slate/0", "COLOR", { Value: "#FFFFFF" }, null),
    ],
  };
  const color: Collection = {
    name: "Color",
    modes: ["Dark", "Light"],
    variables: [
      variable(
        "color/bg/app",
        "COLOR",
        { Dark: { alias: "Primitives/gray/920" }, Light: { alias: "Primitives/slate/0" } },
        "var(--bg-app)",
      ),
      // alias into an alias: surface -> bg/app -> primitive
      variable(
        "color/bg/surface",
        "COLOR",
        { Dark: { alias: "Color/color/bg/app" }, Light: { alias: "Color/color/bg/app" } },
        "var(--bg-surface)",
      ),
    ],
  };
  const radius: Collection = {
    name: "Radius",
    modes: ["Value"],
    variables: [
      variable("radius/8", "FLOAT", { Value: 8 }, "var(--radius-md)"),
      variable("radius/role/control", "FLOAT", { Value: { alias: "Radius/radius/8" } }, "var(--radius-role-control)"),
    ],
  };
  return {
    $schema: "altis-design-tokens/1",
    meta: {},
    collections: [primitives, color, radius],
    textStyles: [],
    effectStyles: [],
    ...overrides,
  };
}

function variable(
  name: string,
  type: Variable["type"],
  values: Variable["values"],
  web: string | null,
  scopes: string[] = [],
): Variable {
  return { name, type, values, scopes, codeSyntax: { WEB: web } };
}

test("resolves an alias chain to the primitive literal, per mode", () => {
  const index = buildIndex(fixture());
  const surface = index.byKey.get("Color/color/bg/surface");
  assert.ok(surface);
  assert.equal(resolveValue(index, surface, "Dark"), "#17181A");
  assert.equal(resolveValue(index, surface, "Light"), "#FFFFFF");
});

test("follows a cross-collection alias into a single-mode collection", () => {
  const index = buildIndex(fixture());
  const app = index.byKey.get("Color/color/bg/app");
  assert.ok(app);
  // Dark on Color -> Value on Primitives
  const step = aliasTarget(index, app, "Dark");
  assert.equal(step?.entry.key, "Primitives/gray/920");
  assert.equal(step?.mode, "Value");
});

test("resolves alias-into-alias inside one single-mode collection", () => {
  const index = buildIndex(fixture());
  const role = index.byKey.get("Radius/radius/role/control");
  assert.ok(role);
  assert.equal(resolveValue(index, role, "Value"), 8);
});

test("a missing alias target fails the build", () => {
  const broken = fixture();
  broken.collections[1]!.variables[0]!.values["Dark"] = { alias: "Primitives/gray/999" };
  const index = buildIndex(broken);
  const app = index.byKey.get("Color/color/bg/app");
  assert.ok(app);
  assert.throws(() => resolveValue(index, app, "Dark"), (error: unknown) => {
    assert.ok(error instanceof TokenBuildError);
    assert.match(error.message, /alias target "Primitives\/gray\/999" does not exist/);
    return true;
  });
});

test("an alias cycle fails the build instead of hanging", () => {
  const looped = fixture();
  looped.collections[1]!.variables[0]!.values["Dark"] = { alias: "Color/color/bg/surface" };
  const index = buildIndex(looped);
  const app = index.byKey.get("Color/color/bg/app");
  assert.ok(app);
  assert.throws(() => resolveValue(index, app, "Dark"), /alias cycle/);
});

test("a mode that the alias target cannot supply fails the build", () => {
  const file = fixture();
  file.collections.push({
    name: "Density",
    modes: ["Compact", "Cozy"],
    variables: [variable("density/gap", "FLOAT", { Compact: 4, Cozy: 8 }, "var(--density-gap)")],
  });
  file.collections[2]!.variables.push(
    variable("radius/broken", "FLOAT", { Value: { alias: "Density/density/gap" } }, "var(--radius-broken)"),
  );
  const index = buildIndex(file);
  const broken = index.byKey.get("Radius/radius/broken");
  assert.ok(broken);
  assert.throws(() => resolveValue(index, broken, "Value"), /has no mode "Value"/);
});

test("emittedValue keeps the two-tier model: var() to a named token, literal to a primitive", () => {
  const index = buildIndex(fixture());
  const surface = index.byKey.get("Color/color/bg/surface");
  const app = index.byKey.get("Color/color/bg/app");
  assert.ok(surface && app);
  assert.deepEqual(
    { ...emittedValue(index, surface, "Dark"), target: undefined },
    { kind: "var", name: "--bg-app", target: undefined },
  );
  assert.deepEqual(emittedValue(index, app, "Dark"), { kind: "literal", value: "#17181A" });
});

test("hidden primitives get no CSS name at all", () => {
  const file = fixture();
  const primitives = file.collections[0]!;
  assert.equal(cssVariableName(primitives, primitives.variables[0]!), null);
});

test("naming rule: codeSyntax.WEB wins, otherwise the path minus its first segment", () => {
  assert.equal(parseCodeSyntax("var(--bg-app)", "x"), "--bg-app");
  assert.equal(nameFromPath("color/accent/wash"), "--accent-wash");
  assert.equal(nameFromPath("size/comp/menu-item"), "--comp-menu-item");
  assert.equal(nameFromPath("size/layout/window-h"), "--layout-window-h");
  assert.equal(nameFromPath("solo"), "--solo");
});

test("a codeSyntax.WEB that is not exactly var(--name) is a build error, never a guess", () => {
  assert.throws(() => parseCodeSyntax("--bg-app", "Color/color/bg/app"), /must be exactly/);
  assert.throws(() => parseCodeSyntax("var(--a, red)", "x"), /must be exactly/);
});

test("duplicate variable keys in the export are rejected", () => {
  const file = fixture();
  file.collections[2]!.variables.push(variable("radius/8", "FLOAT", { Value: 9 }, "var(--dupe)"));
  assert.throws(() => buildIndex(file), /Duplicate variable key/);
});
