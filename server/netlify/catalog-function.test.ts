import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import handler from "../../netlify/functions/shopify-catalog.mts";
import { getShopifyCatalog } from "../shopify/catalog";

vi.mock("../shopify/catalog", () => ({ getShopifyCatalog: vi.fn() }));

const catalog = vi.mocked(getShopifyCatalog);

describe("Netlify Shopify catalog function", () => {
  beforeEach(() => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "example.myshopify.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN", "test-only-token");
    catalog.mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());

  it("returns live catalog JSON with no-store headers", async () => {
    const products = [{ id: "live-piece", name: "Live piece", category: "Wall Art", arabic: "", description: "From Shopify", price: 175 }];
    catalog.mockResolvedValue(products);
    const response = await handler(new Request("https://example.netlify.app/api/shopify/catalog"));
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/json");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({ products });
  });

  it("returns configuration JSON instead of HTML when runtime values are missing", async () => {
    vi.stubEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN", "");
    const response = await handler(new Request("https://example.netlify.app/api/shopify/catalog"));
    expect(response.status).toBe(503);
    expect(response.headers.get("Content-Type")).toContain("application/json");
    expect(catalog).not.toHaveBeenCalled();
  });

  it("returns a generic JSON error without leaking upstream errors or credentials", async () => {
    catalog.mockRejectedValue(new Error("upstream detail test-only-token"));
    const response = await handler(new Request("https://example.netlify.app/api/shopify/catalog"));
    expect(response.status).toBe(502);
    const body = await response.text();
    expect(body).not.toContain("test-only-token");
    expect(body).not.toContain("upstream detail");
  });

  it("rejects non-GET methods without calling Shopify", async () => {
    const response = await handler(new Request("https://example.netlify.app/api/shopify/catalog", { method: "POST" }));
    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("GET");
    expect(catalog).not.toHaveBeenCalled();
  });
});
