# Original Sukoon website — live Shopify products

This project uses the original website imported from `Sukoon-Shop-main.zip`, not the earlier replacement design. The original layout, CSS visual rules, logo, hero and information pages are retained.

The owner has now connected **My Store 6** and requested live Shopify products. The active catalog is fetched from Shopify on page load through the server's `/api/shopify/catalog` route. Product names, images, descriptions, prices, currency, variants and availability are live; saved local products and the old Gift Sets placeholder listings are not used as a fallback. The saved Arabic labels are retained as brand presentation metadata for matching products only.

Edit presentation and editorial copy in `client/src/pages/Storefront.tsx`, styles in `client/src/index.css`, and the live catalog adapter in `server/shopify/catalog.ts`. Original assets remain in `client/public/brand/` and `client/public/images/sukoon/`.

Run `pnpm dev` to start the server-backed editable Preview on port 3000. Run `pnpm check`, `pnpm exec vitest run server/shopify/catalog.test.ts` and `pnpm build` for checks and the full production build. `pnpm dev:static` alone is no longer sufficient for the live catalog because it does not run the catalog API route.

Only products published to the connected Shopify storefront are shown. Gift Sets is empty when no gift-set products are published; the site does not fabricate placeholder products. This request connects products only: checkout remains disabled. Newsletter and enquiry forms remain presentation-only with explicit feedback.

Historical deployment documents in the ZIP describe the old integration. Current managed deployment uses the existing Dockerfile backend and static frontend with `/api/*` routed to the server. Shopify credentials are managed runtime configuration and must never be committed or returned to the browser.
