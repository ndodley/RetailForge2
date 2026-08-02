import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './Footer.css'

function Footer() {
	const { user } = useAuth()

	return (
		<footer className="site-footer">
			<div className="site-footer-inner">
				<div className="site-footer-columns">
					<div className="site-footer-col site-footer-col--brand">
						<Link to="/" className="site-footer-brand">RF2_P2</Link>
						<p className="site-footer-tagline">
							Electronics, games, fashion, and more — with fast delivery and easy returns.
						</p>
					</div>

					<div className="site-footer-col">
						<div className="site-footer-heading">Shop</div>
						<Link to="/" className="site-footer-link">Home</Link>
						<Link to="/products" className="site-footer-link">All products</Link>
						<Link to="/cart" className="site-footer-link">Cart</Link>
					</div>

					<div className="site-footer-col">
						<div className="site-footer-heading">Account</div>
						{user ? (
							<>
								<Link to="/my-orders" className="site-footer-link">My orders</Link>
								<Link to="/my-favorites" className="site-footer-link">My favorites</Link>
								<Link to="/my-reviews" className="site-footer-link">My reviews</Link>
								<Link to="/my-profile" className="site-footer-link">My profile</Link>
							</>
						) : (
							<>
								<Link to="/auth?tab=login" className="site-footer-link">Sign in</Link>
								<Link to="/auth?tab=register" className="site-footer-link">Create account</Link>
							</>
						)}
					</div>
				</div>

				<div className="site-footer-bottom">
					<span className="site-footer-copy">
						© {new Date().getFullYear()} RF2_P2. All rights reserved.
					</span>
				</div>
			</div>
		</footer>
	)
}

export default Footer
