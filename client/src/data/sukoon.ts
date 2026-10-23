export type PlaceholderCollection = "Wall Art" | "Gift Sets";

export type ProductVariant = {
  id: string;
  title: string;
  price: number;
  currencyCode?: string;
  availableForSale?: boolean;
  inventoryQuantity?: number;
};

export type Product = {
  id: string;
  variantId?: string;
  name: string;
  arabic: string;
  category: string;
  price?: number;
  currencyCode?: string;
  availableForSale?: boolean;
  optionName?: string;
  description: string;
  image?: string;
  materials?: string;
  dimensions?: string;
  care?: string;
  availability?: string;
  variants?: ProductVariant[];
  isPlaceholder?: boolean;
  placeholderCollection?: PlaceholderCollection;
};

export const heroImage = "/images/sukoon/sukoon-hero-with-wall-art.png";
// The original gift-set photo was not included in the ZIP. Empty uses the existing placeholder visual.
export const giftSetImage = "";

const finishDetails = "Available in Heirloom, Sandstone and Obsidian finishes at £175.00 each.";
const wallArtCare = "Dust gently with a soft, dry cloth and keep away from direct moisture.";

export const liveProducts: Product[] = [
  {
    id: "allah-islamic-3d-wall-art",
    name: "ALLAH",
    arabic: "الله",
    category: "Wall Art",
    price: 175,
    variantId: "gid://shopify/ProductVariant/57788778709332",
    variants: [
      { id: "gid://shopify/ProductVariant/57788778709332", title: "Heirloom", price: 175, inventoryQuantity: 5 },
      { id: "gid://shopify/ProductVariant/57788778742100", title: "Sandstone", price: 175, inventoryQuantity: 5 },
      { id: "gid://shopify/ProductVariant/57788778774868", title: "Obsidian", price: 175, inventoryQuantity: 5 },
    ],
    description: `3D relief Arabic calligraphy wall art featuring the name of Allah, framed by floral motifs and geometric detailing. ${finishDetails}`,
    image: "/images/sukoon/original-wall-art-1.png",
    materials: "Sculpted stone-effect relief with an ornamental frame",
    dimensions: "Please see the selected Shopify product listing for current dimensions",
    care: wallArtCare,
    availability: "Saved catalog preview · stock is not synced",
  },
  {
    id: "ayat-ul-kursi-islamic-3d-wall-art",
    name: "AYAT-UL-KURSI",
    arabic: "آية الكرسي",
    category: "Wall Art",
    price: 175,
    variantId: "gid://shopify/ProductVariant/57788928229716",
    variants: [
      { id: "gid://shopify/ProductVariant/57788928229716", title: "Heirloom", price: 175, inventoryQuantity: 5 },
      { id: "gid://shopify/ProductVariant/57788928262484", title: "Obsidian", price: 175, inventoryQuantity: 5 },
      { id: "gid://shopify/ProductVariant/57788928295252", title: "Sandstone", price: 175, inventoryQuantity: 5 },
    ],
    description: `3D relief Ayat al-Kursi wall art with ornate Arabic calligraphy, floral motifs and geometric borders. ${finishDetails}`,
    image: "/images/sukoon/original-wall-art-2.png",
    materials: "Sculpted stone-effect relief with an ornamental frame",
    dimensions: "Please see the selected Shopify product listing for current dimensions",
    care: wallArtCare,
    availability: "Saved catalog preview · stock is not synced",
  },
  {
    id: "surah-an-nas-islamic-3d-wall-art",
    name: "SURAH AN-NAS",
    arabic: "سورة الناس",
    category: "Wall Art",
    price: 175,
    variantId: "gid://shopify/ProductVariant/57789016244564",
    variants: [
      { id: "gid://shopify/ProductVariant/57789016244564", title: "Obsidian", price: 175, inventoryQuantity: 5 },
      { id: "gid://shopify/ProductVariant/57789016277332", title: "Sandstone", price: 175, inventoryQuantity: 5 },
      { id: "gid://shopify/ProductVariant/57789016310100", title: "Heirloom", price: 175, inventoryQuantity: 5 },
    ],
    description: `3D relief Surah An-Nas wall art in elegant Arabic calligraphy, created as a meaningful reminder of faith and protection. ${finishDetails}`,
    image: "/images/sukoon/original-wall-art-3.png",
    materials: "Sculpted stone-effect relief with an ornamental frame",
    dimensions: "Please see the selected Shopify product listing for current dimensions",
    care: wallArtCare,
    availability: "Saved catalog preview · stock is not synced",
  },
  {
    id: "4-quls-islamic-3d-wall-art",
    name: "4 QULS",
    arabic: "السور الأربع",
    category: "Wall Art",
    price: 175,
    variantId: "gid://shopify/ProductVariant/57789057532244",
    variants: [
      { id: "gid://shopify/ProductVariant/57789057532244", title: "Sandstone", price: 175, inventoryQuantity: 5 },
      { id: "gid://shopify/ProductVariant/57789057565012", title: "Obsidian", price: 175, inventoryQuantity: 5 },
      { id: "gid://shopify/ProductVariant/57789057597780", title: "Heirloom", price: 175, inventoryQuantity: 5 },
    ],
    description: `3D relief Four Quls wall art bringing together four meaningful Qur’anic chapters in a refined Arabic calligraphy composition. ${finishDetails}`,
    image: "/images/sukoon/original-wall-art-4.png",
    materials: "Sculpted stone-effect relief with an ornamental frame",
    dimensions: "Please see the selected Shopify product listing for current dimensions",
    care: wallArtCare,
    availability: "Saved catalog preview · stock is not synced",
  },
];

const giftSetPlaceholders: Product[] = [
  ["the-everyday-gift-set", "The Everyday Gift Set"],
  ["the-moments-gift-set", "The Moments Gift Set"],
  ["the-sukoon-gift-set", "The Sukoon Gift Set"],
].map(([id, name]) => ({
  id,
  name,
  arabic: "قريباً",
  category: "Gift Sets",
  description: "A future gift collection, thoughtfully put together.",
  isPlaceholder: true,
  placeholderCollection: "Gift Sets",
}));

export const placeholderProducts: Product[] = giftSetPlaceholders;
export const products: Product[] = [...liveProducts, ...placeholderProducts];

export const categories = [
  { label: "All pieces", value: "All pieces" },
  { label: "Wall Art", value: "Wall Art" },
  { label: "Gift Sets", value: "Gift Sets" },
];
