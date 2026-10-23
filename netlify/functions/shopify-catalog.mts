import { getShopifyCatalog } from "../../server/shopify/catalog";

const headers = { "Cache-Control": "no-store" };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return Response.json(
      { message: "Method not allowed." },
      { status: 405, headers: { ...headers, Allow: "GET" } },
    );
  }

  
if (!process.env.SHOPIFY_STORE_DOMAIN) {
  return Response.json(
    { message: "The Shopify store domain is not configured on this deployment." },
    { status: 503, headers },
  );
}

  try {
    const products = await getShopifyCatalog();
    return Response.json({ products }, { headers });
  
} catch (error) {
  console.error("Shopify catalog error:", error);
  return Response.json(
    {
      message: "The Shopify product collection is unavailable.",
      error: error instanceof Error ? error.message : String(error),
    },
    { status: 502, headers },
  );
}

