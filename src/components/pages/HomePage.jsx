import React from 'react';
import { Zap, Clock, DollarSign, Search, CreditCard, MapPin, Shield, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../style/HomePage.css';


export function HomePage() {
  return (
    <div className="home-page">
      {/* Decorative Galaxy Particles */}
      <div className="galaxy-particles">
        <div className="particle particle-cyan"></div>
        <div className="particle particle-blue"></div>
        <div className="particle particle-purple"></div>
        <div className="particle particle-pink"></div>
      </div>

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-content">
            <div className="navbar-brand">
              <div className="brand-icon">
                <MapPin className="icon" />
              </div>
              <span className="brand-name">SmartPark</span>
            </div>
            
            <div className="navbar-menu">
              <a href="#features" className="nav-link">Fonctionnalités</a>
              <a href="#how-it-works" className="nav-link">Comment ça marche</a>
              <a href="#pricing" className="nav-link">Tarifs</a>
              <Link to="/login" className="btn-primary">
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Shield className="badge-icon" />
            <span className="badge-text">Propulsé par la Blockchain</span>
          </div>
          
          <h1 className="hero-title">
            Parking Intelligent,
            <br />
            Expérience Futuriste
          </h1>
          
          <p className="hero-description">
            Trouvez, réservez et payez votre place de parking en quelques secondes.
            <br />
            Sécurisé par la blockchain, disponible partout.
          </p>
          
          <div className="hero-actions">
            <Link to="/map" className="btn-hero-primary">
              Trouver un parking
            </Link>
            <button className="btn-hero-secondary">
              En savoir plus
            </button>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2 className="section-title">Pourquoi SmartPark ?</h2>
          <p className="section-subtitle">Les problèmes de stationnement traditionnels, résolus</p>
        </div>
        
        <div className="features-grid">
          <FeatureCard
            icon={Clock}
            title="Perte de temps"
            description="Fini les tours sans fin pour trouver une place. Notre système vous indique les places disponibles en temps réel."
            gradient="pink"
          />
          <FeatureCard
            icon={DollarSign}
            title="Frais cachés"
            description="Transparence totale des prix. Pas de frais cachés, pas de mauvaises surprises. Payez uniquement ce que vous utilisez."
            gradient="yellow"
          />
          <FeatureCard
            icon={Shield}
            title="Sécurité"
            description="Transactions sécurisées par blockchain. Vos paiements et données sont protégés par une technologie de pointe."
            gradient="blue"
          />
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="steps-section">
        <div className="section-header">
          <h2 className="section-title">Comment ça marche ?</h2>
          <p className="section-subtitle">3 étapes simples pour stationner</p>
        </div>
        
        <div className="steps-container">
          <Step
            number="01"
            icon={Search}
            title="Localisez"
            description="Trouvez une place libre en temps réel sur notre carte interactive"
            gradient="cyan"
          />
          <Step
            number="02"
            icon={CreditCard}
            title="Réservez"
            description="Payez de manière sécurisée via MetaMask en 1 clic"
            gradient="blue"
          />
          <Step
            number="03"
            icon={MapPin}
            title="Garez-vous"
            description="Votre place est réservée et protégée par capteurs IoT"
            gradient="purple"
          />
        </div>
      </section>

      {/* Blockchain Section */}
      <section className="blockchain-section">
        <div className="blockchain-container">
          <div className="blockchain-visual">
            <div className="blockchain-icon-container">
              <Shield className="blockchain-icon" />
            </div>
          </div>
          <div className="blockchain-content">
            <div className="blockchain-tag">
              ⛓️ Propulsé par la Blockchain
            </div>
            <h2 className="blockchain-title">
              Sécurité et Transparence Absolues
            </h2>
            <p className="blockchain-description">
              La blockchain garantit la sécurité de vos transactions, l'immutabilité de vos réservations 
              et l'élimination des intermédiaires. Profitez de frais réduits et d'une traçabilité complète.
            </p>
            <ul className="blockchain-features">
              <BlockchainFeature text="Paiements instantanés" color="cyan" />
              <BlockchainFeature text="Historique immuable" color="blue" />
              <BlockchainFeature text="Frais réduits" color="purple" />
              <BlockchainFeature text="Contrats intelligents" color="pink" />
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="section-header">
          <h2 className="section-title">Tarification Simple</h2>
          <p className="section-subtitle">Choisissez le plan qui vous convient</p>
        </div>
        
        <div className="pricing-grid">
          <PricingCard
            name="BASIQUE"
            price="2€"
            period="/heure"
            features={[
              'Réservation en temps réel',
              'Paiement sécurisé',
              'Support client'
            ]}
            buttonText="Choisir"
            buttonVariant="outline"
          />
          
          <PricingCard
            name="PREMIUM"
            price="15€"
            period="/mois"
            features={[
              'Tout du plan Basique',
              '10h incluses par mois',
              'Réservation prioritaire',
              'Accès parkings premium'
            ]}
            buttonText="Choisir"
            buttonVariant="gradient"
            popular
          />
          
          <PricingCard
            name="ENTREPRISE"
            price="Sur mesure"
            period=""
            features={[
              'Tout du plan Premium',
              'Places réservées',
              'Gestion multi-véhicules',
              'Dashboard admin'
            ]}
            buttonText="Nous contacter"
            buttonVariant="primary"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="brand-icon">
                  <MapPin className="icon" />
                </div>
                <span className="brand-name">SmartPark</span>
              </div>
              <p className="footer-tagline">
                Le futur du stationnement intelligent, propulsé par la blockchain.
              </p>
            </div>
            
            <FooterColumn
              title="Produit"
              links={[
                { text: 'Fonctionnalités', href: '#' },
                { text: 'Tarifs', href: '#' },
                { text: 'FAQ', href: '#' }
              ]}
            />
            
            <FooterColumn
              title="Entreprise"
              links={[
                { text: 'À propos', href: '#' },
                { text: 'Carrières', href: '#' },
                { text: 'Contact', href: '#' }
              ]}
            />
            
            <FooterColumn
              title="Légal"
              links={[
                { text: 'Confidentialité', href: '#' },
                { text: 'CGU', href: '#' },
                { text: 'Mentions légales', href: '#' }
              ]}
            />
          </div>
          
          <div className="footer-bottom">
            <p>© 2026 SmartPark. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Component: FeatureCard
function FeatureCard({ icon: Icon, title, description, gradient }) {
  return (
    <div className="feature-card">
      <div className={`feature-icon feature-icon-${gradient}`}>
        <Icon className="icon" />
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  );
}

// Component: Step
function Step({ number, icon: Icon, title, description, gradient }) {
  return (
    <div className="step">
      <div className={`step-number step-number-${gradient}`}>
        <span>{number}</span>
      </div>
      <div className="step-icon-container">
        <Icon className="step-icon" />
      </div>
      <h3 className={`step-title step-title-${gradient}`}>{title}</h3>
      <p className="step-description">{description}</p>
    </div>
  );
}

// Component: BlockchainFeature
function BlockchainFeature({ text, color }) {
  return (
    <li className="blockchain-feature">
      <div className={`blockchain-feature-icon blockchain-feature-icon-${color}`}>
        <CheckCircle2 className="icon" />
      </div>
      <span className="blockchain-feature-text">{text}</span>
    </li>
  );
}

// Component: PricingCard
function PricingCard({ name, price, period, features, buttonText, buttonVariant, popular }) {
  return (
    <div className={`pricing-card ${popular ? 'pricing-card-popular' : ''}`}>
      {popular && (
        <div className="pricing-badge">POPULAIRE</div>
      )}
      <div className="pricing-header">
        <div className="pricing-name">{name}</div>
        <div className="pricing-price">
          <span className="price-amount">{price}</span>
          {period && <span className="price-period">{period}</span>}
        </div>
      </div>
      <ul className="pricing-features">
        {features.map((feature, index) => (
          <li key={index} className="pricing-feature">
            <CheckCircle2 className={`feature-icon ${popular ? 'feature-icon-purple' : 'feature-icon-cyan'}`} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button className={`pricing-button pricing-button-${buttonVariant}`}>
        {buttonText}
      </button>
    </div>
  );
}

// Component: FooterColumn
function FooterColumn({ title, links }) {
  return (
    <div className="footer-column">
      <h4 className="footer-column-title">{title}</h4>
      <ul className="footer-links">
        {links.map((link, index) => (
          <li key={index}>
            <a href={link.href} className="footer-link">{link.text}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;