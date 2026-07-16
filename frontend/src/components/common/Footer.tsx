import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
	return (
		<footer className="site-footer">
			<div className="site-footer-inner">
				<div className="site-footer-brand">RF2_P2</div>

				<div className="site-footer-links">
					<Link to="/products" className="site-footer-link">Products</Link>
					<Link to="/admin/departments" className="site-footer-link">Departments</Link>
					<Link to="/cart" className="site-footer-link">Cart</Link>
					<Link to="/admin/products" className="site-footer-link">Admin Products</Link>
				</div>

				<div className="site-footer-copy">
					© {new Date().getFullYear()} RF2_P2. All rights reserved.
				</div>
			</div>
		</footer>
	)
}

export default Footer
