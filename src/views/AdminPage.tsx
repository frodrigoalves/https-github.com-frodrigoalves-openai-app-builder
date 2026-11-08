import { Link } from '@tanstack/react-router'
import {
  ArrowDownToLine, ArrowLeft, ArrowUpRight, Boxes, ChartNoAxesColumnIncreasing, Download,
  Check, ChevronDown, CircleAlert, Copy, ImagePlus, LayoutDashboard, LogOut,
  Menu, MoreHorizontal, Pencil, Plus, Search, Settings2, ShieldCheck,
  ShoppingBasket, ShoppingCart, Tag, Trash2, Truck, Users, X,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { categories, categoryImages } from '../data'
import { useStore } from '../store'
import type { Availability, Category, Product, StockMovement } from '../types'
import { euro } from '../components/Storefront'
import { demoSessionKey } from '../demoSession'

const adminSections = [
  { slug: 'übersicht', label: 'Übersicht', icon: LayoutDashboard },
  { slug: 'produkte', label: 'Produkte', icon: Tag },
  { slug: 'kategorien', label: 'Kategorien', icon: Boxes },
  { slug: 'lagerbestand', label: 'Lagerbestand', icon: ShoppingBasket },
  { slug: 'wareneingang', label: 'Wareneingang', icon: Truck },
  { slug: 'bestellungen', label: 'Bestellungen', icon: ShoppingCart },
  { slug: 'kunden', label: 'Kunden', icon: Users },
  { slug: 'medien', label: 'Medien', icon: ImagePlus },
  { slug: 'website-inhalte', label: 'Website-Inhalte', icon: Pencil },
  { slug: 'einstellungen', label: 'Einstellungen', icon: Settings2 },
  { slug: 'benutzer', label: 'Benutzer', icon: ShieldCheck },
]

const isAvailability = (value: string): value is Availability =>
  value === 'Auf Lager' || value === 'In Anlieferung' || value === 'Nicht verfügbar'

const maxStoredImageChars = 1_800_000

function storedImageChars(product: Product) {
  const imageListChars = (product.images ?? []).reduce((total, image) => total + image.length, 0)
  return imageListChars + (product.image.startsWith('data:image/') ? product.image.length : 0)
}

function stockState(product: Product): Availability {
  if (product.quantity > 0) return 'Auf Lager'
  return product.availability === 'In Anlieferung' ? 'In Anlieferung' : 'Nicht verfügbar'
}

export function AdminPage({ section }: { section: string }) {
  const [activeSection, setActiveSection] = useState(section.toLocaleLowerCase('de-AT'))
  const [mobileNav, setMobileNav] = useState(false)
  const [toast, setToast] = useState('')
  const [formMode, setFormMode] = useState<'new' | 'edit' | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const currentSection = adminSections.find((item) => item.slug === activeSection) ?? adminSections[0]
  const { products, cart } = useStore()
  const navigate = useNavigate()
  useEffect(() => setActiveSection(section.toLocaleLowerCase('de-AT')), [section])

  function notify(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 3500)
  }

  function navigateToSection(nextSection: string) {
    setActiveSection(nextSection)
    void navigate({ to: '/verwaltung/$section', params: { section: nextSection } })
  }

  function openNew() {
    setEditingProduct(null)
    setFormMode('new')
  }

  function openEdit(product: Product) {
    setEditingProduct(product)
    setFormMode('edit')
  }

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${mobileNav ? 'admin-sidebar-open' : ''}`}>
        <Link className="admin-brand" to="/"><span>STEINPLATTE</span><small>Mineralien &amp; Edelsteine</small></Link>
        <div className="admin-demo-user"><div className="admin-avatar">HM</div><div><strong>Hubert Mader</strong><span>DEMO · Administrator</span></div><ChevronDown size={15} /></div>
        <span className="admin-nav-label">ARBEITSBEREICH</span>
        <nav className="admin-nav" aria-label="Verwaltungsnavigation">
          {adminSections.map((item) => {
            const Icon = item.icon
            return <Link key={item.slug} to="/verwaltung/$section" params={{ section: item.slug }} onClick={() => { setActiveSection(item.slug); setMobileNav(false) }} className={`admin-nav-link ${currentSection.slug === item.slug ? 'active' : ''}`}><Icon size={17} />{item.label}{item.slug === 'lagerbestand' && products.filter((p) => p.quantity <= 2 && !p.archived).length > 0 && <span className="nav-alert">{products.filter((p) => p.quantity <= 2 && !p.archived).length}</span>}</Link>
          })}
        </nav>
        <div className="admin-sidebar-bottom"><span className="admin-status-dot" /> Demo-Modus aktiv <Link to="/"><ArrowLeft size={15} /> Zur Website</Link></div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="icon-button admin-menu-toggle" aria-label="Navigation öffnen" onClick={() => setMobileNav(!mobileNav)}>{mobileNav ? <X size={20} /> : <Menu size={20} />}</button>
          <div className="admin-breadcrumb">Verwaltung <span>/</span> <strong>{currentSection.label}</strong></div>
          <div className="admin-top-actions"><span className="demo-pill"><span /> DEMO</span><button aria-label="Abmelden" title="Demo-Sitzung beenden" className="admin-logout" onClick={() => { window.sessionStorage.removeItem(demoSessionKey); void navigate({ to: '/verwaltung/anmelden', replace: true }) }}><LogOut size={17} /><span>Abmelden</span></button></div>
        </header>
        <main className="admin-content">
          <div className="admin-page-heading">
            <div><span className="eyebrow">STEINPLATTE · VERWALTUNG</span><h1>{currentSection.label}<em>.</em></h1></div>
            <div className="admin-heading-actions"><span className="admin-date">{new Intl.DateTimeFormat('de-AT', { dateStyle: 'long' }).format(new Date())}</span>{currentSection.slug === 'produkte' && <button className="button button-dark" onClick={openNew}><Plus size={17} /> Neues Produkt</button>}</div>
          </div>
          {activeSection === 'übersicht' && <Overview products={products} onNavigate={navigateToSection} />}
          {activeSection === 'produkte' && <ProductsSection products={products} onNew={openNew} onEdit={openEdit} notify={notify} />}
          {activeSection === 'kategorien' && <CategoriesSection products={products} />}
          {activeSection === 'lagerbestand' && <InventorySection products={products} notify={notify} />}
          {activeSection === 'wareneingang' && <ReceivingSection products={products} notify={notify} />}
          {activeSection === 'bestellungen' && <OrdersSection count={cart.length} />}
          {activeSection === 'kunden' && <CustomersSection />}
          {activeSection === 'medien' && <MediaSection products={products} />}
          {activeSection === 'website-inhalte' && <ContentSection notify={notify} />}
          {activeSection === 'einstellungen' && <SettingsSection notify={notify} />}
          {activeSection === 'benutzer' && <UsersSection />}
        </main>
      </div>
      {toast && <div className="admin-toast" role="status"><Check size={17} />{toast}</div>}
      {formMode && <ProductForm mode={formMode} product={editingProduct} onClose={() => setFormMode(null)} onSaved={(message) => { setFormMode(null); notify(message) }} />}
    </div>
  )
}

function Overview({ products, onNavigate }: { products: Product[]; onNavigate: (section: string) => void }) {
  const active = products.filter((product) => !product.archived)
  const lowStock = active.filter((product) => product.quantity <= 2)
  const stockCount = active.reduce((sum, product) => sum + product.quantity, 0)
  return (
    <>
      <div className="admin-welcome-panel"><div><span className="eyebrow eyebrow-light">GUTEN TAG, HUBERT</span><h2>Alles im Blick.<br /><em>Mit Ruhe im Detail.</em></h2><p>Hier sehen Sie, was in Ihrer Werkstatt gerade wichtig ist.</p></div><div className="welcome-stamp">M<br /><span>S</span></div></div>
      <div className="admin-stats-grid">
        <StatCard label="Aktive Produkte" value={active.filter((p) => p.published).length.toString()} note={`${active.length} insgesamt`} icon={<Tag size={18} />} />
        <StatCard label="Stück auf Lager" value={stockCount.toString()} note="Über alle Produkte" icon={<Boxes size={18} />} />
        <StatCard label="Bestellungen" value="12" note="Im Demo-Zeitraum" icon={<ShoppingCart size={18} />} trend="+ 3 diese Woche" />
        <StatCard label="Lagerhinweise" value={lowStock.length.toString().padStart(2, '0')} note="2 Stück oder weniger" icon={<CircleAlert size={18} />} alert={lowStock.length > 0} />
      </div>
      <div className="admin-overview-grid">
        <section className="admin-panel">
          <div className="panel-heading"><div><span className="eyebrow">AUF EINEN BLICK</span><h2>Lagerhinweise</h2></div><button className="text-button" onClick={() => onNavigate('lagerbestand')}>Zum Lager <ArrowUpRight size={15} /></button></div>
          {lowStock.length ? <div className="low-stock-list">{lowStock.slice(0, 4).map((product) => <div key={product.id}><img src={product.image} alt="" /><span><strong>{product.name}</strong><small>{product.sku}</small></span><b className={product.quantity === 0 ? 'stock-zero' : ''}>{product.quantity} Stk.</b></div>)}</div> : <p className="muted-copy">Alle Bestände sind gut versorgt.</p>}
        </section>
        <section className="admin-panel activity-panel">
          <div className="panel-heading"><div><span className="eyebrow">LETZTE 7 TAGE</span><h2>Aktivität</h2></div><ChartNoAxesColumnIncreasing size={19} /></div>
          <div className="activity-chart" aria-label="Demonstration der Produktaktivität über sieben Tage">{[36, 57, 43, 76, 52, 89, 64].map((height, index) => <div key={index}><span style={{ height: `${height}%` }} /><small>{['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'][index]}</small></div>)}</div>
          <p className="chart-caption">Beispielhafte Demo-Daten · keine Echtzeit-Kennzahlen</p>
        </section>
      </div>
      <section className="admin-panel quick-actions"><div className="panel-heading"><div><span className="eyebrow">DIREKT LOSLEGEN</span><h2>Schnellzugriff</h2></div></div><div className="quick-action-grid"><button onClick={() => onNavigate('produkte')}><Plus size={17} /><span><strong>Produkte verwalten</strong><small>Ein Produkt anlegen oder bearbeiten</small></span><ArrowUpRight size={15} /></button><button onClick={() => onNavigate('wareneingang')}><Truck size={17} /><span><strong>Wareneingang erfassen</strong><small>Bestand aktualisieren</small></span><ArrowUpRight size={15} /></button><button onClick={() => onNavigate('website-inhalte')}><Pencil size={17} /><span><strong>Website-Inhalte</strong><small>Texte im Demo bearbeiten</small></span><ArrowUpRight size={15} /></button></div></section>
    </>
  )
}

function StatCard({ label, value, note, icon, trend, alert }: { label: string; value: string; note: string; icon: ReactNode; trend?: string; alert?: boolean }) {
  return <article className={`stat-card ${alert ? 'stat-card-alert' : ''}`}><div className="stat-top"><span>{label}</span><span className="stat-icon">{icon}</span></div><strong>{value}</strong><div className="stat-bottom"><span>{note}</span>{trend && <b>{trend}</b>}</div></article>
}

function ProductsSection({ products, onNew, onEdit, notify }: { products: Product[]; onNew: () => void; onEdit: (product: Product) => void; notify: (message: string) => void }) {
  const { saveProduct } = useStore()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Alle')
  const visible = products.filter((product) => {
    const matchesText = `${product.name} ${product.sku} ${product.category}`.toLocaleLowerCase('de-AT').includes(query.toLocaleLowerCase('de-AT'))
    return matchesText && (filter === 'Alle' || (filter === 'Archiviert' ? product.archived : filter === 'Entwürfe' ? !product.published && !product.archived : !product.archived && product.published))
  })

  function persist(product: Product, message: string) {
    try {
      saveProduct(product)
      notify(message)
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Die Änderung konnte nicht lokal gespeichert werden.')
    }
  }

  function duplicate(product: Product) {
    const copy: Product = { ...product, id: `${product.id}-kopie-${Date.now()}`, name: `${product.name} (Kopie)`, sku: `${product.sku}-K`, published: false, archived: false }
    persist(copy, 'Produkt wurde als Entwurf dupliziert.')
  }
  function archive(product: Product) {
    if (!window.confirm(`„${product.name}“ wirklich archivieren?`)) return
    persist({ ...product, archived: true, published: false }, 'Produkt wurde archiviert.')
  }
  function togglePublished(product: Product) {
    const published = !product.published
    persist(
      { ...product, published, archived: false },
      published ? 'Produkt wurde veröffentlicht.' : 'Produkt wurde auf Entwurf gesetzt.',
    )
  }

  function exportProducts() {
    const exportData = JSON.stringify(products, null, 2)
    const file = new Blob([exportData], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = `steinplatte-demo-produkte-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    notify('Produktdaten inklusive gespeicherter Bilder wurden als JSON exportiert.')
  }

  return (
    <section className="admin-panel products-panel">
      <div className="table-toolbar"><div className="admin-search"><Search size={16} /><input placeholder="Produkt oder SKU suchen" value={query} onChange={(event) => setQuery(event.target.value)} /></div><label className="admin-filter"><span className="sr-only">Produkte filtern</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option>Alle</option><option>Veröffentlicht</option><option>Entwürfe</option><option>Archiviert</option></select><ChevronDown size={15} /></label><button className="button button-quiet button-export" onClick={exportProducts}><Download size={16} /> JSON exportieren</button><button className="button button-dark" onClick={onNew}><Plus size={16} /> Neues Produkt</button></div>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Produkt</th><th>Kategorie</th><th>SKU</th><th>Preis</th><th>Bestand</th><th>Status</th><th><span className="sr-only">Aktionen</span></th></tr></thead><tbody>
        {visible.map((product) => <tr key={product.id}>
          <td><div className="table-product"><img src={product.image} alt="" /><div><strong>{product.name}</strong>{product.uniquePiece && <small>Unikat</small>}</div></div></td><td>{product.category}</td><td className="sku-cell">{product.sku}</td><td>{euro(product.price)}</td><td><span className={product.quantity <= 2 ? 'quantity-warning' : ''}>{product.quantity} Stk.</span></td><td><StatusBadge label={product.archived ? 'Archiviert' : product.published ? 'Veröffentlicht' : 'Entwurf'} /></td>
          <td><div className="row-actions"><button title="Bearbeiten" aria-label={`${product.name} bearbeiten`} onClick={() => onEdit(product)}><Pencil size={15} /></button><button title="Duplizieren" aria-label={`${product.name} duplizieren`} onClick={() => duplicate(product)}><Copy size={15} /></button><button title={product.published ? 'Als Entwurf speichern' : 'Veröffentlichen'} aria-label={`${product.name} veröffentlichen oder entwerfen`} onClick={() => togglePublished(product)}>{product.published ? <ArrowDownToLine size={15} /> : <ArrowUpRight size={15} />}</button>{!product.archived && <button title="Archivieren" aria-label={`${product.name} archivieren`} onClick={() => archive(product)}><Trash2 size={15} /></button>}</div></td>
        </tr>)}
      </tbody></table>
      {!visible.length && <div className="admin-empty">Keine Produkte für diese Auswahl gefunden.</div>}</div>
      <div className="table-footnote">{visible.length} von {products.length} Produkten · Änderungen werden lokal im Demo gespeichert</div>
    </section>
  )
}

function StatusBadge({ label }: { label: string }) {
  return <span className={`status-badge ${label === 'Veröffentlicht' || label === 'Auf Lager' ? 'status-positive' : label === 'Archiviert' || label === 'Nicht verfügbar' ? 'status-muted' : 'status-warning'}`}><span />{label}</span>
}

function CategoriesSection({ products }: { products: Product[] }) {
  return <div className="admin-category-grid">{categories.map((category, index) => <article className="category-admin-card" key={category}><img src={categoryImages[category]} alt="" /><div><span className="eyebrow">KATEGORIE 0{index + 1}</span><h2>{category}</h2><p>{products.filter((product) => product.category === category && !product.archived).length} Produkte in dieser Kollektion</p><StatusBadge label="Veröffentlicht" /></div></article>)}</div>
}

function InventorySection({ products, notify }: { products: Product[]; notify: (message: string) => void }) {
  const { adjustStock } = useStore()
  const active = products.filter((product) => !product.archived)
  const [adjustment, setAdjustment] = useState<Record<string, string>>({})
  return <div className="inventory-layout">
    <div className="inventory-status-grid"><div><span className="stock-status-dot dot-ready" /><strong>{active.filter((p) => p.quantity > 0).length}</strong><span>Auf Lager</span></div><div><span className="stock-status-dot dot-arrival" /><strong>{active.filter((p) => p.quantity === 0 && p.availability === 'In Anlieferung').length}</strong><span>In Anlieferung</span></div><div><span className="stock-status-dot dot-unavailable" /><strong>{active.filter((p) => p.quantity === 0 && p.availability !== 'In Anlieferung').length}</strong><span>Nicht verfügbar</span></div></div>
    <section className="admin-panel"><div className="panel-heading"><div><span className="eyebrow">BESTAND VERWALTEN</span><h2>Lagerbestand</h2></div><span className="low-stock-legend"><CircleAlert size={15} /> Niedriger Bestand: 2 oder weniger</span></div>
      <div className="admin-table-wrap"><table className="admin-table inventory-table"><thead><tr><th>Produkt</th><th>Status</th><th>Bestand</th><th>Einzelstück</th><th>Bestand anpassen</th></tr></thead><tbody>{active.map((product) => <tr key={product.id}><td><div className="table-product"><img src={product.image} alt="" /><div><strong>{product.name}</strong><small>{product.sku}</small></div></div></td><td><StatusBadge label={stockState(product)} /></td><td><strong className={product.quantity <= 2 ? 'quantity-warning' : ''}>{product.quantity} Stk.</strong></td><td>{product.uniquePiece ? <span className="unique-label">Unikat</span> : '—'}</td><td><div className="stock-adjust-control"><input aria-label={`Mengenänderung für ${product.name}`} type="number" step="1" value={adjustment[product.id] ?? ''} placeholder="± Menge" onChange={(event) => setAdjustment((values) => ({ ...values, [product.id]: event.target.value }))} /><button onClick={() => { const delta = Number(adjustment[product.id]); if (!Number.isInteger(delta) || delta === 0) { notify('Bitte eine ganze, von 0 verschiedene Menge eingeben.'); return } if (product.quantity + delta < 0) { notify('Der Bestand kann nicht negativ werden.'); return } adjustStock(product.id, delta, 'Bestandskorrektur'); setAdjustment((values) => ({ ...values, [product.id]: '' })); notify('Bestand wurde aktualisiert.') }}>Anwenden</button></div></td></tr>)}</tbody></table></div>
    </section>
  </div>
}

function ReceivingSection({ products, notify }: { products: Product[]; notify: (message: string) => void }) {
  const { adjustStock } = useStore()
  const [productId, setProductId] = useState(products[0]?.id ?? '')
  const [quantity, setQuantity] = useState('')
  const [reference, setReference] = useState('')
  function receive(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const amount = Number(quantity)
    if (!Number.isInteger(amount) || amount <= 0) { notify('Bitte eine positive ganze Stückzahl eintragen.'); return }
    if (!products.some((product) => product.id === productId)) { notify('Bitte ein gültiges Produkt auswählen.'); return }
    adjustStock(productId, amount, 'Wareneingang')
    setQuantity('')
    setReference('')
    notify('Wareneingang wurde im Demo-Lager erfasst.')
  }
  const { movements } = useStore()
  return <div className="receiving-layout">
    <section className="admin-panel receiving-form-panel"><div className="panel-heading"><div><span className="eyebrow">NEUE LIEFERUNG</span><h2>Wareneingang erfassen</h2></div><Truck size={20} /></div><form className="admin-form" onSubmit={receive}><label>Produkt<select value={productId} onChange={(event) => setProductId(event.target.value)}>{products.filter((product) => !product.archived).map((product) => <option key={product.id} value={product.id}>{product.name} · {product.sku}</option>)}</select></label><label>Eingehende Menge<input required type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="z. B. 4" /></label><label>Lieferschein / Referenz <span className="optional-label">optional</span><input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Interne Notiz" /></label><button className="button button-dark" type="submit"><Plus size={16} /> Zugang buchen</button><p className="form-footnote">Die Referenz bleibt lokal in diesem Demo und wird nicht gespeichert.</p></form></section>
    <section className="admin-panel"><div className="panel-heading"><div><span className="eyebrow">NACHVOLLZIEHBAR</span><h2>Letzte Bewegungen</h2></div></div><MovementList movements={movements} /></section>
  </div>
}

function MovementList({ movements }: { movements: StockMovement[] }) {
  return movements.length ? <div className="movement-list">{movements.slice(0, 8).map((movement) => <div key={movement.id}><span className={`movement-icon ${movement.quantity > 0 ? 'movement-in' : 'movement-out'}`}>{movement.quantity > 0 ? <ArrowDownToLine size={15} /> : <ArrowUpRight size={15} />}</span><span><strong>{movement.productName}</strong><small>{movement.kind} · {movement.date}</small></span><b className={movement.quantity > 0 ? 'movement-positive' : ''}>{movement.quantity > 0 ? '+' : ''}{movement.quantity}</b></div>)}</div> : <div className="admin-empty">Noch keine Lagerbewegungen erfasst.</div>
}

function OrdersSection({ count }: { count: number }) {
  const orders = [
    { id: 'MW-2026-0042', customer: 'Anna Leitner', date: '06.11.2026', amount: '€ 148,00', status: 'In Bearbeitung' },
    { id: 'MW-2026-0041', customer: 'Markus Gruber', date: '04.11.2026', amount: '€ 220,00', status: 'Versendet' },
    { id: 'MW-2026-0040', customer: 'Clara Huber', date: '02.11.2026', amount: '€ 96,00', status: 'Abgeschlossen' },
    { id: 'MW-2026-0039', customer: 'Lukas Steiner', date: '31.10.2026', amount: '€ 285,00', status: 'Abgeschlossen' },
  ]
  return <><div className="admin-note"><CircleAlert size={17} /><span>Demonstrationsansicht. Bestellungen und Kundendaten sind beispielhaft und stammen nicht aus einem echten Shop.</span></div><section className="admin-panel"><div className="table-toolbar"><span className="eyebrow">4 DEMO-EINTRÄGE · {count} ARTIKEL IM KUNDEN-DEMO-WARENKORB</span></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Bestellnummer</th><th>Kunde</th><th>Datum</th><th>Betrag</th><th>Status</th><th></th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td className="sku-cell">{order.id}</td><td>{order.customer}</td><td>{order.date}</td><td>{order.amount}</td><td><StatusBadge label={order.status} /></td><td><button className="table-more" aria-label={`Details für ${order.id}`}><MoreHorizontal size={17} /></button></td></tr>)}</tbody></table></div></section></>
}

function CustomersSection() {
  const customers = [['Anna Leitner', 'kunde-01@example.invalid', '3', '€ 412,00'], ['Markus Gruber', 'kunde-02@example.invalid', '2', '€ 356,00'], ['Clara Huber', 'kunde-03@example.invalid', '1', '€ 96,00']]
  return <><div className="admin-note"><CircleAlert size={17} /><span>Beispielhafte Kundendaten. Es werden keine echten personenbezogenen Daten verarbeitet.</span></div><section className="admin-panel"><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Kunde</th><th>E-Mail (Demo)</th><th>Bestellungen</th><th>Umsatz (Demo)</th></tr></thead><tbody>{customers.map(([name, email, orders, total]) => <tr key={name}><td><div className="customer-name"><span>{name.split(' ').map((part) => part[0]).join('')}</span><strong>{name}</strong></div></td><td>{email}</td><td>{orders}</td><td>{total}</td></tr>)}</tbody></table></div></section></>
}

function MediaSection({ products }: { products: Product[] }) {
  return <div className="media-grid">{products.filter((product) => !product.archived).map((product) => <article key={product.id}><img src={product.image} alt={product.name} /><div><strong>{product.name}</strong><small>{product.category} · {product.sku}</small></div></article>)}</div>
}

function ContentSection({ notify }: { notify: (message: string) => void }) {
  const [title, setTitle] = useState('Die Natur schreibt die schönsten Geschichten.')
  const [subtitle, setSubtitle] = useState('Entdecken Sie ausgewählte Mineralien, Edelsteine und Schmuckstücke.')
  return <div className="settings-layout"><section className="admin-panel"><div className="panel-heading"><div><span className="eyebrow">STARTSEITE · HERO</span><h2>Inhalte bearbeiten</h2></div></div><form className="admin-form" onSubmit={(event) => { event.preventDefault(); notify('Website-Inhalte wurden für diese Demo übernommen.') }}><label>Überschrift<input value={title} onChange={(event) => setTitle(event.target.value)} /></label><label>Unterzeile<textarea rows={3} value={subtitle} onChange={(event) => setSubtitle(event.target.value)} /></label><label>Call-to-Action<input defaultValue="Kollektion entdecken" /></label><button className="button button-dark" type="submit">Änderungen übernehmen <ArrowUpRight size={16} /></button></form></section><aside className="admin-panel content-preview"><span className="eyebrow">VORSCHAU</span><div><span>STEINPLATTE</span><h2>{title}</h2><p>{subtitle}</p><small>Textvorschau · Änderungen bleiben im Demo</small></div></aside></div>
}

function SettingsSection({ notify }: { notify: (message: string) => void }) {
  return <div className="settings-layout"><section className="admin-panel"><div className="panel-heading"><div><span className="eyebrow">ALLGEMEINES</span><h2>Shop-Einstellungen</h2></div></div><form className="admin-form" onSubmit={(event) => { event.preventDefault(); notify('Einstellungen wurden in der Demo übernommen.') }}><label>Shop-Name<input defaultValue="STEINPLATTE" /></label><label>Interface-Sprache<select defaultValue="de-AT"><option value="de-AT">Deutsch (Österreich)</option></select></label><label>Währung<select defaultValue="EUR"><option value="EUR">Euro (EUR)</option></select></label><label className="check-filter"><input type="checkbox" defaultChecked /> Demo-Modus aktivieren</label><button className="button button-dark" type="submit">Einstellungen speichern</button></form></section><aside className="admin-panel setting-notice"><ShieldCheck size={23} /><h2>Nur eine Demo.</h2><p>Keine echte Anmeldung, keine Zahlungen und keine Verbindung zu einem Backend. Einstellungen werden nicht an einen Server übertragen.</p></aside></div>
}

function UsersSection() {
  return <section className="admin-panel"><div className="admin-note"><ShieldCheck size={17} /><span>Der Verwaltungsbereich ist eine rein lokale Demonstration. Es gibt keine Benutzerkonten oder echte Berechtigungsprüfung.</span></div><div className="user-demo-card"><div className="admin-avatar">HM</div><div><span className="eyebrow">DEMO-BENUTZER</span><h2>Hubert Mader</h2><p>Administrator · Vollzugriff in der Vorschau</p></div><StatusBadge label="Demo aktiv" /></div></section>
}

function ProductForm({ mode, product, onClose, onSaved }: { mode: 'new' | 'edit'; product: Product | null; onClose: () => void; onSaved: (message: string) => void }) {
  const { products, saveProduct } = useStore()
  const fileInput = useRef<HTMLInputElement>(null)
  const [expanded, setExpanded] = useState(Boolean(product))
  const [imageError, setImageError] = useState('')
  const [saveError, setSaveError] = useState('')
  type ProductFormState = Omit<Product, 'tags'> & { tagsInput: string }
  const [form, setForm] = useState<ProductFormState>(() => product ? { ...product, tagsInput: product.tags.join(', ') } : {
    id: `mader-${Date.now()}`,
    name: '',
    category: 'Mineralien' as Category,
    price: 0,
    quantity: 0,
    image: '/images/bild-folgt.svg',
    images: [],
    imageIsIllustrative: false,
    description: '',
    mineral: '',
    weight: '',
    dimensions: '',
    color: '',
    sku: '',
    tagsInput: '',
    published: false,
    archived: false,
    uniquePiece: false,
    availability: 'Auf Lager' as Availability,
  })
  const setField = (field: keyof typeof form, value: string | number | boolean) => setForm((current) => ({ ...current, [field]: value }))

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return
    if (files.some((file) => !file.type.startsWith('image/'))) { setImageError('Bitte nur gültige Bilddateien auswählen.'); if (fileInput.current) fileInput.current.value = ''; return }
    if (files.some((file) => file.size > 8_000_000)) { setImageError('Jedes Bild darf für die lokale Demo höchstens 8 MB groß sein.'); if (fileInput.current) fileInput.current.value = ''; return }
    if ((form.images?.length ?? 0) + files.length > 8) { setImageError('Für ein Produkt sind höchstens 8 Bilder möglich.'); if (fileInput.current) fileInput.current.value = ''; return }
    const reads = files.map((file) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result !== 'string') {
          reject(new Error('Ein Bild konnte nicht gelesen werden.'))
          return
        }
        const image = new Image()
        image.onload = () => {
          const scale = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight))
          const canvas = document.createElement('canvas')
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
          const context = canvas.getContext('2d')
          if (!context) {
            reject(new Error('Die Bildvorschau konnte nicht vorbereitet werden.'))
            return
          }
          context.drawImage(image, 0, 0, canvas.width, canvas.height)
          const webp = canvas.toDataURL('image/webp', 0.82)
          resolve(webp.startsWith('data:image/webp')
            ? webp
            : canvas.toDataURL('image/jpeg', 0.78))
        }
        image.onerror = () => reject(new Error('Das Bild konnte nicht dargestellt werden.'))
        image.src = reader.result
      }
      reader.onerror = () => reject(new Error('Ein Bild konnte nicht gelesen werden.'))
      reader.readAsDataURL(file)
    }))
    void Promise.all(reads).then((images) => {
      const currentImageChars = products
        .filter((item) => item.id !== form.id)
        .reduce((total, item) => total + storedImageChars(item), 0)
      const formImages = [...(form.images ?? []), ...images]
      const mainImage = form.images?.length ? form.image : images[0] ?? form.image
      const nextImageChars = currentImageChars
        + formImages.reduce((total, image) => total + image.length, 0)
        + (mainImage.startsWith('data:image/') ? mainImage.length : 0)
      if (nextImageChars > maxStoredImageChars) {
        setImageError('Für die lokale Demo sind insgesamt höchstens 3,6 MB optimierte Bilddaten vorgesehen.')
        return
      }
      setForm((current) => {
        const allImages = [...(current.images ?? []), ...images]
        return { ...current, images: allImages, image: allImages[0] ?? current.image, imageIsIllustrative: false }
      })
      setImageError('')
    }).catch((error: unknown) => {
      setImageError(error instanceof Error ? error.message : 'Die Bilder konnten nicht gelesen werden.')
    }).finally(() => {
      if (fileInput.current) fileInput.current.value = ''
    })
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.name.trim()) return
    const existing = products.find((item) => item.id === form.id)
    const amount = Number(form.quantity)
    const value = Number(form.price)
    if (!Number.isFinite(amount) || amount < 0 || !Number.isInteger(amount) || !Number.isFinite(value) || value < 0) return
    const { tagsInput, ...productFields } = form
    const sku = form.sku.trim() || `MW-${form.category.slice(0, 2).toLocaleUpperCase('de-AT')}-${Date.now().toString().slice(-5)}`
    const next: Product = {
      ...productFields,
      name: form.name.trim(),
      category: form.category,
      price: value,
      quantity: amount,
      description: form.description.trim(),
      mineral: form.mineral?.trim() ?? '',
      weight: form.weight?.trim() ?? '',
      dimensions: form.dimensions?.trim() ?? '',
      color: form.color?.trim() ?? '',
      sku,
      tags: tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean),
      availability: amount > 0 ? 'Auf Lager' : form.availability === 'Auf Lager' ? 'Nicht verfügbar' : form.availability,
      uniquePiece: form.uniquePiece || amount === 1,
      archived: false,
    }
    try {
      saveProduct(next)
      setSaveError('')
      onSaved(mode === 'new' ? 'Produkt wurde angelegt und lokal gespeichert.' : existing ? 'Produkt wurde aktualisiert.' : 'Produkt wurde gespeichert.')
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Das Produkt konnte nicht gespeichert werden.')
    }
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-form-title">
    <div className="modal-header"><div><span className="eyebrow">PRODUKTSTAMMDATEN · DEMO</span><h2 id="product-form-title">{mode === 'new' ? 'Neues Produkt' : 'Produkt bearbeiten'}</h2></div><button className="icon-button" aria-label="Formular schließen" onClick={onClose}><X size={20} /></button></div>
    <form className="admin-form product-form" onSubmit={submit}>
      <label>Produktname<input required autoFocus value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="z. B. Bergkristall-Spitze" /></label>
      <div className="form-row"><label>Kategorie<select value={form.category} onChange={(event) => setField('category', event.target.value as Category)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Verkaufspreis (€)<input required type="number" min="0" step="0.01" value={form.price} onChange={(event) => setField('price', Number(event.target.value))} /></label></div>
      <div className="form-row"><label>Menge<input required type="number" min="0" step="1" value={form.quantity} onChange={(event) => setField('quantity', Number(event.target.value))} /></label><label>Verfügbarkeit<select value={form.availability} onChange={(event) => { if (isAvailability(event.target.value)) setField('availability', event.target.value) }}>{['Auf Lager', 'In Anlieferung', 'Nicht verfügbar'].map((status) => <option key={status}>{status}</option>)}</select></label></div>
      <div className="upload-field"><span className="form-label">Produktbilder</span><input ref={fileInput} className="sr-only" type="file" accept="image/*" multiple onChange={handleImage} /><div className="upload-preview"><div className="upload-thumbnails">{(form.images?.length ? form.images : [form.image]).map((image, index) => <img key={`${image.slice(0, 40)}-${index}`} src={image} alt={`Produktvorschau ${index + 1}`} />)}</div><div><strong>Bildvorschau</strong><small>Ohne Produktfoto wird „Bild folgt“ angezeigt. Bis zu 8 Bilder · max. 8 MB je Datei</small><button type="button" className="text-button" onClick={() => fileInput.current?.click()}><ImagePlus size={15} /> Bilder auswählen</button></div></div>{imageError && <span className="field-error" role="alert">{imageError}</span>}</div>
      <button className="advanced-toggle" type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>Weitere Produktdetails <ChevronDown className={expanded ? 'chevron-open' : ''} size={16} /></button>
      {expanded && <div className="advanced-fields"><label>Beschreibung<textarea rows={3} value={form.description} onChange={(event) => setField('description', event.target.value)} placeholder="Was macht dieses Stück besonders?" /></label><div className="form-row"><label>Mineralart<input value={form.mineral} onChange={(event) => setField('mineral', event.target.value)} /></label><label>Gewicht<input value={form.weight} onChange={(event) => setField('weight', event.target.value)} placeholder="z. B. 420 g" /></label></div><div className="form-row"><label>Maße<input value={form.dimensions} onChange={(event) => setField('dimensions', event.target.value)} placeholder="z. B. 10 × 6 cm" /></label><label>Farbe<input value={form.color} onChange={(event) => setField('color', event.target.value)} /></label></div><label>SKU<input value={form.sku} onChange={(event) => setField('sku', event.target.value)} placeholder="Wird bei Bedarf automatisch vergeben" /></label><label>Tags <span className="optional-label">mit Beistrich trennen</span><input value={form.tagsInput} onChange={(event) => setField('tagsInput', event.target.value)} placeholder="Unikat, Handarbeit" /></label><label className="check-filter"><input type="checkbox" checked={form.uniquePiece} onChange={(event) => setField('uniquePiece', event.target.checked)} /> Einzelstück / Unikat</label></div>}
      <label className="check-filter publish-check"><input type="checkbox" checked={form.published} onChange={(event) => setField('published', event.target.checked)} /> Produkt veröffentlichen</label>
      {saveError && <p className="field-error" role="alert">{saveError}</p>}
      <div className="modal-actions"><button className="button button-quiet" type="button" onClick={onClose}>Abbrechen</button><button className="button button-dark" type="submit">{mode === 'new' ? 'Produkt anlegen' : 'Änderungen speichern'} <Check size={16} /></button></div>
    </form>
  </section></div>
}
