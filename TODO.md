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
- [x] Push the deployment fix to `Ismaeel112/Sukoon-Shop`, preserving existing history and remote changes. Verify the hosted catalog if Netlify deployment access permits, and report any remaining blocker accurately.

GitHub commits `ad11b2c` and `130875c` removed the conflicting route rewrite and added Shopify private-token authentication. The Shopify hostname and private Storefront token are configured for Netlify Functions in production. Production verification returned HTTP 200 JSON with all four published Shopify products.

## Streamline and code correction

- [x] Preserve the original Sukoon visual identity and only live Shopify products, while removing local placeholder products, stale saved-catalog availability text, and empty collection promotion from the customer journey.
- [x] Make Home and Shop derive visible collections from the live catalog so unavailable categories are not promoted. Keep direct collection URLs honest and show a clear empty state when no published pieces match.
- [x] Simplify the client structure by retaining only the small local enhancement data needed for live products, moving catalog loading into a focused hook, and removing unused app providers and dead product fields.
- [x] Correct storefront interaction details: reset scroll on route changes, close mobile navigation after navigation, expose menu state to assistive technology, support Escape to close the bag, report the cart's total item quantity consistently, and avoid broken bag imagery when a product has no image.
- [x] Reconcile newer GitHub Netlify catalog changes before committing. Verify all tests, TypeScript, production builds, route manifest, current catalog behavior, and push the completed changes to the existing `Ismaeel112/Sukoon-Shop` main branch without overwriting newer remote history.

Validated locally: TypeScript passed; all 17 automated tests passed; the production build passed; all 12 declared routes and the live catalog endpoint returned HTTP 200; Preview rendered four live products with `object-fit: contain` and no transform zoom. The local bag returned correct dialog semantics and closed with Escape.

## Final Netlify catalog route

- [x] Remove the duplicate `/api/shopify/catalog` rewrite, so Netlify invokes the function's declared custom path directly rather than forwarding to its unavailable default URL. Keep the SPA fallback for customer pages only. With the owner-provided secret present for Functions and Production, deploy the fix and verify that the public catalog endpoint returns JSON products rather than HTML or a configuration error.

## Netlify private Storefront token

- [x] Detect the owner-created private `shpat_` Storefront token and send it with Shopify's private-token request header, while retaining the public-token header used by the managed Manus Preview connection. Redeploy and verify that the Netlify endpoint returns published live products instead of the current HTTP 502 upstream error.

Verified after deploy: `https://sukoonuk.netlify.app/api/shopify/catalog` returned HTTP 200 JSON with all four published wall-art products.
