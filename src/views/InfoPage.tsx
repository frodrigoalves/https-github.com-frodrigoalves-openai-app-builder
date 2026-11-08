import { ArrowRight, Check, Mail, MapPin } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { Breadcrumbs, Storefront } from '../components/Storefront'

export function InfoPage({ page }: { page: 'about' | 'contact' }) {
  const isContact = page === 'contact'
  const [submitted, setSubmitted] = useState(false)
  function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <Storefront>
      <div className="section-wrap info-page">
        <Breadcrumbs items={[{ label: isContact ? 'Kontakt' : 'Über uns' }]} />
        {isContact ? (
          <>
            <div className="info-heading"><h1>Kontakt</h1><p>Haben Sie Fragen zu einem Produkt oder Material? Schreiben Sie uns über das Formular.</p></div>
            <div className="contact-layout">
              <form className="contact-form" onSubmit={submitContact}>
                <label>Ihr Name<input required name="name" autoComplete="name" placeholder="Vor- und Nachname" /></label>
                <label>E-Mail-Adresse<input required name="email" type="email" autoComplete="email" placeholder="name@beispiel.at" /></label>
                <label>Worum geht es?<select name="topic" defaultValue="Allgemeine Anfrage"><option>Allgemeine Anfrage</option><option>Frage zu einem Produkt</option><option>Pflege & Material</option><option>Sonstiges</option></select></label>
                <label>Ihre Nachricht<textarea required name="message" rows={5} placeholder="Wie können wir Ihnen weiterhelfen?" /></label>
                <button className="button button-dark" type="submit">Nachricht vorbereiten <ArrowRight size={16} /></button>
                {submitted && <p className="inline-notice" role="status"><Check size={16} /> Danke für Ihre Nachricht. Dieses Demo-Formular übermittelt noch keine Daten.</p>}
              </form>
              <aside className="contact-aside">
                <div><Mail size={18} /><span><strong>Persönlich für Sie da</strong><small>Nutzen Sie das Formular für Ihre Anfrage.</small></span></div>
                <div><MapPin size={18} /><span><strong>Demo-Shop</strong><small>Es ist kein Ladengeschäft angegeben.</small></span></div>
              </aside>
            </div>
          </>
        ) : (
          <div className="about-layout">
            <div className="about-copy">
              <span className="eyebrow">STEINPLATTE</span>
              <h1>Mineralien und <em>Edelsteine</em></h1>
              <p className="about-lead">Natürliche Kristallformen und Mineralien in unterschiedlichen Farben und Strukturen.</p>
              <p>STEINPLATTE lädt dazu ein, Mineralien und Edelsteine näher kennenzulernen. Jedes Stück zeigt eine natürliche Form und individuelle Farbgebung.</p>
              <p>Die Abbildungen dienen der Veranschaulichung.</p>
              <Link className="text-link" to="/shop/$category" params={{ category: 'alle' }}>Unsere Auswahl entdecken <ArrowRight size={16} /></Link>
            </div>
            <div className="about-image"><img src="/images/smoky-quartz.webp" alt="Rauchquarz-Kristall" /></div>
          </div>
        )}
      </div>
    </Storefront>
  )
}
