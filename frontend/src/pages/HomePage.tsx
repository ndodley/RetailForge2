import { Link } from 'react-router-dom'
import Layout from '../components/common/Layout'
import HomeProductShowcase from '../components/HomeProductShowcase.tsx'
import { useAuth } from '../hooks/useAuth'
import './HomePage.css'

const trustBadges = [
	{ icon: '🚚', label: 'Fast delivery' },
	{ icon: '↩️', label: 'Easy returns' },
	{ icon: '🔒', label: 'Secure checkout' },
	{ icon: '💬', label: '24/7 AI assistant' },
]

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
	const { user } = useAuth()

	return (
		<Layout isStorefront>
			<div className="home-page">
				<section className="home-landing">
					<div className="home-landing__glow" aria-hidden />

					<span className="home-landing__eyebrow">New arrivals every week</span>

					<h1 className="home-landing__title">
						Welcome to <span>RF2_P2</span>
					</h1>
					<p className="home-landing__subtitle">
						Discover the best deals on electronics, games, fashion, and more. Shop with confidence and
						enjoy fast delivery, easy returns, and exclusive offers!
					</p>

					{!user && (
						<div className="home-landing__actions">
							<Link to="/products" className="home-cta home-cta--primary">
								Shop now
							</Link>
							<Link to="/auth?tab=register" className="home-cta home-cta--secondary">
								Create a free account
							</Link>
						</div>
					)}

					<ul className="home-trust-strip">
						{trustBadges.map((badge) => (
							<li key={badge.label} className="home-trust-strip__item">
								<span aria-hidden>{badge.icon}</span>
								{badge.label}
							</li>
						))}
					</ul>

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
								{user ? (
									<Link to="/my-orders" className="home-cta home-cta--secondary">
										My orders
									</Link>
								) : (
									<Link to="/auth?tab=register" className="home-cta home-cta--secondary">
										Create account
									</Link>
								)}
							</div>
						</div>

						<div className="home-feature-grid">
							{featureCards.map((feature) => (
								<article key={feature.title} className="home-feature-card">
									<div className="home-feature-card__icon" aria-hidden>
										{feature.icon}
									</div>
									<div className="home-feature-card__title">{feature.title}</div>
									<div className="home-feature-card__description">{feature.description}</div>
								</article>
							))}
						</div>
					</div>
				</section>
			</div>
		</Layout>
	)
}

export default HomePage
