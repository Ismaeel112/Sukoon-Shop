import { describe, expect, it } from "vitest";
import handler, { config, createCatalogHandler } from "../../netlify/functions/shopify-catalog.mts";

const request = () => new Request("https://example.netlify.app/api/shopify/catalog");

describe("Netlify Shopify catalog function", () => {
  it("owns the public catalog path without depending on an SPA redirect", () => {
    expect(config.path).toBe("/api/shopify/catalog");
  });

  it("returns live catalog JSON with no-store headers", async () => {
    const products = [{ id: "live-piece", name: "Live piece", category: "Wall Art", arabic: "", description: "From Shopify", price: 175 }];
    const response = await createCatalogHandler(async () => products)(request());
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/json");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({ products });
  });

  it("returns configuration JSON when Shopify runtime values are absent", async () => {
    const response = await createCatalogHandler(async () => { throw new Error("SHOPIFY_STOREFRONT_ACCESS_TOKEN is required."); })(request());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ message: "The Shopify product connection is not configured on this deployment." });
  });

  it("returns a generic JSON error without leaking upstream errors or credentials", async () => {
    const response = await createCatalogHandler(async () => { throw new Error("upstream detail test-only-token"); })(request());
    expect(response.status).toBe(502);
    const body = await response.text();
    expect(body).not.toContain("test-only-token");
    expect(body).not.toContain("upstream detail");
  });

  it("rejects non-GET methods without calling Shopify", async () => {
    let called = false;
    const response = await createCatalogHandler(async () => { called = true; return []; })(new Request("https://example.netlify.app/api/shopify/catalog", { method: "POST" }));
    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("GET");
    expect(called).toBe(false);
  });

  it("exports a ready-to-use default handler", () => {
    expect(typeof handler).toBe("function");
  });
});
