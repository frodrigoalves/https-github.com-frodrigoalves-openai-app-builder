import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowDownWideNarrow, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { categories } from '../data'
import { useStore } from '../store'
import type { Category } from '../types'
import { Breadcrumbs, ProductCard, Storefront, categorySlug } from '../components/Storefront'

const categoryFromSlug = (slug: string): Category | undefined =>
  categories.find((category) => categorySlug[category] === slug)

export function CollectionPage() {
  const { category: slug } = useParams({ from: '/shop/$category' })
  const { products, search, setSearch } = useStore()
  const [sort, setSort] = useState('empfohlen')
  const [availabilityOnly, setAvailabilityOnly] = useState(false)
  const [maxPrice, setMaxPrice] = useState('500')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const navigate = useNavigate()
  const category = categoryFromSlug(slug)
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('de-AT')
    const visible = products.filter((product) => {
      if (!product.published || product.archived) return false
      if (category && product.category !== category) return false
      if (query && !`${product.name} ${product.category} ${product.mineral ?? ''} ${product.tags.join(' ')}`.toLocaleLowerCase('de-AT').includes(query)) return false
      if (availabilityOnly && product.quantity < 1) return false
      return product.price <= Number(maxPrice || 0)
    })
    if (sort === 'preis-aufsteigend') return visible.sort((a, b) => a.price - b.price)
    if (sort === 'preis-absteigend') return visible.sort((a, b) => b.price - a.price)
    if (sort === 'name') return visible.sort((a, b) => a.name.localeCompare(b.name, 'de-AT'))
    return visible
  }, [products, category, search, availabilityOnly, maxPrice, sort])
  const heading = category ?? 'Alle Produkte'

  return (
    <Storefront>
      <div className="collection-intro">
        <div className="section-wrap">
          <Breadcrumbs items={[{ label: 'Kollektionen', to: '/shop/$category', category: 'alle' }, { label: heading }]} />
          <h1>{heading}<em>{category ? '.' : ' entdecken.'}</em></h1>
          <p>Natürliche Schönheit, besondere Formen und ausgewählte Stücke mit Charakter.</p>
        </div>
      </div>
      <section className="collection-layout section-wrap">
        <aside className={`filter-sidebar ${filtersOpen ? 'filter-sidebar-open' : ''}`}>
          <div className="filter-title"><span>Kollektionen</span><SlidersHorizontal size={16} /></div>
          <div className="filter-categories">
            <Link to="/shop/$category" params={{ category: 'alle' }} className={!category ? 'active' : ''}>Alle Produkte</Link>
            {categories.map((item) => <Link key={item} to="/shop/$category" params={{ category: categorySlug[item] }} className={category === item ? 'active' : ''}>{item}</Link>)}
          </div>
          <label className="filter-label" htmlFor="max-price">Preis bis € {maxPrice}</label>
          <input id="max-price" className="range-input" type="range" min="20" max="500" step="10" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} />
          <div className="range-values"><span>€ 20</span><span>€ 500</span></div>
          <label className="check-filter"><input type="checkbox" checked={availabilityOnly} onChange={(event) => setAvailabilityOnly(event.target.checked)} /> Nur lagernde Produkte</label>
          <button className="filter-reset" onClick={() => { setAvailabilityOnly(false); setMaxPrice('500'); setSearch('') }}>Filter zurücksetzen</button>
        </aside>
        <div className="collection-results">
          <div className="collection-toolbar">
            <p><strong>{filtered.length}</strong> {filtered.length === 1 ? 'Fundstück' : 'Fundstücke'}</p>
            <div className="toolbar-controls">
              <input aria-label="Produkte durchsuchen" className="collection-search" placeholder="Kollektion durchsuchen" value={search} onChange={(event) => setSearch(event.target.value)} />
              <button className="filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={16} /> Filter</button>
              <label className="sort-select"><ArrowDownWideNarrow size={16} /><span className="sr-only">Sortieren nach</span>
                <select value={sort} onChange={(event) => setSort(event.target.value)}>
                  <option value="empfohlen">Empfohlen</option>
                  <option value="preis-aufsteigend">Preis aufsteigend</option>
                  <option value="preis-absteigend">Preis absteigend</option>
                  <option value="name">Name</option>
                </select>
              </label>
            </div>
          </div>
          {filtered.length
            ? <div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div>
            : <div className="empty-state"><span className="empty-mark">∅</span><h2>Hier ist es noch ruhig.</h2><p>Für diese Auswahl haben wir gerade keine passenden Fundstücke. Ändern Sie die Filter oder stöbern Sie in allen Kollektionen.</p><button className="button button-dark" onClick={() => { setAvailabilityOnly(false); setMaxPrice('500'); setSearch(''); void navigate({ to: '/shop/$category', params: { category: 'alle' } }) }}>Alle Produkte ansehen</button></div>}
        </div>
      </section>
    </Storefront>
  )
}
