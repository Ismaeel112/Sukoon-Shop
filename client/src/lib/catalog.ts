import { useCallback, useEffect, useState } from "react";
import { productArabicLabels, type Product } from "@/data/sukoon";

export type CatalogState = "loading" | "ready" | "error";

type CatalogResponse = { products?: unknown };

function isProduct(value: unknown): value is Product {
  return typeof value === "object" && value !== null &&
    typeof (value as Product).id === "string" &&
    typeof (value as Product).name === "string" &&
    typeof (value as Product).category === "string" &&
    typeof (value as Product).description === "string";
}

async function fetchCatalog(signal: AbortSignal): Promise<Product[]> {
  const response = await fetch("/api/shopify/catalog", { signal });
  let payload: CatalogResponse;

  try {
    payload = await response.json() as CatalogResponse;
  } catch {
    throw new Error("The catalog returned an invalid response.");
  }

  if (!response.ok || !Array.isArray(payload.products) || !payload.products.every(isProduct)) {
    throw new Error("The live Shopify catalog is unavailable.");
  }

  return payload.products.map((product) => ({
    ...product,
    arabic: productArabicLabels[product.id] ?? product.arabic ?? "",
  }));
}

export function useShopifyCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [state, setState] = useState<CatalogState>("loading");
  const [request, setRequest] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState("loading");

    fetchCatalog(controller.signal)
      .then((catalog) => {
        setProducts(catalog);
        setState("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setProducts([]);
          setState("error");
        }
      });

    return () => controller.abort();
  }, [request]);

  const retry = useCallback(() => setRequest((value) => value + 1), []);
  return { products, state, retry };
}
