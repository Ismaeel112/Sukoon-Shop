import type { Product } from "../../client/src/data/sukoon";

const SHOPIFY_API_VERSION = "2026-10";
const PRODUCTS_PER_PAGE = 100;
const VARIANTS_PER_PRODUCT = 250;
const MAX_PRODUCT_PAGES = 100;
const REQUEST_TIMEOUT_MS = 10_000;

const PRODUCT_CATALOG_QUERY = `
  query ShopifyCatalog($after: String) {
    products(first: ${PRODUCTS_PER_PAGE}, after: $after, sortKey: TITLE) {
      nodes {
        handle
        title
        description
        productType
        tags
        availableForSale
        featuredImage { url }
        options { name }
        collections(first: 100) { nodes { title handle } }
        variants(first: ${VARIANTS_PER_PRODUCT}) {
          nodes {
            id
            title
            availableForSale
            price { amount currencyCode }
          }
          pageInfo { hasNextPage }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
};

type ShopifyPageInfo = { hasNextPage: boolean; endCursor: string | null };

type ShopifyProduct = {
  handle: string;
  title: string;
  description: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  featuredImage: { url: string } | null;
  options: Array<{ name: string }>;
  collections: { nodes: Array<{ title: string; handle: string }> };
  variants: { nodes: ShopifyVariant[]; pageInfo: ShopifyPageInfo };
};

type ShopifyProductsPage = { nodes: ShopifyProduct[]; pageInfo: ShopifyPageInfo };
type ShopifyCatalogResponse = { data?: { products?: ShopifyProductsPage }; errors?: Array<{ message?: string }> };
type NetlifyRuntime = { env?: { get: (name: string) => string | undefined } };

function runtimeValue(name: string): string {
  const netlify = (globalThis as typeof globalThis & { Netlify?: NetlifyRuntime }).Netlify;
  return netlify?.env?.get(name) ?? process.env[name] ?? "";
}

function isCanonicalHostname(value: string): boolean {
  if (!value || value !== value.trim() || value !== value.toLowerCase() || value.endsWith(".")) return false;

  try {
    const parsed = new URL(`https://${value}`);
    return parsed.protocol === "https:" && parsed.hostname === value && parsed.host === value &&
      parsed.pathname === "/" && !parsed.search && !parsed.hash && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}

function getShopifyConfiguration(): { storeDomain: string; accessToken: string } {
  const storeDomain = runtimeValue("SHOPIFY_STORE_DOMAIN");
  const accessToken = runtimeValue("SHOPIFY_STOREFRONT_ACCESS_TOKEN");

  if (!isCanonicalHostname(storeDomain)) {
    throw new Error("SHOPIFY_STORE_DOMAIN must be a canonical hostname without a scheme, path, port, or query.");
  }
  if (!accessToken.trim()) throw new Error("SHOPIFY_STOREFRONT_ACCESS_TOKEN is required.");

  return { storeDomain, accessToken };
}

function storefrontTokenHeader(accessToken: string): "Shopify-Storefront-Private-Token" | "X-Shopify-Storefront-Access-Token" {
  return accessToken.startsWith("shpat_")
    ? "Shopify-Storefront-Private-Token"
    : "X-Shopify-Storefront-Access-Token";
}

export function isShopifyConfigurationError(error: unknown): boolean {
  return error instanceof Error && (
    error.message.startsWith("SHOPIFY_STORE_DOMAIN") ||
    error.message.startsWith("SHOPIFY_STOREFRONT_ACCESS_TOKEN")
  );
}

function categoryFor(product: ShopifyProduct): string {
  const categoryText = [
    ...product.collections.nodes.flatMap(({ title, handle }) => [title, handle]),
    ...product.tags,
    product.productType,
    product.title,
    product.handle,
  ].filter(Boolean).join(" ");

  if (/wall[-\s]*art/i.test(categoryText)) return "Wall Art";
  if (/\b(?:gift|set)\b/i.test(categoryText)) return "Gift Sets";
  return product.productType || "Home accents";
}

function mapVariant(variant: ShopifyVariant): ProductVariant {
  const price = Number(variant.price.amount);
  if (!Number.isFinite(price)) throw new Error(`Shopify variant ${variant.id} returned an invalid price.`);

  return { id: variant.id, title: variant.title, price, currencyCode: variant.price.currencyCode, availableForSale: variant.availableForSale };
}

type ProductVariant = NonNullable<Product["variants"]>[number];

function mapProduct(product: ShopifyProduct): Product {
  if (product.variants.pageInfo.hasNextPage) {
    throw new Error(`Shopify product ${product.handle} has more than ${VARIANTS_PER_PRODUCT} variants; variant limit reached.`);
  }

  const variants = product.variants.nodes.map(mapVariant);
  const defaultVariant = variants.find((variant) => variant.availableForSale) ?? variants[0];

  return {
    id: product.handle,
    variantId: defaultVariant?.id,
    name: product.title,
    arabic: "",
    category: categoryFor(product),
    price: defaultVariant?.price,
    currencyCode: defaultVariant?.currencyCode,
    availableForSale: product.availableForSale,
    optionName: product.options[0]?.name,
    description: product.description,
    image: product.featuredImage?.url,
    availability: product.availableForSale ? "Available now" : "Currently unavailable",
    variants,
  };
}

async function fetchCatalogPage(storeDomain: string, accessToken: string, after: string | null): Promise<ShopifyProductsPage> {
  const response = await fetch(`https://${storeDomain}/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", [storefrontTokenHeader(accessToken)]: accessToken },
    body: JSON.stringify({ query: PRODUCT_CATALOG_QUERY, variables: { after } }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) throw new Error(`Shopify Storefront API request failed with HTTP ${response.status}.`);

  let payload: ShopifyCatalogResponse;
  try {
    payload = await response.json() as ShopifyCatalogResponse;
  } catch {
    throw new Error("Shopify Storefront API returned an invalid JSON response.");
  }

  if (payload.errors?.length) {
    const messages = payload.errors.map((error) => error.message || "Unknown GraphQL error").join("; ");
    throw new Error(`Shopify Storefront API returned GraphQL errors: ${messages}`);
  }
  if (!payload.data?.products) throw new Error("Shopify Storefront API response did not include products.");

  return payload.data.products;
}

/** Reads the complete live Shopify catalog without a local product fallback. */
export async function getShopifyCatalog(): Promise<Product[]> {
  const { storeDomain, accessToken } = getShopifyConfiguration();
  const catalog: Product[] = [];
  let after: string | null = null;

  for (let pageNumber = 0; pageNumber < MAX_PRODUCT_PAGES; pageNumber += 1) {
    const page = await fetchCatalogPage(storeDomain, accessToken, after);
    catalog.push(...page.nodes.map(mapProduct));
    if (!page.pageInfo.hasNextPage) return catalog;
    if (pageNumber === MAX_PRODUCT_PAGES - 1) throw new Error(`Shopify product pagination exceeded the ${MAX_PRODUCT_PAGES}-page safety limit.`);
    if (!page.pageInfo.endCursor) throw new Error("Shopify product pagination indicated another page without an end cursor.");
    after = page.pageInfo.endCursor;
  }

  throw new Error("Shopify product pagination ended unexpectedly.");
}
