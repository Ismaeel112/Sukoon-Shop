# Sukoon on Netlify

## Why products were missing

The frontend loads live products from `/api/shopify/catalog`. The original Netlify configuration deployed only static Vite files and redirected every unknown URL to `index.html`. The product API therefore returned HTML instead of Shopify catalog JSON. The Express server used by Manus Preview does not automatically run on Netlify's static hosting.

## Catalog function

`netlify/functions/shopify-catalog.mts` now calls the existing `server/shopify/catalog.ts` adapter. `netlify.toml` bundles that function with esbuild and routes `/api/shopify/catalog` to it **before** the SPA catch-all. Both Manus and Netlify therefore use the same live product mapping; no saved-catalog or fake-product fallback is added.

Netlify must build the full repository from `Ismaeel112/Sukoon-Shop`, branch `main`. Keep the repository root as the base directory, use the committed build command, publish `dist/public`, and retain `netlify/functions` as the functions directory. A drag-and-drop upload of only `dist/public` is not sufficient for the catalog function.

## Runtime configuration

In Netlify's environment-variable settings, configure `SHOPIFY_STORE_DOMAIN` as the canonical Shopify hostname and `SHOPIFY_STOREFRONT_ACCESS_TOKEN` as the connected store's Storefront token. Their scope must include **Functions** and the relevant deploy context. Do not use an Admin token, do not prefix these with `VITE_`, and do not put credentials into `netlify.toml`, `.env` files committed to GitHub, or browser code.

Manus's managed runtime variables are not automatically transferred to Netlify by a GitHub push. Configure Netlify's server-side environment separately, then redeploy so the function receives the new values. With this same-origin function, `VITE_API_BASE_URL`, a separate Express host, and cross-origin CORS settings are not needed for products.

A successful deployment returns JSON with a `products` array at `/api/shopify/catalog`. Missing runtime configuration returns JSON with HTTP 503; upstream Shopify failures return JSON with HTTP 502, without leaking credentials. Only Shopify products published to the connected storefront channel appear.

This fix connects products only. Checkout remains disabled, and newsletter/contact submissions remain presentation-only. Manus Preview continues to use its existing Express route and `pnpm dev` startup.

## Official references

- [Netlify Functions endpoint and module conventions](https://www.netlify.com/knowledge-base/how-to-add-a-backend-api-endpoint-with-netlify-functions/)
- [Netlify file-based configuration, functions and redirects](https://docs.netlify.com/build/configure-builds/file-based-configuration/)
- [Netlify Function runtime environment variables](https://docs.netlify.com/build/functions/environment-variables/)
