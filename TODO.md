# Sukoon — original website with live Shopify products

## Original import

- [x] Import the original ZIP website, preserving its CSS, layout, logo, hero, page routes and information content rather than using the replacement storefront.
- [x] Initial API-free import completed. The owner's later request now authorizes reconnecting the product catalog to the selected existing Shopify store.

## Live products

- [x] Load products, images, descriptions, prices, currencies, variants and availability from the selected Shopify store. Keep Shopify credentials server-side and preserve the existing React/Vite/Express framework and pnpm package manager.
- [x] Replace fake/local product listings and Gift Sets placeholder listings with live Shopify products on Home, Shop, collection and product detail pages. Do not seed, create or modify any Shopify products.
- [x] Show an honest loading, empty-collection or connection-error message when applicable. Never silently substitute the saved catalog or fabricated products after a live API error.
- [x] Preserve the original visual storefront and local shopping bag, using live variant IDs and sale availability. This request connects products only; checkout remains disabled and must clearly distinguish the connected catalog from the not-yet-enabled checkout flow.
- [x] Verify the live catalog against the selected store, typecheck and build the app, serve the server-backed Preview, and save the deliverable change to canonical main.

## Evidence

The owner selected **My Store 6**. The live Storefront API and the server catalog endpoint returned four published wall-art products with Shopify-hosted images and three variants each, all at GBP 175. No Gift Sets were returned, so that collection is empty instead of showing fake products.

The targeted Vitest suite passed five tests. `pnpm check` and `pnpm build` passed. The original 12-route manifest, homepage and health endpoint returned HTTP 200. The cloud Preview catalog endpoint returned HTTP 200 with all four live products. Managed Shopify credentials were absent from the API response and compiled frontend bundle.

The live integration commit was accepted on the project's canonical main branch. The editable server-backed Preview runs with the original `pnpm dev` command on port 3000. No publication was requested or initiated.

## Product image fit

- [x] Show each full product photograph at its original proportions in product cards, product details and collection cards, without cover cropping or hover magnification. Keep the existing layout and live Shopify catalog unchanged, and ensure bag thumbnails do not crop the product.

The production build passed. Browser inspection confirmed all four loaded Shopify product photographs use `object-fit: contain`, centered positioning, responsive padding and no transform magnification. Their original portrait proportions are retained within the existing card frames.

## Netlify product deployment

- [x] Serve `/api/shopify/catalog` through a bundled Netlify Function that reuses the existing live Shopify adapter. The API must return JSON and must not fall through to the SPA HTML redirect. Preserve Manus Preview and the existing product presentation.
- [x] Configure or document `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN` as server-side Netlify Function runtime variables, never frontend/VITE variables or committed credentials.
- [ ] Push the deployment fix to `Ismaeel112/Sukoon-Shop`, preserving existing history and remote changes. Verify the hosted catalog if Netlify deployment access permits, and report any remaining blocker accurately.

The nine targeted tests, TypeScript check and Netlify static build passed. GitHub commit `747df53` deployed the function successfully: the API now returns JSON instead of SPA HTML. The Shopify hostname is configured for production and Functions. A production-specific Storefront token update has been submitted through the authorized Netlify connector; the next deployment must be checked to confirm that the token reaches the function.
