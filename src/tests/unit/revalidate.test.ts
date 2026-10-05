import { existsSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const calls: { path: string; type?: string }[] = [];
vi.mock("next/cache", () => ({
  revalidatePath: (p: string, type?: string) => calls.push({ path: p, type }),
}));

const { revalidateCatalog, revalidateSettings } = await import(
  "@/lib/revalidate"
);

/**
 * A pattern only purges pages whose route file it names exactly, route
 * groups included. Get one character wrong and nothing fails: the edit just
 * never reaches the site. So each pattern is checked against the file tree.
 */
function routeFileFor(call: { path: string; type?: string }) {
  const file = call.type === "layout" ? "layout.tsx" : "page.tsx";
  return path.join(process.cwd(), "src/app", call.path, file);
}

describe("revalidate", () => {
  beforeEach(() => {
    calls.length = 0;
  });

  it("names the product page route file, (store) group included", () => {
    revalidateCatalog();
    const patterns = calls.filter((c) => c.type);
    expect(patterns.length).toBeGreaterThan(0);
    for (const c of patterns) {
      expect(existsSync(routeFileFor(c)), c.path).toBe(true);
    }
  });

  it("names the storefront layout that every page sits under", () => {
    revalidateSettings();
    expect(calls.length).toBeGreaterThan(0);
    for (const c of calls) {
      expect(c.type).toBe("layout");
      expect(existsSync(routeFileFor(c)), c.path).toBe(true);
    }
  });
});
