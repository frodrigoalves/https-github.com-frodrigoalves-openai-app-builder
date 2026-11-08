import { Link } from '@tanstack/react-router'
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../store'
import { Breadcrumbs, euro, ProductCard, Storefront } from '../components/Storefront'

export function CartPage() {
  const { cart, products, setCartQuantity, removeFromCart } = useStore()
  const [demoMessage, setDemoMessage] = useState(false)
  const lines = cart.map((line) => ({ ...line, product: products.find((item) => item.id === line.productId) })).filter((line) => line.product)
  const subtotal = lines.reduce((sum, line) => sum + line.product!.price * line.quantity, 0)
  const suggestions = products.filter((product) => product.published && !product.archived && !cart.some((line) => line.productId === product.id)).slice(0, 4)

  return (
    <Storefront>
      <section className="cart-page section-wrap">
        <Breadcrumbs items={[{ label: 'Warenkorb' }]} />
        <div className="page-title"><span className="eyebrow">IHRE AUSWAHL</span><h1>Warenkorb<em>.</em></h1></div>
        {lines.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon"><ShoppingBag size={26} /></div>
            <span className="eyebrow">NOCH NICHTS GEFUNDEN</span>
            <h2>Ihr Warenkorb ist noch leer.</h2>
            <p>Stöbern Sie durch unsere ausgewählten Mineralien, Edelsteine und Lieblingsstücke.</p>
            <Link className="button button-dark" to="/shop/$category" params={{ category: 'alle' }}>Kollektionen entdecken <ArrowRight size={16} /></Link>
          </div>
        ) : (
          <>
            <div className="cart-layout">
              <div className="cart-lines">
                {lines.map(({ product, quantity }) => product && (
                  <article className="cart-line" key={product.id}>
                    <Link to="/produkt/$productId" params={{ productId: product.id }} className="cart-line-image"><img src={product.image} alt={product.name} /></Link>
                    <div className="cart-line-copy">
                      <span className="product-category">{product.category}</span>
                      <Link to="/produkt/$productId" params={{ productId: product.id }} className="product-title">{product.name}</Link>
                      <span className="cart-line-sku">{product.sku}</span>
                      <div className="quantity-picker">
                        <button aria-label="Menge verringern" onClick={() => setCartQuantity(product.id, quantity - 1)}><Minus size={14} /></button>
                        <span>{quantity}</span>
                        <button aria-label="Menge erhöhen" disabled={quantity >= product.quantity} onClick={() => setCartQuantity(product.id, quantity + 1)}><Plus size={14} /></button>
                      </div>
                    </div>
                    <div className="cart-line-total">
                      <strong>{euro(product.price * quantity)}</strong>
                      <button className="remove-line" aria-label={`${product.name} entfernen`} onClick={() => removeFromCart(product.id)}><Trash2 size={16} /></button>
                    </div>
                  </article>
                ))}
              </div>
              <aside className="cart-summary">
                <span className="eyebrow">ÜBERSICHT</span>
                <div><span>Zwischensumme</span><strong>{euro(subtotal)}</strong></div>
                <div><span>Versand</span><span>Wird im Demo nicht berechnet</span></div>
                <div className="summary-total"><span>Gesamtsumme</span><strong>{euro(subtotal)}</strong></div>
                <button className="button button-dark checkout-button" onClick={() => setDemoMessage(true)}>Demo-Kauf ansehen <ArrowRight size={16} /></button>
                {demoMessage && <p className="inline-notice" role="status">Dies ist ein Demo-Shop. Es wird keine Bestellung ausgelöst.</p>}
                <p className="demo-caption">Keine Zahlung · keine echte Bestellung</p>
              </aside>
            </div>
            {suggestions.length > 0 && <section className="cart-suggestions"><div className="section-heading"><div><span className="eyebrow">NOCH EIN LIEBLINGSSTÜCK?</span><h2>Das könnte Ihnen <em>gefallen.</em></h2></div></div><div className="product-grid">{suggestions.map((product) => <ProductCard key={product.id} product={product} compact />)}</div></section>}
          </>
        )}
      </section>
    </Storefront>
  )
}
