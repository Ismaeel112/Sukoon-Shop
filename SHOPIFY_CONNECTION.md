# Live Shopify catalog

The owner selected the existing store **My Store 6** through Manus's Shopify integration. The managed Storefront connection returned four published wall-art products with images and three variants each, priced in GBP. No Gift Sets were returned. This task reads products only; it does not create or modify Shopify products, and it does not enable checkout.

The original React/Vite/Express framework is preserved. Catalog requests are made server-side with managed `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN` runtime values. Credentials must not be committed or returned to the browser. Home, Shop and product detail pages use the live catalog, without local/fake-product fallback after errors.

API documentation verified for Shopify Storefront **2026-10**:

- [Product catalog and pagination](https://shopify.dev/docs/api/storefront/latest/queries/products)
- [Product fields](https://shopify.dev/docs/api/storefront/latest/objects/Product)
- [Variant prices, currency and sale availability](https://shopify.dev/docs/api/storefront/latest/objects/ProductVariant)

Only products published to the connected storefront channel are returned. Unpublished or draft products may remain visible in Shopify Admin but are not available through this storefront catalog.
