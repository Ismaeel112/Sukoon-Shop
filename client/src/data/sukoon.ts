export type ProductVariant = {
  id: string;
  title: string;
  price: number;
  currencyCode?: string;
  availableForSale?: boolean;
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
  availability?: string;
  variants?: ProductVariant[];
};

export const heroImage = "/images/sukoon/sukoon-hero-with-wall-art.png";

// Editorial labels supplement live Shopify product data; they are not a product fallback catalog.
export const productArabicLabels: Record<string, string> = {
  "allah-islamic-3d-wall-art": "الله",
  "ayat-ul-kursi-islamic-3d-wall-art": "آية الكرسي",
  "surah-an-nas-islamic-3d-wall-art": "سورة الناس",
  "4-quls-islamic-3d-wall-art": "السور الأربع",
};
