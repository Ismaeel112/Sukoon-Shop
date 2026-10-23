import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, ChevronDown, Instagram, Menu, Minus, Plus, ShoppingBag, Sparkles, X } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { categories, heroImage, liveProducts as savedProductDetails, Product, ProductVariant } from "@/data/sukoon";

const money = (value: number, currencyCode = "GBP") => new Intl.NumberFormat("en-GB", { style: "currency", currency: currencyCode }).format(value);
type CatalogState = "loading" | "ready" | "error";

function CatalogNotice({ state, empty = false }: { state: CatalogState; empty?: boolean }) {
  if (state === "ready" && !empty) return null;
  const copy = state === "loading" ? "Loading your Shopify collection…" : state === "error" ? "We couldn’t load the Shopify collection. Please refresh to try again." : "No products are published in this collection yet.";
  return <div className="catalog-notice" role={state === "error" ? "alert" : "status"}>{copy}</div>;
}
type CartLine = Product & { quantity: number; cartKey: string; selectedVariant?: ProductVariant };

function Logo() {
  return <Link href="/" className="logo" aria-label="Sukoon — peaceful homeware and Islamic calligraphy wall art"><img src="/brand/sukoon-logo.png" alt="Sukoon — peaceful homeware and Islamic calligraphy wall art" /></Link>;
}

function Header({ cartCount, onCart }: { cartCount: number; onCart: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const handler = () => setScrolled(window.scrollY > 20); window.addEventListener("scroll", handler); return () => window.removeEventListener("scroll", handler); }, []);
  const close = () => setMenuOpen(false);
  return <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
    <div className="announcement">Free delivery over £100 <span>·</span> Bring peace into your space</div>
    <div className="nav-shell">
      <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      <Logo />
      <nav className={menuOpen ? "open" : ""} aria-label="Main navigation">
        <Link href="/shop" onClick={close}>Shop</Link>
        <Link href="/about" onClick={close}>About</Link>
        <Link href="/contact" onClick={close}>Contact</Link>
      </nav>
      <button className="bag-button" onClick={onCart} aria-label={`Open shopping bag${cartCount ? `, ${cartCount} item${cartCount === 1 ? "" : "s"}` : ""}`}><ShoppingBag size={18} /><span>Bag</span>{cartCount > 0 && <b>{cartCount}</b>}</button>
    </div>
  </header>;
}

function Footer() {
  return <footer className="footer">
    <div className="footer-top">
      <div><Logo /><p className="footer-note">Bring Peace<br />Into Your Space.</p><p className="footer-contact"><a href="mailto:hello@sukoon.studio">hello@sukoon.studio</a></p></div>
      <div className="footer-links"><div><p className="eyebrow">Shop</p><Link href="/shop/wall-art">Wall Art</Link><Link href="/shop/gift-sets">Gift Sets</Link><Link href="/shop">All pieces</Link><Link href="/contact">Contact</Link></div><div><p className="eyebrow">Information</p><Link href="/shipping">Shipping policy</Link><Link href="/refunds">Refund policy</Link><Link href="/privacy">Privacy policy</Link><Link href="/terms">Terms & conditions</Link></div></div>
      <div className="newsletter"><p className="eyebrow">Notes for peaceful spaces</p><p>Occasional notes on new pieces, meaningful gifting and the feeling of home.</p><form onSubmit={(e) => { e.preventDefault(); toast.info("Preview only — newsletter signup is not connected yet."); }}><input type="email" required placeholder="Your email address" aria-label="Email address" /><button aria-label="Sign up"><ArrowRight size={18} /></button></form></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Sukoon Studio</span><span>Bring peace into your space</span><a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Sukoon on Instagram"><Instagram size={16} /></a></div>
  </footer>;
}

function CartDrawer({ cart, setCart, onClose }: { cart: CartLine[]; setCart: React.Dispatch<React.SetStateAction<CartLine[]>>; onClose: () => void }) {
  const total = cart.reduce((sum, line) => sum + (line.price ?? 0) * line.quantity, 0);
  const update = (cartKey: string, delta: number) => setCart(lines => lines.map(line => line.cartKey === cartKey ? { ...line, quantity: Math.max(0, line.quantity + delta) } : line).filter(line => line.quantity > 0));
  return <div className="drawer-backdrop" onClick={onClose}><aside className="cart-drawer" onClick={e => e.stopPropagation()}><div className="drawer-head"><div><p className="eyebrow">Your selection</p><h2>Your selection <span>({cart.length})</span></h2></div><button onClick={onClose} aria-label="Close shopping bag"><X size={20} /></button></div>{cart.length === 0 ? <div className="empty-cart"><span className="empty-icon"><ShoppingBag size={22} /></span><h3>Your bag is waiting.</h3><p>There is room here for something meaningful.</p><Link href="/shop" onClick={onClose} className="text-link">View the collection <ArrowRight size={16} /></Link></div> : <><div className="cart-lines">{cart.map(line => <div className="cart-line" key={line.cartKey}><img src={line.image} alt={line.name} /><div><h3>{line.name}</h3>{line.selectedVariant && <small>{line.selectedVariant.title}</small>}<p>{money(line.price ?? 0, line.currencyCode)}</p><div className="quantity"><button onClick={() => update(line.cartKey, -1)} aria-label={`Remove one ${line.name}`}><Minus size={13} /></button><span>{line.quantity}</span><button onClick={() => update(line.cartKey, 1)} aria-label={`Add one ${line.name}`}><Plus size={13} /></button></div></div><strong>{money((line.price ?? 0) * line.quantity, line.currencyCode)}</strong></div>)}</div><div className="drawer-total"><span>Subtotal</span><strong>{money(total, cart[0]?.currencyCode)}</strong></div><button className="button button-dark full" disabled aria-describedby="checkout-notice">Checkout unavailable <ArrowRight size={16} /></button><p className="secure-note" id="checkout-notice"><Sparkles size={14} /> Products are connected to Shopify. Checkout is not enabled yet.</p></>}</aside></div>;
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  const available = product.availableForSale !== false && product.variantId && product.price !== undefined;
  return <article className="product-card"><Link href={`/product/${product.id}`} className="product-image" aria-label={`View ${product.name}`}>
    {product.image ? <img src={product.image} alt={product.name} loading="lazy" /> : <div className="product-image-fallback"><span>{product.name}</span></div>}
    <span className="quick-add">View piece <ArrowRight size={15} /></span>
  </Link><div className="product-meta"><div><h3>{product.name}</h3><p className="arabic-label">{product.arabic}</p></div>{product.price !== undefined ? <strong>{money(product.price, product.currencyCode)}</strong> : <span className="product-status">Price unavailable</span>}</div>{available ? <button className="product-add" onClick={() => onAdd(product)} aria-label={`Add ${product.name} to bag`}>Add to bag <Plus size={15} /></button> : <span className="product-add product-status-link">Currently unavailable</span>}</article>;
}

function CollectionCard({ href, title, description, image, alt, collection }: { href: string; title: string; description: string; image: string; alt: string; collection: "Wall Art" | "Gift Sets" }) {
  return <Link href={href} className="collection-card"><div className="collection-card-media">{image ? <img src={image} alt={alt} loading="lazy" /> : <div className="product-image-fallback"><span>No pieces published yet</span></div>}</div><div className="collection-card-copy"><p className="eyebrow">{collection}</p><h3>{title}</h3><p>{description}</p><span className="text-link">Explore {collection} <ArrowRight size={16} /></span></div></Link>;
}

function Home({ onAdd, liveCatalog, catalogState }: { onAdd: (p: Product) => void; liveCatalog: Product[]; catalogState: CatalogState }) {
  return <main>
    <section className="hero hero-lifestyle" style={{ backgroundImage: `url(${heroImage})` }}><div className="hero-overlay" /><div className="hero-copy hero-copy-light"><p className="eyebrow">Sukoon / suːˈkuːn /</p><h1>Make room<br /><em>for peace.</em></h1><p className="hero-lede">Thoughtful pieces for a home that feels like yours.</p><div className="hero-actions"><Link href="/shop" className="button button-light">Explore the collection <ArrowRight size={16} /></Link><Link href="/shop/gift-sets" className="button button-ghost-light">Discover gift sets</Link></div></div><span className="hero-side-note">سكون <span>— peace at home</span></span></section>
    <section className="collection-discovery section-wrap"><div className="section-head"><div><p className="eyebrow">The Sukoon edit</p><h2>Find your kind<br /><em>of peace.</em></h2></div><p className="section-support">Two ways to make space for the feeling you want to come home to.</p></div><div className="collection-grid"><CollectionCard href="/shop/wall-art" title="Wall Art" description="Quiet reminders for the spaces you call home." image={liveCatalog.find(p => p.category === "Wall Art")?.image ?? ""} alt="Sukoon Islamic calligraphy wall art in a warm home" collection="Wall Art" /><CollectionCard href="/shop/gift-sets" title="Gift Sets" description="Meaningful gifts, thoughtfully put together." image={liveCatalog.find(p => p.category === "Gift Sets")?.image ?? ""} alt="Neutral Sukoon gift set packaging on linen" collection="Gift Sets" /></div></section>
    <section className="story-band"><div className="story-band-inner"><p className="eyebrow">A note from Sukoon</p><h2>Sukoon is about the feeling you come home to.</h2><p>A little more calm, a little more meaning, and space to slow down.</p><Link href="/about" className="text-link">Our story <ArrowRight size={16} /></Link></div></section>
    <section className="featured section-wrap"><div className="section-head"><div><p className="eyebrow">Available now</p><h2>Pieces for <em>everyday.</em></h2><p className="section-support">A small selection of real pieces, ready to find their place.</p></div><Link href="/shop" className="text-link">Shop all <ArrowRight size={16} /></Link></div><CatalogNotice state={catalogState} empty={liveCatalog.length === 0} /><div className="product-grid featured-grid">{liveCatalog.map(p => <ProductCard key={p.id} product={p} onAdd={onAdd} />)}</div></section>
    <section className="quote-band"><div className="quote-mark">“</div><blockquote>Make room for<br /><em>what matters.</em></blockquote><span className="quote-arabic">بهدوء</span></section>
    <section className="closing-cta"><p className="eyebrow">Bring peace home</p><h2>Find your <em>quiet.</em></h2><p>Explore pieces chosen for slower mornings, thoughtful gifting and the spaces in between.</p><Link href="/shop" className="button button-dark">Explore the collection <ArrowRight size={16} /></Link></section>
  </main>;
}

function Shop({ onAdd, collection, catalogProducts, catalogState }: { onAdd: (p: Product) => void; collection?: "Wall Art" | "Gift Sets"; catalogProducts: Product[]; catalogState: CatalogState }) {
  const [active, setActive] = useState<string>(collection ?? "All pieces");
  useEffect(() => { setActive(collection ?? "All pieces"); }, [collection]);
  const filtered = active === "All pieces" ? catalogProducts : active === "Wall Art" ? catalogProducts.filter(p => p.category === "Wall Art" || p.placeholderCollection === "Wall Art") : catalogProducts.filter(p => p.category === "Gift Sets" || p.placeholderCollection === "Gift Sets");
  const title = active === "Wall Art" ? <>Wall Art,<br /><em>quietly held.</em></> : active === "Gift Sets" ? <>Gifts with<br /><em>meaning.</em></> : <>Pieces for<br /><em>peaceful spaces.</em></>;
  const intro = active === "Wall Art" ? "Quiet reminders for the spaces you call home." : active === "Gift Sets" ? "Meaningful gifts, thoughtfully put together." : "A small collection of pieces for home, reflection and everyday rituals.";
  return <main className="page-shell shop-page"><div className="page-intro"><p className="eyebrow">{active === "All pieces" ? "The collection" : active}</p><h1>{title}</h1><p>{intro}</p></div><div className="shop-toolbar"><div className="category-tabs">{categories.map(c => <button key={c.value} className={active === c.value ? "active" : ""} onClick={() => setActive(c.value)}>{c.label}</button>)}</div><span>{filtered.length} {filtered.length === 1 ? "piece" : "pieces"} <ChevronDown size={15} /></span></div><CatalogNotice state={catalogState} empty={filtered.length === 0} /><div className="product-grid shop-grid">{filtered.map(p => <ProductCard key={p.id} product={p} onAdd={onAdd} />)}</div></main>;
}

function ProductPage({ product, onAdd }: { product?: Product; onAdd: (p: Product) => void }) {
  const [selectedVariantId, setSelectedVariantId] = useState(product?.variantId ?? product?.variants?.[0]?.id);
  useEffect(() => { setSelectedVariantId(product?.variantId ?? product?.variants?.[0]?.id); }, [product?.id]);
  if (!product) return <NotFoundPage />;
  const selectedVariant = product.variants?.find(variant => variant.id === selectedVariantId) ?? product.variants?.[0];
  const selectedPrice = selectedVariant?.price ?? product.price;
  return <main className="product-page page-shell"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.description, image: product.image, offers: selectedPrice === undefined ? undefined : { "@type": "Offer", priceCurrency: selectedVariant?.currencyCode ?? product.currencyCode ?? "GBP", price: selectedPrice } }) }} /><Link href="/shop" className="back-link">← Back to the collection</Link><div className="product-detail"><div className="detail-image">{product.image ? <img src={product.image} alt={`${product.name} — ${product.description}`} /> : <div className="product-image-fallback"><span>{product.name}</span></div>}</div><div className="detail-copy"><p className="eyebrow">{product.category}{product.arabic ? ` / ${product.arabic}` : ""}</p><h1>{product.name}</h1><p className="detail-price">{selectedPrice === undefined ? "Price to be confirmed" : money(selectedPrice, selectedVariant?.currencyCode ?? product.currencyCode)}</p><p>{product.description}</p><div className="detail-rule" />{product.variants && <label className="variant-picker">{product.optionName || "Option"}<select value={selectedVariant?.id} onChange={event => setSelectedVariantId(event.target.value)}>{product.variants.map(variant => <option key={variant.id} value={variant.id} disabled={variant.availableForSale === false}>{variant.title} · {money(variant.price, variant.currencyCode)}{variant.availableForSale === false ? " · unavailable" : ""}</option>)}</select></label>}{(product.materials || product.dimensions || product.availability) && <p className="detail-meta">{product.materials && <><span>Materials</span> {product.materials}<br /></>}{product.dimensions && <><span>Dimensions</span> {product.dimensions}<br /></>}{product.availability && <><span>Availability</span> {product.availability}</>}</p>}{product.care && <p className="detail-care"><strong>Care</strong>{product.care}</p>}{product.availableForSale !== false && selectedVariant?.availableForSale !== false && product.variantId && selectedVariant ? <><button className="button button-dark full" onClick={() => { onAdd({ ...product, variantId: selectedVariant.id, price: selectedVariant.price, currencyCode: selectedVariant.currencyCode, availableForSale: selectedVariant.availableForSale }); toast.success(`${product.name} · ${selectedVariant.title} added to your bag.`); }}>Add to bag <Plus size={16} /></button><p className="secure-note"><Check size={14} /> Live Shopify product · checkout not enabled yet</p></> : <p className="product-status">Currently unavailable.</p>}</div></div></main>;
}

function TextPage({ type }: { type: "about" | "contact" | "shipping" | "refunds" | "privacy" | "terms" }) {
  const content = { about: { label: "About", title: <>A home for <em>meaning.</em></>, intro: "Sukoon is about the feeling you come home to.", body: ["A little more calm, a little more meaning, and space to slow down. We choose Islamic art and everyday pieces with a warm, quiet point of view — things that feel at home in the spaces and rituals that matter most.", "Our name comes from the Arabic word sukoon, a feeling of calm and stillness. It is the thread through everything we do: a slower pace, fewer but better things, and a belief that beauty does not have to shout."], quote: "Come as you are. Leave a little lighter." }, contact: { label: "Contact", title: <>Let’s stay<br /><em>in touch.</em></>, intro: "Questions about a piece, your order, or a future idea? We’re here to help.", body: [], quote: "We usually reply within 2 working days." }, shipping: { label: "Information", title: <>Shipping<br /><em>policy.</em></>, intro: "The short version: we pack carefully and send thoughtfully.", body: ["UK orders are dispatched within 2–4 working days via a tracked service. Delivery usually takes 2–3 working days after dispatch. You’ll receive tracking details by email when your order leaves our studio.", "International orders are welcome. Delivery times and duties vary by destination; any customs charges are the responsibility of the recipient. If your parcel arrives damaged, please email us within 48 hours with photographs so we can help."], quote: "Every order is wrapped like it is a gift — because it is." }, refunds: { label: "Information", title: <>Refund<br /><em>policy.</em></>, intro: "We want you to love your Sukoon piece.", body: ["If something is not quite right, you can return unused, undamaged items within 14 days of delivery for a refund. Please email hello@sukoon.studio with your order number before sending anything back.", "Custom or personalised pieces cannot be returned unless they arrive damaged. Return postage is the responsibility of the customer, except where an item is faulty or incorrect."], quote: "Made with care, held to a high standard." }, privacy: { label: "Details", title: <>Privacy<br /><em>policy.</em></>, intro: "A clear, respectful approach to your information.", body: ["We only collect the information needed to process orders, respond to enquiries, and keep you updated if you choose to join our mailing list. We do not sell your personal information.", "Sukoon uses trusted payment, delivery, and website partners to provide our service. You can ask to access, correct, or delete your personal information by emailing hello@sukoon.studio."], quote: "Clear, respectful, and never more than necessary." }, terms: { label: "Details", title: <>Terms &<br /><em>conditions.</em></>, intro: "The essentials for shopping with Sukoon.", body: ["By placing an order, you confirm that the information provided is accurate and that you are authorised to use the chosen payment method. Product colours may vary slightly between screens and natural materials will carry their own character.", "All content on this website belongs to Sukoon Studio. We reserve the right to update product details, pricing, and these terms when needed. Nothing here affects your statutory rights."], quote: "Good things are built on clarity." } }[type];
  return <main className={`text-page page-shell ${type === "contact" ? "contact-page" : ""}`}><div className="text-intro"><p className="eyebrow">{content.label}</p><h1>{content.title}</h1><p className="lead">{content.intro}</p></div>{type === "contact" ? <ContactForm /> : <div className="text-body">{content.body.map((p, i) => <p key={i}>{p}</p>)}<div className="text-quote">{content.quote}<span>— Sukoon</span></div></div>}</main>;
}

function FaqPage() {
  const faqs = [["When will my order arrive?", "UK orders are dispatched within 2–4 working days using a tracked service. Delivery usually takes a further 2–3 working days after dispatch."], ["Do you offer international delivery?", "International orders are welcome. Delivery times and any customs charges vary by destination; duties are the responsibility of the recipient."], ["Can I return an item?", "Unused and undamaged items can be returned within 14 days of delivery. Please email hello@sukoon.studio with your order number before sending anything back."], ["Why is a collection empty?", "Collections show products published in our connected Shopify catalog. If a collection has no published products yet, it will be shown as empty rather than filled with preview products."], ["How can I contact Sukoon?", "Write to hello@sukoon.studio. We usually reply within 2 working days, Monday to Friday, 9am–5pm GMT."]];
  return <main className="text-page page-shell faq-page"><div className="text-intro"><p className="eyebrow">Information</p><h1>Questions,<br /><em>answered.</em></h1><p className="lead">A few useful details before you choose a piece.</p></div><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={17} /></summary><p>{answer}</p></details>)}</div></main>;
}

function ContactForm() { const [sent, setSent] = useState(false); return <div className="contact-grid"><div className="contact-details"><p className="eyebrow">Get in touch</p><a href="mailto:hello@sukoon.studio">hello@sukoon.studio</a><p>Monday–Friday<br />9am–5pm (GMT)</p><p className="arabic-script">أهلاً بك</p></div><form className="contact-form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}><label>Name<input required name="name" placeholder="Your name" /></label><label>Email<input required type="email" name="email" placeholder="you@example.com" /></label><label>How can we help?<textarea required name="message" rows={5} placeholder="Tell us a little more..." /></label><button className="button button-dark" type="submit">{sent ? <>Preview complete <Check size={16} /></> : <>Send enquiry <ArrowRight size={16} /></>}</button>{sent && <p className="form-success">Preview only — no enquiry was sent. Please email hello@sukoon.studio.</p>}</form></div>; }
function NotFoundPage() { return <main className="page-shell not-found"><p className="eyebrow">Oh dear</p><h1>That page has<br /><em>gone quiet.</em></h1><Link href="/" className="button button-dark">Back home <ArrowRight size={16} /></Link></main>; }

export default function Storefront() {
  const [location] = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [liveCatalog, setLiveCatalog] = useState<Product[]>([]);
  const [catalogState, setCatalogState] = useState<CatalogState>("loading");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/shopify/catalog", { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("Shopify catalog unavailable");
        const payload = await response.json();
        if (!Array.isArray(payload.products)) throw new Error("Invalid Shopify catalog");
        return payload.products as Product[];
      })
      .then(products => {
        setLiveCatalog(products.map(product => ({ ...product, arabic: savedProductDetails.find(detail => detail.id === product.id)?.arabic ?? product.arabic })));
        setCatalogState("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) { setLiveCatalog([]); setCatalogState("error"); }
      });
    return () => controller.abort();
  }, []);
  const catalogProducts = liveCatalog;
  useEffect(() => {
    const productForSeo = location.startsWith("/product/") ? catalogProducts.find(p => p.id === location.split("/")[2]) : undefined;
    const title = productForSeo ? `${productForSeo.name} — Sukoon` : ({ "/": "Sukoon | Make Room for Peace", "/shop": "Sukoon Collection | Peaceful Home Pieces", "/shop/wall-art": "Wall Art | Sukoon", "/shop/gift-sets": "Gift Sets | Sukoon", "/about": "About Sukoon | A Home for Meaning", "/contact": "Contact Sukoon", "/faq": "FAQs — Sukoon", "/shipping": "Shipping Policy — Sukoon", "/refunds": "Refund Policy — Sukoon", "/privacy": "Privacy Policy — Sukoon", "/terms": "Terms & Conditions — Sukoon" } as Record<string, string>)[location] || "Sukoon | Make Room for Peace";
    const descriptions: Record<string, string> = { "/": "Sukoon brings peaceful home pieces, Islamic calligraphy wall art and meaningful gifting together for a home that feels like yours.", "/shop": "Explore Sukoon's collection of peaceful home pieces, Islamic wall art and Gift Sets.", "/shop/wall-art": "Explore Sukoon Wall Art: quiet reminders for the spaces you call home, with live product details and current availability.", "/shop/gift-sets": "Discover Sukoon Gift Sets: meaningful gifts, thoughtfully put together, with live product details and current availability.", "/about": "Discover Sukoon, a calm and thoughtful home brand inspired by peace, faith and meaningful everyday living.", "/contact": "Contact Sukoon about home pieces, Islamic wall art, orders, delivery and future collections.", "/faq": "Find answers about Sukoon orders, delivery, returns and future Wall Art and Gift Sets collections." };
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", productForSeo?.description || descriptions[location] || "Sukoon brings peaceful home pieces, Islamic calligraphy wall art and meaningful gifting together for a home that feels like yours.");
  }, [location, catalogProducts]);
  const addToCart = (product: Product) => { if (product.availableForSale === false || product.variantId === undefined || product.price === undefined) return; const selectedVariant = product.variants?.find(variant => variant.id === product.variantId); if (selectedVariant?.availableForSale === false) return; const cartKey = `${product.id}:${product.variantId}`; setCart(lines => { const existing = lines.find(line => line.cartKey === cartKey); return existing ? lines.map(line => line.cartKey === cartKey ? { ...line, quantity: line.quantity + 1 } : line) : [...lines, { ...product, quantity: 1, cartKey, selectedVariant }]; }); };
  const cartCount = useMemo(() => cart.reduce((sum, line) => sum + line.quantity, 0), [cart]);
  const [, params] = useRoute("/product/:id");
  const product = params ? catalogProducts.find(p => p.id === params.id) : undefined;
  let content = <Home onAdd={addToCart} liveCatalog={liveCatalog} catalogState={catalogState} />;
  if (location === "/shop") content = <Shop onAdd={addToCart} catalogProducts={catalogProducts} catalogState={catalogState} />;
  else if (location === "/shop/wall-art") content = <Shop onAdd={addToCart} collection="Wall Art" catalogProducts={catalogProducts} catalogState={catalogState} />;
  else if (location === "/shop/gift-sets") content = <Shop onAdd={addToCart} collection="Gift Sets" catalogProducts={catalogProducts} catalogState={catalogState} />;
  else if (location.startsWith("/product/")) content = catalogState === "ready" ? <ProductPage product={product} onAdd={addToCart} /> : <main className="page-shell product-page"><CatalogNotice state={catalogState} /></main>;
  else if (["/about", "/contact", "/shipping", "/refunds", "/privacy", "/terms"].includes(location)) content = <TextPage type={location.slice(1) as "about"} />;
  else if (location === "/faq") content = <FaqPage />;
  else if (location !== "/") content = <NotFoundPage />;
  return <div className="site"><Header cartCount={cartCount} onCart={() => setCartOpen(true)} />{content}<Footer />{cartOpen && <CartDrawer cart={cart} setCart={setCart} onClose={() => setCartOpen(false)} />}</div>;
}
