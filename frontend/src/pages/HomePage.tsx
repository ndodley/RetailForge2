import { Link } from 'react-router-dom'
import Footer from '../components/common/Footer'
import Navbar from '../components/common/Navbar'
import HomeProductShowcase from './HomeProductShowcase'

const featureCards = [
  {
	icon: '★',
	title: 'Favorites that stick',
	description: 'Tap the star to save items and come back later.',
  },
  {
	icon: '🧾',
	title: 'Order history',
	description: 'View past orders and details anytime in your account.',
  },
  {
	icon: '✍️',
	title: 'Reviews + ratings',
	description: 'Read reviews and leave your own to help others decide.',
  },
  {
	icon: '🔒',
	title: 'Stock-safe checkout',
	description: 'Checkout handles stock updates safely to avoid overselling.',
  },
]

function HomePage() {
  return (
	<>
	  <Navbar />
	  <main className="home-page">
		<section className="home-landing">
		  <h1 className="home-landing__title">
			Welcome to <span>RetailForge</span>
		  </h1>
		  <p className="home-landing__subtitle">
			Discover the best deals on electronics, games, fashion, and more. Shop with confidence and
			enjoy fast delivery, easy returns, and exclusive offers!
		  </p>
		  <HomeProductShowcase />
		</section>

		<section className="section-block">
		  <div className="home-feature-shell">
			<div className="home-feature-shell__header">
			  <div className="home-feature-shell__copy">
				<div className="home-feature-shell__title">
				  Built for browsing, saving, and checking out fast.
				</div>
				<div className="home-feature-shell__subtitle">
				  Save favorites, track orders, and review products — all in one place.
				</div>
			  </div>
			  <div className="home-feature-shell__actions">
				<Link to="/products" className="home-cta home-cta--primary">
				  Browse products
				</Link>
				<Link to="/auth?tab=register" className="home-cta home-cta--secondary">
				  Create account
				</Link>
			  </div>
			</div>

			<div className="home-feature-grid">
			  {featureCards.map((feature) => (
				<article key={feature.title} className="home-feature-card">
				  <div className="home-feature-card__title">
					<span aria-hidden>{feature.icon}</span>
					{feature.title}
				  </div>
				  <div className="home-feature-card__description">{feature.description}</div>
				</article>
			  ))}
			</div>
		  </div>
		</section>
	  </main>
	  <Footer />
	</>
  )
}

export default HomePage

