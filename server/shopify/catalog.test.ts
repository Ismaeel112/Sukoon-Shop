import { afterEach, describe, expect, it, vi } from "vitest";
import { getShopifyCatalog } from "./catalog";

type ProductNodeOverrides = Partial<{
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  featuredImage: { url: string } | null;
  options: Array<{ name: string }>;
  collections: { nodes: Array<{ title: string; handle: string }> };
  variants: {
    nodes: Array<{
      id: string;
      title: string;
      availableForSale: boolean;
      price: { amount: string; currencyCode: string };
    }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}>;

function productNode(overrides: ProductNodeOverrides = {}) {
  return {
    id: "gid://shopify/Product/1",
    handle: "allah-wall-art",
    title: "ALLAH Islamic 3D Wall Art",
    description: "A live Shopify description.",
    productType: "Decor",
    tags: ["Faith"],
    availableForSale: true,
    featuredImage: { url: "https://cdn.shopify.com/allah.jpg" },
    options: [{ name: "Finish" }],
    collections: { nodes: [] },
    variants: {
      nodes: [
        {
          id: "gid://shopify/ProductVariant/1",
          title: "Heirloom",
          availableForSale: false,
          price: { amount: "175.00", currencyCode: "GBP" },
        },
        {
          id: "gid://shopify/ProductVariant/2",
          title: "Sandstone",
          availableForSale: true,
          price: { amount: "180.50", currencyCode: "GBP" },
        },
      ],
      pageInfo: { hasNextPage: false, endCursor: null },
    },
    ...overrides,
  };
}

function catalogResponse(
  nodes: ReturnType<typeof productNode>[],
  pageInfo = { hasNextPage: false, endCursor: null as string | null }
) {
  return new Response(
    JSON.stringify({ data: { products: { nodes, pageInfo } } }),
    { headers: { "Content-Type": "application/json" } }
  );
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("getShopifyCatalog", () => {
  it("maps live Shopify titles, images, prices, currencies, variants, options, and categories", async () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "shop.example.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN", "test-token");
    const request = vi.fn().mockResolvedValue(catalogResponse([productNode()]));
    vi.stubGlobal("fetch", request);

    await expect(getShopifyCatalog()).resolves.toEqual([
      {
        id: "allah-wall-art",
        variantId: "gid://shopify/ProductVariant/2",
        name: "ALLAH Islamic 3D Wall Art",
        arabic: "",
        category: "Wall Art",
        price: 180.5,
        currencyCode: "GBP",
        availableForSale: true,
        optionName: "Finish",
        description: "A live Shopify description.",
        image: "https://cdn.shopify.com/allah.jpg",
        availability: "Available now",
        variants: [
          {
            id: "gid://shopify/ProductVariant/1",
            title: "Heirloom",
            price: 175,
            currencyCode: "GBP",
            availableForSale: false,
          },
          {
            id: "gid://shopify/ProductVariant/2",
            title: "Sandstone",
            price: 180.5,
            currencyCode: "GBP",
            availableForSale: true,
          },
        ],
      },
    ]);

    expect(request).toHaveBeenCalledWith(
      "https://shop.example.com/api/2026-10/graphql.json",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": "test-token",
        },
        signal: expect.any(AbortSignal),
      })
    );
    expect(JSON.parse(request.mock.calls[0][1].body)).toMatchObject({
      variables: { after: null },
    });
  });

  it("traverses all product pages using the returned cursor", async () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "shop.example.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN", "test-token");
    const request = vi
      .fn()
      .mockResolvedValueOnce(
        catalogResponse([productNode({ handle: "first-piece" })], {
          hasNextPage: true,
          endCursor: "cursor-1",
        })
      )
      .mockResolvedValueOnce(
        catalogResponse([productNode({ handle: "second-piece" })])
      );
    vi.stubGlobal("fetch", request);

    const catalog = await getShopifyCatalog();

    expect(catalog.map((product) => product.id)).toEqual([
      "first-piece",
      "second-piece",
    ]);
    expect(request).toHaveBeenCalledTimes(2);
    expect(JSON.parse(request.mock.calls[1][1].body)).toMatchObject({
      variables: { after: "cursor-1" },
    });
  });

  it("throws on HTTP and GraphQL failures instead of returning a local catalog", async () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "shop.example.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN", "test-token");
    const request = vi.fn();
    vi.stubGlobal("fetch", request);

    request.mockResolvedValueOnce(new Response("Unavailable", { status: 503 }));
    await expect(getShopifyCatalog()).rejects.toThrow("HTTP 503");

    request.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ errors: [{ message: "Access denied" }] }),
        { headers: { "Content-Type": "application/json" } }
      )
    );
    await expect(getShopifyCatalog()).rejects.toThrow("GraphQL errors: Access denied");
  });

  it("returns an empty live catalog without falling back to local products", async () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "shop.example.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN", "test-token");
    const request = vi.fn().mockResolvedValue(catalogResponse([]));
    vi.stubGlobal("fetch", request);

    await expect(getShopifyCatalog()).resolves.toEqual([]);
  });

  it("uses product availability, falls back to the first variant, and derives Gift Sets", async () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "shop.example.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN", "test-token");
    const unavailable = productNode({
      handle: "ramadan-gift-set",
      title: "Ramadan keepsake",
      productType: "",
      tags: ["occasion"],
      availableForSale: false,
      featuredImage: null,
      options: [],
      variants: {
        nodes: [
          {
            id: "gid://shopify/ProductVariant/3",
            title: "Default Title",
            availableForSale: false,
            price: { amount: "20", currencyCode: "USD" },
          },
        ],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(catalogResponse([unavailable])));

    await expect(getShopifyCatalog()).resolves.toMatchObject([
      {
        id: "ramadan-gift-set",
        category: "Gift Sets",
        image: undefined,
        variantId: "gid://shopify/ProductVariant/3",
        price: 20,
        currencyCode: "USD",
        availableForSale: false,
        availability: "Currently unavailable",
      },
    ]);
  });
});
