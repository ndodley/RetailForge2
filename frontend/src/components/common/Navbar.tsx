import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { fetchCart, subscribeToCartChanges } from '../../api/cart'
import { buildAvatarUrl } from '../../api/users'
import './Navbar.css'

const adminItems = [
	{ to: '/admin/departments', label: 'Departments' },
	{ to: '/admin/categories', label: 'Categories' },
	{ to: '/admin/products', label: 'Products' },
	{ to: '/admin/orders', label: 'Orders' },
	{ to: '/admin/users', label: 'Users' },
	{ to: '/admin/reviews', label: 'Reviews' },
]

function isAuthRoute(pathname: string) {
	return pathname === '/auth' || pathname === '/login' || pathname === '/register'
}

const DEFAULT_AVATAR = buildAvatarUrl(null)

// Renders an email with a soft break opportunity right after the "@" so that,
// if it must wrap, it wraps between the local part and the domain instead of
// splitting a word in half.
function renderBreakableEmail(email: string) {
	const atIndex = email.indexOf('@')
	if (atIndex === -1) return email

	return (
		<>
			{email.slice(0, atIndex + 1)}
			<wbr />
			{email.slice(atIndex + 1)}
		</>
	)
}

function Navbar() {
	const location = useLocation()
	const navigate = useNavigate()
	const { user, canAccessAdmin, logout } = useAuth()

	const [adminOpen, setAdminOpen] = useState(false)
	const [accountOpen, setAccountOpen] = useState(false)
	const [cartCount, setCartCount] = useState(0)

	const [theme, setTheme] = useState<'dark' | 'light'>(() => {
		if (typeof window === 'undefined') return 'dark'

		const documentTheme = document.documentElement.getAttribute('data-theme')
		if (documentTheme === 'dark' || documentTheme === 'light') return documentTheme

		const storedTheme = window.localStorage.getItem('rf2-theme')
		if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme

		return 'dark'
	})

	const accountDisplayName = useMemo(
		() => (user ? `${user.firstName} ${user.lastName}`.trim() || user.email : ''),
		[user],
	)

	const accountAvatarSrc = useMemo(() => buildAvatarUrl(user?.avatar_path), [user])

	/*const userRoleLabel = useMemo(
		() => (user ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}` : ''),
		[user],
	)*/

	const userRoleLabel = useMemo(() => {
		if (!user || !user.role) return ''
		return user.role.charAt(0).toUpperCase() + user.role.slice(1)
	}, [user])


	// Apply theme
	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme)
		window.localStorage.setItem('rf2-theme', theme)
	}, [theme])

	// Stable callback for loading cart count
	const loadCartCount = useCallback(async () => {
		if (!user) {
			setCartCount(0)
			return
		}

		try {
			const cart = await fetchCart()
			setCartCount(cart.totalItems ?? 0)
		} catch {
			setCartCount(0)
		}
	}, [user])

	// Load on mount + user change (async-safe pattern)
	useEffect(() => {
		let active = true

		;(async () => {
			if (!active) return
			await loadCartCount()
		})()

		return () => {
			active = false
		}
	}, [loadCartCount])

	// Listen for global cart updates (async-safe pattern)
	useEffect(() => {
		const unsubscribe = subscribeToCartChanges(() => {
			;(async () => {
				await loadCartCount()
			})()
		})

		return unsubscribe
	}, [loadCartCount])

	// Close dropdowns on outside click
	useEffect(() => {
		const handleClick = (event: MouseEvent) => {
			const target = event.target as HTMLElement

			if (!target.closest('.admin-dropdown-parent')) setAdminOpen(false)
			if (!target.closest('.account-dropdown-parent')) setAccountOpen(false)
		}

		document.addEventListener('mousedown', handleClick)
		return () => document.removeEventListener('mousedown', handleClick)
	}, [])

	return (
		<nav className="navbar">
			<div className="navbar-inner">
				<div className="navbar-left">
					<div className="navbar-logo">
						<Link to="/" className={location.pathname === '/' ? 'active' : ''}>
							RetailForge2
						</Link>
					</div>

					{canAccessAdmin && (
						<div className="admin-dropdown-parent">
							<button
								type="button"
								className={`navbar-pill admin-button ${adminOpen ? 'open' : ''}`}
								onClick={() => setAdminOpen((o) => !o)}
							>
								Admin <span className="caret">▼</span>
							</button>

							<ul className={`navbar-menu ${adminOpen ? 'open' : ''}`}>
								{adminItems.map((item) => (
									<li key={item.to}>
										<Link
											to={item.to}
											className={`navbar-menu-item ${
												location.pathname === item.to ? 'navbar-menu-item--active' : ''
											}`}
											onClick={() => setAdminOpen(false)}
										>
											{item.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					)}

					<Link
						to="/products"
						className={`navbar-pill ${
							location.pathname.startsWith('/products') ? 'navbar-pill--active' : ''
						}`}
					>
						Products
					</Link>
				</div>

				<div className="navbar-right">
					<Link
						to="/cart"
						className={`navbar-pill cart-pill ${
							location.pathname === '/cart' ? 'navbar-pill--active' : ''
						}`}
					>
						<span className="cart-icon">🛒</span>
						<span className="cart-text">
              				Cart{cartCount > 0 ? ` (${cartCount})` : ''}
            			</span>

					</Link>

					{user ? (
						<div className="account-dropdown-parent">
							<button
								type="button"
								className={`navbar-pill account-button ${accountOpen ? 'open' : ''}`}
								onClick={() => setAccountOpen((o) => !o)}
							>
								<img
									className="navbar-avatar"
									src={accountAvatarSrc}
									alt={accountDisplayName}
									onError={(event) => {
										if (event.currentTarget.src !== DEFAULT_AVATAR) {
											event.currentTarget.src = DEFAULT_AVATAR
										}
									}}
								/>

								<span className="account-info">
									<span className="account-name">{accountDisplayName}</span>
									<span className="account-role">{userRoleLabel}</span>
								</span>

								<span className="caret accent">▼</span>
							</button>

							<ul className={`navbar-menu navbar-menu--right ${accountOpen ? 'open' : ''}`}>
								<li>
									<div className="navbar-menu-item account-email">
										<span className="account-email-value">{renderBreakableEmail(user.email)}</span>
										<span className="account-role small">{userRoleLabel}</span>
									</div>
								</li>

								<li>
									<Link
										to="/my-profile"
										onClick={() => setAccountOpen(false)}
										className={`navbar-menu-item ${
											location.pathname === '/my-profile' ? 'navbar-menu-item--active' : ''
										}`}
									>
										<span>👤</span> Profile
									</Link>
								</li>

								<li>
									<Link
										to="/my-orders"
										onClick={() => setAccountOpen(false)}
										className={`navbar-menu-item ${
											location.pathname === '/my-orders' ? 'navbar-menu-item--active' : ''
										}`}
									>
										<span>📦</span> My Orders
									</Link>
								</li>

								<li>
									<Link
										to="/my-reviews"
										onClick={() => setAccountOpen(false)}
										className={`navbar-menu-item ${
											location.pathname === '/my-reviews' ? 'navbar-menu-item--active' : ''
										}`}
									>
										<span>⭐</span> My Reviews
									</Link>
								</li>

								<li>
									<Link
										to="/my-favorites"
										onClick={() => setAccountOpen(false)}
										className={`navbar-menu-item ${
											location.pathname === '/my-favorites' ? 'navbar-menu-item--active' : ''
										}`}
									>
										<span>❤️</span> My Favorites
									</Link>
								</li>

								<li>
									<button
										type="button"
										className="navbar-menu-item logout-button"
										onClick={() => {
											void logout()
											setAccountOpen(false)
											setAdminOpen(false)
											navigate('/')
										}}
									>
										<span>🚪</span> Logout
									</button>
								</li>
							</ul>
						</div>
					) : (
						<>
							<Link
								to="/auth?tab=login"
								className={`navbar-pill ${
									isAuthRoute(location.pathname) && location.search !== '?tab=register'
										? 'navbar-pill--active'
										: ''
								}`}
							>
								Login
							</Link>

							<Link
								to="/auth?tab=register"
								className={`navbar-pill ${
									isAuthRoute(location.pathname) && location.search === '?tab=register'
										? 'navbar-pill--active'
										: ''
								}`}
							>
								Register
							</Link>
						</>
					)}

					<button
						type="button"
						className="navbar-pill theme-toggle"
						onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
					>
						<span>{theme === 'dark' ? '🌙' : '☀️'}</span>
					</button>
				</div>
			</div>
		</nav>
	)
}

export default Navbar
