import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const testDir = dirname(fileURLToPath(import.meta.url));

const badgeDocsPath = resolve(
  testDir,
  "../../../kumo-docs-astro/src/pages/components/badge.astro",
);

const badgeSourcePath = resolve(
  testDir,
  "../../src/components/badge/badge.tsx",
);

const badgeRegistryPath = resolve(testDir, "../../ai/component-registry.json");

describe("Badge documentation", () => {
  it("documents the success variant in the page examples", () => {
    const badgeDocs = readFileSync(badgeDocsPath, "utf8");

    expect(badgeDocs).toContain('BadgeSuccessDemo,');
    expect(badgeDocs).toContain('<Badge variant="success">Success</Badge>');
    expect(badgeDocs).toContain('<h4 class="mb-3 text-base font-medium">Success</h4>');
  });

  it("documents the success variant in the component metadata source", () => {
    const badgeSource = readFileSync(badgeSourcePath, "utf8");

    expect(badgeSource).toContain(
      '* - `"success"` — Success or positive state indicator',
    );
  });

  it("keeps generated badge registry descriptions aligned with the source docs", () => {
    const badgeRegistry = readFileSync(badgeRegistryPath, "utf8");

    expect(badgeRegistry).toContain(
      '- `\\"success\\"` — Success or positive state indicator',
    );
  });
});
