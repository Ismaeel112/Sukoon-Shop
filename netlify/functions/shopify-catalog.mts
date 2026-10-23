import { getShopifyCatalog, isShopifyConfigurationError } from "../../server/shopify/catalog";

const headers = { "Cache-Control": "no-store" };

type CatalogLoader = typeof getShopifyCatalog;

export const config = { path: "/api/shopify/catalog" };

export function createCatalogHandler(loadCatalog: CatalogLoader = getShopifyCatalog) {
  return async function handler(request: Request): Promise<Response> {
    if (request.method !== "GET") {
      return Response.json(
        { message: "Method not allowed." },
        { status: 405, headers: { ...headers, Allow: "GET" } },
      );
    }

    try {
      return Response.json({ products: await loadCatalog() }, { headers });
    } catch (error) {
      const configurationError = isShopifyConfigurationError(error);
      return Response.json(
        {
          message: configurationError
            ? "The Shopify product connection is not configured on this deployment."
            : "The Shopify product collection is unavailable. Please try again shortly.",
        },
        { status: configurationError ? 503 : 502, headers },
      );
    }
  };
}

export default createCatalogHandler();
