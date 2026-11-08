import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { categories, categoryImages } from '../data'
import { useStore } from '../store'
import { ProductCard, Storefront, categorySlug } from '../components/Storefront'

export function HomePage() {
  const { products } = useStore()
  const featured = products
    .filter((product) => product.published && !product.archived && product.image !== '/images/bild-folgt.svg')
    .slice(0, 4)

  return (
    <Storefront>
      <section className="hero">
        <img className="hero-image" src="/images/smoky-quartz.webp" alt="Rauchquarz-Kristall" />
        <div className="hero-shade" />
        <div className="hero-content">
          <h1>Mineralien mit Charakter.</h1>
          <p>Entdecken Sie ausgewählte Mineralien, Edelsteine und Schmuckstücke.</p>
          <Link className="button button-dark" to="/shop/$category" params={{ category: 'mineralien' }}>Kollektion entdecken <ArrowRight size={17} /></Link>
        </div>
      </section>

      <section className="intro-section section-wrap">
        <div className="intro-copy">
          <p className="display-copy">Mineralien und Edelsteine für besondere Sammlungen und Räume.</p>
          <p>Entdecken Sie natürliche Formen, klare Farben und ausgewählte Schmuckstücke.</p>
          <Link className="text-link" to="/ueber-uns">Über uns <ArrowRight size={16} /></Link>
        </div>
        <div className="intro-image-wrap">
          <img src="/images/fluorite-specimen.jpg" alt="Fluoritkristall mit natürlichen Einschlüssen" loading="lazy" />
        </div>
      </section>

      <section className="category-section" id="kollektionen">
        <div className="section-wrap">
          <div className="section-heading">
            <div><h2>Kollektionen</h2></div>
          </div>
          <div className="category-grid">
            {categories.map((category, index) => (
              <Link key={category} className={`category-tile category-tile-${index + 1}`} to="/shop/$category" params={{ category: categorySlug[category] }}>
                <img src={categoryImages[category]} alt="" loading="lazy" />
                <span className="category-tile-overlay" />
                <span className="category-tile-copy"><span>{category}</span><ArrowRight size={18} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="featured-section section-wrap">
        <div className="section-heading">
          <div><h2>Ausgewählte Produkte</h2></div>
          <Link className="text-link" to="/shop/$category" params={{ category: 'alle' }}>Alle Produkte <ArrowRight size={16} /></Link>
        </div>
        <div className="product-grid">
          {featured.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

    </Storefront>
  )
}
