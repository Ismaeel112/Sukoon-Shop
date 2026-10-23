import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Instagram,
  Menu,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { heroImage, type Product, type ProductVariant } from "@/data/sukoon";
import { type CatalogState, useShopifyCatalog } from "@/lib/catalog";

const ALL_PIECES = "All pieces";
const money = (value: number, currencyCode = "GBP") =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: currencyCode }).format(value);

type CartLine = Product & {
  quantity: number;
  cartKey: string;
  selectedVariant?: ProductVariant;
};

type CollectionInfo = {
  title: ReactNode;
  intro: string;
  description: string;
};

const collectionInfo: Record<string, CollectionInfo> = {
  "Wall Art": {
    title: <>Wall Art,<br /><em>quietly held.</em></>,
    intro: "Quiet reminders for the spaces you call home.",
    description: "Quiet reminders for the spaces you call home.",
  },
  "Gift Sets": {
    title: <>Gifts with<br /><em>meaning.</em></>,
    intro: "Meaningful gifts, thoughtfully put together.",
    description: "Meaningful gifts, thoughtfully put together.",
  },
};

const pageTitles: Record<string, string> = {
  "/": "Sukoon | Make Room for Peace",
  "/shop": "Sukoon Collection | Peaceful Home Pieces",
  "/shop/wall-art": "Wall Art | Sukoon",
  "/shop/gift-sets": "Gift Sets | Sukoon",
  "/about": "About Sukoon | A Home for Meaning",
  "/contact": "Contact Sukoon",
  "/faq": "FAQs — Sukoon",
  "/shipping": "Shipping Policy — Sukoon",
  "/refunds": "Refund Policy — Sukoon",
  "/privacy": "Privacy Policy — Sukoon",
  "/terms": "Terms & Conditions — Sukoon",
};

const pageDescriptions: Record<string, string> = {
  "/": "Sukoon brings peaceful home pieces and Islamic calligraphy wall art together for a home that feels like yours.",
  "/shop": "Explore Sukoon's live collection of peaceful home pieces and Islamic wall art.",
  "/shop/wall-art": "Explore Sukoon Wall Art with live product details and current availability.",
  "/shop/gift-sets": "Discover Sukoon Gift Sets with live product details and current availability.",
  "/about": "Discover Sukoon, a calm and thoughtful home brand inspired by peace, faith and meaningful everyday living.",
  "/contact": "Contact Sukoon about home pieces, Islamic wall art, orders, delivery and future collections.",
  "/faq": "Find answers about Sukoon orders, delivery, returns and live collections.",
};

function categoriesInCatalog(products: Product[]) {
  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))];
  return categories.sort((a, b) => {
    const priority = ["Wall Art", "Gift Sets"];
    const aIndex = priority.indexOf(a);
    const bIndex = priority.indexOf(b);
    if (aIndex !== -1 || bIndex !== -1) return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
    return a.localeCompare(b);
  });
}

function describeCollection(category: string): CollectionInfo {
  return collectionInfo[category] ?? {
    title: <>{category},<br /><em>simply chosen.</em></>,
    intro: "Thoughtful pieces for the spaces and rituals that matter.",
    description: "Thoughtful pieces for the spaces and rituals that matter.",
  };
}

function CatalogNotice({
  state,
  empty = false,
  onRetry,
}: {
  state: CatalogState;
  empty?: boolean;
  onRetry?: () => void;
}) {
  if (state === "ready" && !empty) return null;

  const copy = state === "loading"
    ? "Loading the live Shopify collection…"
    : state === "error"
      ? "We couldn’t load the live collection just now."
      : "No products are published in this collection yet.";

  return (
    <div className="catalog-notice" role={state === "error" ? "alert" : "status"}>
      <span>{copy}</span>
      {state === "error" && onRetry && (
        <button className="catalog-retry" type="button" onClick={onRetry}>Try again</button>
      )}
    </div>
  );
}

function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Sukoon — peaceful homeware and Islamic calligraphy wall art">
      <img src="/brand/sukoon-logo.png" alt="Sukoon — peaceful homeware and Islamic calligraphy wall art" />
    </Link>
  );
}

function Header({ cartCount, onCart }: { cartCount: number; onCart: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigationId = "site-navigation";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="announcement">Free delivery over £100 <span>·</span> Bring peace into your space</div>
      <div className="nav-shell">
        <button
          className="mobile-menu"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-controls={navigationId}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Logo />
        <nav id={navigationId} className={menuOpen ? "open" : ""} aria-label="Main navigation">
          <Link href="/shop" onClick={close}>Shop</Link>
          <Link href="/about" onClick={close}>About</Link>
          <Link href="/contact" onClick={close}>Contact</Link>
        </nav>
        <button className="bag-button" type="button" onClick={onCart} aria-label={`Open shopping bag${cartCount ? `, ${cartCount} item${cartCount === 1 ? "" : "s"}` : ""}`}>
          <ShoppingBag size={18} />
          <span>Bag</span>
          {cartCount > 0 && <b>{cartCount}</b>}
        </button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <Logo />
          <p className="footer-note">Bring Peace<br />Into Your Space.</p>
          <p className="footer-contact"><a href="mailto:hello@sukoon.studio">hello@sukoon.studio</a></p>
        </div>
        <div className="footer-links">
          <div>
            <p className="eyebrow">Shop</p>
            <Link href="/shop/wall-art">Wall Art</Link>
            <Link href="/shop/gift-sets">Gift Sets</Link>
            <Link href="/shop">All pieces</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div>
            <p className="eyebrow">Information</p>
            <Link href="/shipping">Shipping policy</Link>
            <Link href="/refunds">Refund policy</Link>
            <Link href="/privacy">Privacy policy</Link>
            <Link href="/terms">Terms & conditions</Link>
          </div>
        </div>
        <div className="newsletter">
          <p className="eyebrow">Notes for peaceful spaces</p>
          <p>For collection updates and meaningful gifting ideas, email the studio directly.</p>
          <a className="text-link text-link-light" href="mailto:hello@sukoon.studio?subject=Sukoon%20updates">
            Email Sukoon <ArrowRight size={16} />
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Sukoon Studio</span>
        <span>Bring peace into your space</span>
        <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Sukoon on Instagram"><Instagram size={16} /></a>
      </div>
    </footer>
  );
}

function CartImage({ line }: { line: CartLine }) {
  if (line.image) return <img src={line.image} alt={line.name} />;
  return <div className="cart-line-image-fallback" aria-hidden="true"><span>{line.name.slice(0, 1)}</span></div>;
}

function CartDrawer({
  cart,
  setCart,
  onClose,
}: {
  cart: CartLine[];
  setCart: Dispatch<SetStateAction<CartLine[]>>;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const currencies = new Set(cart.map((line) => line.currencyCode ?? "GBP"));
  const mixedCurrencies = currencies.size > 1;
  const total = cart.reduce((sum, line) => sum + (line.price ?? 0) * line.quantity, 0);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  const updateQuantity = (cartKey: string, delta: number) => {
    setCart((lines) => lines
      .map((line) => line.cartKey === cartKey ? { ...line, quantity: Math.max(0, line.quantity + delta) } : line)
      .filter((line) => line.quantity > 0));
  };

  const trapFocus = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], select, input:not([disabled]), textarea:not([disabled])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="drawer-backdrop" onMouseDown={onClose}>
      <aside
        ref={dialogRef}
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-heading"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={trapFocus}
      >
        <div className="drawer-head">
          <div>
            <p className="eyebrow">Your selection</p>
            <h2 id="cart-heading">Your selection <span>({itemCount})</span></h2>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close shopping bag"><X size={20} /></button>
        </div>
        {cart.length === 0 ? (
          <div className="empty-cart">
            <span className="empty-icon"><ShoppingBag size={22} /></span>
            <h3>Your bag is waiting.</h3>
            <p>There is room here for something meaningful.</p>
            <Link href="/shop" onClick={onClose} className="text-link">View the collection <ArrowRight size={16} /></Link>
          </div>
        ) : (
          <>
            <div className="cart-lines">
              {cart.map((line) => (
                <div className="cart-line" key={line.cartKey}>
                  <CartImage line={line} />
                  <div>
                    <h3>{line.name}</h3>
                    {line.selectedVariant && <small>{line.selectedVariant.title}</small>}
                    <p>{money(line.price ?? 0, line.currencyCode)}</p>
                    <div className="quantity">
                      <button type="button" onClick={() => updateQuantity(line.cartKey, -1)} aria-label={`Remove one ${line.name}`}><Minus size={13} /></button>
                      <span>{line.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(line.cartKey, 1)} aria-label={`Add one ${line.name}`}><Plus size={13} /></button>
                    </div>
                  </div>
                  <strong>{money((line.price ?? 0) * line.quantity, line.currencyCode)}</strong>
                </div>
              ))}
            </div>
            <div className="drawer-total">
              <span>Subtotal</span>
              <strong>{mixedCurrencies ? "Multiple currencies" : money(total, cart[0]?.currencyCode)}</strong>
            </div>
            <button className="button button-dark full" type="button" disabled aria-describedby="checkout-notice">Checkout unavailable <ArrowRight size={16} /></button>
            <p className="secure-note" id="checkout-notice"><Sparkles size={14} /> Products are connected to Shopify. Checkout is not enabled yet.</p>
          </>
        )}
      </aside>
    </div>
  );
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (product: Product) => void }) {
  const available = product.availableForSale !== false && Boolean(product.variantId) && product.price !== undefined;

  return (
    <article className="product-card">
      <Link href={`/product/${product.id}`} className="product-image" aria-label={`View ${product.name}`}>
        {product.image ? <img src={product.image} alt={product.name} loading="lazy" /> : <div className="product-image-fallback"><span>{product.name}</span></div>}
        <span className="quick-add">View piece <ArrowRight size={15} /></span>
      </Link>
      <div className="product-meta">
        <div>
          <h3>{product.name}</h3>
          {product.arabic && <p className="arabic-label">{product.arabic}</p>}
        </div>
        {product.price !== undefined ? <strong>{money(product.price, product.currencyCode)}</strong> : <span className="product-status">Price unavailable</span>}
      </div>
      {available ? (
        <button className="product-add" type="button" onClick={() => onAdd(product)}>Add to bag <Plus size={15} /></button>
      ) : <span className="product-add product-status-link">Currently unavailable</span>}
    </article>
  );
}

function Home({
  onAdd,
  products,
  catalogState,
  onRetry,
}: {
  onAdd: (product: Product) => void;
  products: Product[];
  catalogState: CatalogState;
  onRetry: () => void;
}) {
  return (
    <main>
      <section className="hero hero-lifestyle" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="hero-overlay" />
        <div className="hero-copy hero-copy-light">
          <p className="eyebrow">Sukoon / suːˈkuːn /</p>
          <h1>Make room<br /><em>for peace.</em></h1>
          <p className="hero-lede">Thoughtful pieces for a home that feels like yours.</p>
          <div className="hero-actions"><Link href="/shop" className="button button-light">Explore the collection <ArrowRight size={16} /></Link></div>
        </div>
        <span className="hero-side-note">سكون <span>— peace at home</span></span>
      </section>

      <section className="studio-introduction">
        <div className="section-wrap studio-introduction-inner">
          <div className="studio-introduction-copy">
            <p className="eyebrow">The Sukoon way</p>
            <h2>Made to live<br /><em>with you.</em></h2>
            <p>We believe the pieces around you can make everyday moments feel softer, slower and more meaningful.</p>
            <Link href="/about" className="text-link">Discover our story <ArrowRight size={16} /></Link>
          </div>
          <div className="studio-principles" aria-label="Sukoon principles">
            <article>
              <span>01</span>
              <h3>Quietly considered</h3>
              <p>Thoughtful details, chosen to bring calm to the spaces you return to.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Rooted in meaning</h3>
              <p>Faith, warmth and intention shape every piece and every small ritual around it.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Made for home</h3>
              <p>Objects to live with slowly, gift with care and keep close for years to come.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="featured section-wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">Available now</p>
            <h2>Pieces for <em>everyday.</em></h2>
            <p className="section-support">A small selection of real pieces, ready to find their place.</p>
          </div>
          <Link href="/shop" className="text-link">Shop all <ArrowRight size={16} /></Link>
        </div>
        <CatalogNotice state={catalogState} empty={products.length === 0} onRetry={onRetry} />
        <div className="product-grid featured-grid">{products.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} />)}</div>
      </section>

      <section className="story-band">
        <div className="story-band-inner">
          <p className="eyebrow">A note from Sukoon</p>
          <h2>Sukoon is about the feeling you come home to.</h2>
          <p>A little more calm, a little more meaning, and space to slow down.</p>
          <Link href="/about" className="text-link">Our story <ArrowRight size={16} /></Link>
        </div>
      </section>
      <section className="closing-cta">
        <p className="eyebrow">Bring peace home</p>
        <h2>Find your <em>quiet.</em></h2>
        <p>Explore pieces chosen for slower mornings, thoughtful gifting and the spaces in between.</p>
        <Link href="/shop" className="button button-dark">Explore the collection <ArrowRight size={16} /></Link>
      </section>
    </main>
  );
}

function Shop({
  onAdd,
  collection,
  products,
  catalogState,
  onRetry,
}: {
  onAdd: (product: Product) => void;
  collection?: string;
  products: Product[];
  catalogState: CatalogState;
  onRetry: () => void;
}) {
  const requestedCategory = collection ?? ALL_PIECES;
  const [activeCategory, setActiveCategory] = useState(requestedCategory);
  const categories = useMemo(() => categoriesInCatalog(products), [products]);

  useEffect(() => setActiveCategory(requestedCategory), [requestedCategory]);

  const filtered = activeCategory === ALL_PIECES ? products : products.filter((product) => product.category === activeCategory);
  const details = activeCategory === ALL_PIECES
    ? { title: <>Pieces for<br /><em>peaceful spaces.</em></>, intro: "A small collection of pieces for home, reflection and everyday rituals." }
    : describeCollection(activeCategory);

  return (
    <main className="page-shell shop-page">
      <div className="page-intro">
        <p className="eyebrow">{activeCategory === ALL_PIECES ? "The collection" : activeCategory}</p>
        <h1>{details.title}</h1>
        <p>{details.intro}</p>
      </div>
      <div className="shop-toolbar">
        <div className="category-tabs" aria-label="Product collections">
          {[ALL_PIECES, ...categories].map((category) => (
            <button key={category} type="button" className={activeCategory === category ? "active" : ""} onClick={() => setActiveCategory(category)}>{category}</button>
          ))}
        </div>
        <span>{filtered.length} {filtered.length === 1 ? "piece" : "pieces"}</span>
      </div>
      <CatalogNotice state={catalogState} empty={filtered.length === 0} onRetry={onRetry} />
      <div className="product-grid shop-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} />)}</div>
    </main>
  );
}

function ProductPage({ product, onAdd }: { product?: Product; onAdd: (product: Product) => void }) {
  const [selectedVariantId, setSelectedVariantId] = useState(product?.variantId ?? product?.variants?.[0]?.id);

  useEffect(() => setSelectedVariantId(product?.variantId ?? product?.variants?.[0]?.id), [product?.id, product?.variantId, product?.variants]);

  if (!product) return <NotFoundPage />;

  const selectedVariant = product.variants?.find((variant) => variant.id === selectedVariantId) ?? product.variants?.[0];
  const selectedPrice = selectedVariant?.price ?? product.price;
  const canAdd = product.availableForSale !== false && selectedVariant?.availableForSale !== false && selectedPrice !== undefined && Boolean(selectedVariant?.id);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    offers: selectedPrice === undefined ? undefined : {
      "@type": "Offer",
      priceCurrency: selectedVariant?.currencyCode ?? product.currencyCode ?? "GBP",
      price: selectedPrice,
      availability: canAdd ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main className="product-page page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Link href="/shop" className="back-link">← Back to the collection</Link>
      <div className="product-detail">
        <div className="detail-image">
          {product.image ? <img src={product.image} alt={product.name} /> : <div className="product-image-fallback"><span>{product.name}</span></div>}
        </div>
        <div className="detail-copy">
          <p className="eyebrow">{product.category}{product.arabic ? ` / ${product.arabic}` : ""}</p>
          <h1>{product.name}</h1>
          <p className="detail-price">{selectedPrice === undefined ? "Price to be confirmed" : money(selectedPrice, selectedVariant?.currencyCode ?? product.currencyCode)}</p>
          <p>{product.description}</p>
          <div className="detail-rule" />
          {product.variants && product.variants.length > 0 && (
            <label className="variant-picker">
              {product.optionName || "Option"}
              <select value={selectedVariant?.id} onChange={(event) => setSelectedVariantId(event.target.value)}>
                {product.variants.map((variant) => (
                  <option key={variant.id} value={variant.id} disabled={variant.availableForSale === false}>
                    {variant.title} · {money(variant.price, variant.currencyCode)}{variant.availableForSale === false ? " · unavailable" : ""}
                  </option>
                ))}
              </select>
            </label>
          )}
          {canAdd ? (
            <>
              <button className="button button-dark full" type="button" onClick={() => onAdd({ ...product, variantId: selectedVariant?.id, price: selectedPrice, currencyCode: selectedVariant?.currencyCode ?? product.currencyCode, availableForSale: selectedVariant?.availableForSale })}>Add to bag <Plus size={16} /></button>
              <p className="secure-note"><Check size={14} /> Live Shopify product · checkout not enabled yet</p>
            </>
          ) : <p className="product-status">Currently unavailable.</p>}
        </div>
      </div>
    </main>
  );
}

type StaticPage = "about" | "contact" | "shipping" | "refunds" | "privacy" | "terms";
type PageCopy = { label: string; title: ReactNode; intro: string; body: string[]; quote?: string };

const textPages: Record<StaticPage, PageCopy> = {
  about: {
    label: "About",
    title: <>A home for <em>meaning.</em></>,
    intro: "Sukoon is about the feeling you come home to.",
    body: [
      "A little more calm, a little more meaning, and space to slow down. We choose Islamic art and everyday pieces with a warm, quiet point of view — things that feel at home in the spaces and rituals that matter most.",
      "Our name comes from the Arabic word sukoon, a feeling of calm and stillness. It is the thread through everything we do: a slower pace, fewer but better things, and a belief that beauty does not have to shout.",
    ],
    quote: "Come as you are. Leave a little lighter.",
  },
  contact: { label: "Contact", title: <>Let’s stay<br /><em>in touch.</em></>, intro: "Questions about a piece, your order, or a future idea? We’re here to help.", body: [] },
  shipping: { label: "Information", title: <>Shipping<br /><em>policy.</em></>, intro: "The short version: we pack carefully and send thoughtfully.", body: ["UK orders are dispatched within 2–4 working days via a tracked service. Delivery usually takes 2–3 working days after dispatch. You’ll receive tracking details by email when your order leaves our studio.", "International orders are welcome. Delivery times and duties vary by destination; any customs charges are the responsibility of the recipient. If your parcel arrives damaged, please email us within 48 hours with photographs so we can help."], quote: "Every order is wrapped like it is a gift — because it is." },
  refunds: { label: "Information", title: <>Refund<br /><em>policy.</em></>, intro: "We want you to love your Sukoon piece.", body: ["If something is not quite right, you can return unused, undamaged items within 14 days of delivery for a refund. Please email hello@sukoon.studio with your order number before sending anything back.", "Custom or personalised pieces cannot be returned unless they arrive damaged. Return postage is the responsibility of the customer, except where an item is faulty or incorrect."], quote: "Made with care, held to a high standard." },
  privacy: { label: "Details", title: <>Privacy<br /><em>policy.</em></>, intro: "A clear, respectful approach to your information.", body: ["We only collect the information needed to process orders, respond to enquiries, and keep you updated if you choose to join our mailing list. We do not sell your personal information.", "Sukoon uses trusted payment, delivery, and website partners to provide our service. You can ask to access, correct, or delete your personal information by emailing hello@sukoon.studio."], quote: "Clear, respectful, and never more than necessary." },
  terms: { label: "Details", title: <>Terms &<br /><em>conditions.</em></>, intro: "The essentials for shopping with Sukoon.", body: ["By placing an order, you confirm that the information provided is accurate and that you are authorised to use the chosen payment method. Product colours may vary slightly between screens and natural materials will carry their own character.", "All content on this website belongs to Sukoon Studio. We reserve the right to update product details, pricing, and these terms when needed. Nothing here affects your statutory rights."], quote: "Good things are built on clarity." },
};

function TextPage({ type }: { type: StaticPage }) {
  const content = textPages[type];
  return (
    <main className={`text-page page-shell ${type === "contact" ? "contact-page" : ""}`}>
      <div className="text-intro"><p className="eyebrow">{content.label}</p><h1>{content.title}</h1><p className="lead">{content.intro}</p></div>
      {type === "contact" ? <ContactDetails /> : <div className="text-body">{content.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{content.quote && <div className="text-quote">{content.quote}<span>— Sukoon</span></div>}</div>}
    </main>
  );
}

function ContactDetails() {
  return (
    <div className="contact-details contact-details-centered">
      <p className="eyebrow">Get in touch</p>
      <a href="mailto:hello@sukoon.studio">hello@sukoon.studio</a>
      <p>Monday–Friday<br />9am–5pm (GMT)</p>
      <a className="button button-dark" href="mailto:hello@sukoon.studio?subject=Enquiry%20for%20Sukoon">Email the studio <ArrowRight size={16} /></a>
      <p className="arabic-script">أهلاً بك</p>
    </div>
  );
}

function FaqPage() {
  const faqs = [
    ["When will my order arrive?", "UK orders are dispatched within 2–4 working days using a tracked service. Delivery usually takes a further 2–3 working days after dispatch."],
    ["Do you offer international delivery?", "International orders are welcome. Delivery times and any customs charges vary by destination; duties are the responsibility of the recipient."],
    ["Can I return an item?", "Unused and undamaged items can be returned within 14 days of delivery. Please email hello@sukoon.studio with your order number before sending anything back."],
    ["Why is a collection empty?", "Collections show only products published in the connected Shopify catalog. An empty page means no live products currently match that collection."],
    ["How can I contact Sukoon?", "Write to hello@sukoon.studio. We usually reply within 2 working days, Monday to Friday, 9am–5pm GMT."],
  ];

  return (
    <main className="text-page page-shell faq-page">
      <div className="text-intro"><p className="eyebrow">Information</p><h1>Questions,<br /><em>answered.</em></h1><p className="lead">A few useful details before you choose a piece.</p></div>
      <div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={17} /></summary><p>{answer}</p></details>)}</div>
    </main>
  );
}

function NotFoundPage() {
  return <main className="page-shell not-found"><p className="eyebrow">Oh dear</p><h1>That page has<br /><em>gone quiet.</em></h1><Link href="/" className="button button-dark">Back home <ArrowRight size={16} /></Link></main>;
}

export default function Storefront() {
  const [location] = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const { products, state: catalogState, retry } = useShopifyCatalog();
  const [, params] = useRoute("/product/:id");

  useEffect(() => window.scrollTo({ top: 0, behavior: "auto" }), [location]);
  useEffect(() => {
    if (!cartOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCartOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [cartOpen]);

  useEffect(() => {
    const product = location.startsWith("/product/") ? products.find((item) => item.id === location.split("/")[2]) : undefined;
    document.title = product ? `${product.name} — Sukoon` : pageTitles[location] || "Sukoon | Make Room for Peace";
    document.querySelector('meta[name="description"]')?.setAttribute("content", product?.description || pageDescriptions[location] || pageDescriptions["/"]);
  }, [location, products]);

  const addToCart = (product: Product) => {
    const selectedVariant = product.variants?.find((variant) => variant.id === product.variantId) ?? product.variants?.[0];
    if (product.availableForSale === false || selectedVariant?.availableForSale === false || product.price === undefined || !product.variantId) {
      toast.error("This piece is currently unavailable.");
      return;
    }

    const cartKey = `${product.id}:${product.variantId}`;
    setCart((lines) => {
      const existing = lines.find((line) => line.cartKey === cartKey);
      return existing
        ? lines.map((line) => line.cartKey === cartKey ? { ...line, quantity: line.quantity + 1 } : line)
        : [...lines, { ...product, quantity: 1, cartKey, selectedVariant }];
    });
    toast.success(`${product.name}${selectedVariant ? ` · ${selectedVariant.title}` : ""} added to your bag.`);
  };

  const cartCount = useMemo(() => cart.reduce((sum, line) => sum + line.quantity, 0), [cart]);
  const product = params ? products.find((item) => item.id === params.id) : undefined;
  const staticPageRoutes: Record<string, StaticPage> = { "/about": "about", "/contact": "contact", "/shipping": "shipping", "/refunds": "refunds", "/privacy": "privacy", "/terms": "terms" };

  let content: ReactNode = <Home onAdd={addToCart} products={products} catalogState={catalogState} onRetry={retry} />;
  if (location === "/shop") content = <Shop onAdd={addToCart} products={products} catalogState={catalogState} onRetry={retry} />;
  else if (location === "/shop/wall-art") content = <Shop onAdd={addToCart} collection="Wall Art" products={products} catalogState={catalogState} onRetry={retry} />;
  else if (location === "/shop/gift-sets") content = <Shop onAdd={addToCart} collection="Gift Sets" products={products} catalogState={catalogState} onRetry={retry} />;
  else if (location.startsWith("/product/")) content = catalogState === "ready" ? <ProductPage product={product} onAdd={addToCart} /> : <main className="page-shell product-page"><CatalogNotice state={catalogState} onRetry={retry} /></main>;
  else if (staticPageRoutes[location]) content = <TextPage type={staticPageRoutes[location]} />;
  else if (location === "/faq") content = <FaqPage />;
  else if (location !== "/") content = <NotFoundPage />;

  return <div className="site"><Header cartCount={cartCount} onCart={() => setCartOpen(true)} />{content}<Footer />{cartOpen && <CartDrawer cart={cart} setCart={setCart} onClose={() => setCartOpen(false)} />}</div>;
}
