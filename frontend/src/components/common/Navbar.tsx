import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getCartItemCount, subscribeToCartUpdates } from '../../api/cartStore'
import './Navbar.css'

const adminItems = [
  { to: '/admin/departments', label: 'Departments' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/products', label: 'Products' },
]

function Navbar() {
  const location = useLocation()
  const [adminOpen, setAdminOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
	if (typeof window === 'undefined') {
	  return 'dark'
	}

	const documentTheme = document.documentElement.getAttribute('data-theme')
	if (documentTheme === 'dark' || documentTheme === 'light') {
	  return documentTheme
	}

	const storedTheme = window.localStorage.getItem('rf2-theme')
	if (storedTheme === 'dark' || storedTheme === 'light') {
	  return storedTheme
	}

	return 'dark'
  })
  const [cartCount, setCartCount] = useState(() => getCartItemCount())

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
	window.localStorage.setItem('rf2-theme', theme)
  }, [theme])

  useEffect(() => subscribeToCartUpdates(() => setCartCount(getCartItemCount())), [])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement

      if (!target.closest('.admin-dropdown-parent')) {
        setAdminOpen(false)
      }

      if (!target.closest('.account-dropdown-parent')) {
        setAccountOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
	<nav
	  className="navbar"
	  style={{
		borderBottom: '1px solid var(--border)',
		background: 'var(--nav-bg)',
		padding: '1.5rem 1rem',
		position: 'sticky',
		top: 0,
		zIndex: 1000,
	  }}
	>
	  <div
		style={{
		  maxWidth: 1200,
		  margin: '0 auto',
		  display: 'flex',
		  alignItems: 'center',
		  gap: 18,
		  width: '100%',
		}}
	  >
		<div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', minWidth: 0 }}>
		  <div style={{ fontWeight: 900, fontSize: 'clamp(24px, 2.4vw, 32px)', letterSpacing: 0.3, color: 'var(--accent)', marginRight: 18, lineHeight: 1 }}>
			<Link
			  to="/"
			  style={{
				textDecoration: 'none',
				color: 'var(--accent)',
				borderBottom: location.pathname === '/' ? '3px solid var(--accent)' : '3px solid transparent',
				paddingBottom: 3,
				transition: 'border 0.2s',
			  }}
			>
			  RetailForge
			</Link>
		  </div>

		  <div className="admin-dropdown-parent" style={{ position: 'relative' }}>
			<button
			  type="button"
			  className="navbar-pill"
			  style={{
				fontWeight: 800,
				cursor: 'pointer',
				color: 'var(--text)',
				padding: '8px 16px',
				borderRadius: 999,
				transition: 'background 0.2s, border 0.2s',
				border: '1.5px solid rgba(255,152,0,0.35)',
				background: adminOpen ? 'rgba(255,152,0,0.14)' : 'var(--nav-pill-bg)',
			  }}
			  onClick={() => setAdminOpen((open) => !open)}
			>
			  Admin <span style={{ fontSize: 14 }}>▼</span>
			</button>

			<ul
			  className="navbar-menu"
			  style={{
				position: 'absolute',
				top: 44,
				left: 0,
				background: 'var(--nav-menu-bg)',
				border: '1.5px solid rgba(255,152,0,0.45)',
				borderRadius: 14,
				boxShadow: 'var(--shadow)',
				padding: 8,
				margin: 0,
				minWidth: 190,
				zIndex: 100,
				display: adminOpen ? 'block' : 'none',
				listStyle: 'none',
			  }}
			>
			  {adminItems.map((item) => (
				<li key={item.to}>
				  <Link
					to={item.to}
					className={`navbar-menu-item ${location.pathname === item.to ? 'navbar-menu-item--active' : ''}`}
					onClick={() => setAdminOpen(false)}
					style={{ display: 'block', padding: '10px 12px', color: 'var(--text)', textDecoration: 'none', fontWeight: 800, borderRadius: 10 }}
				  >
					{item.label}
				  </Link>
				</li>
			  ))}
			</ul>
		  </div>

		  <Link
			to="/products"
			className={`navbar-pill ${location.pathname.startsWith('/products') ? 'navbar-pill--active' : ''}`}
			style={{
			  fontWeight: 800,
			  color: 'var(--text)',
			  textDecoration: 'none',
			  padding: '8px 16px',
			  borderRadius: 999,
			  border: '1.5px solid transparent',
			  background: location.pathname.startsWith('/products') ? 'rgba(255,152,0,0.14)' : 'var(--nav-pill-bg)',
			  transition: 'background 0.2s, border 0.2s',
			}}
		  >
			Products
		  </Link>
		</div>

		<div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
		  <Link
			to="/cart"
			title="Shopping Cart"
			className={`navbar-pill ${location.pathname === '/cart' ? 'navbar-pill--active' : ''}`}
			style={{
			  display: 'flex',
			  alignItems: 'center',
			  gap: 8,
			  color: 'var(--accent)',
			  textDecoration: 'none',
			  padding: '8px 14px',
			  borderRadius: 999,
			  border: location.pathname === '/cart' ? '1.5px solid rgba(255,152,0,0.55)' : '1.5px solid rgba(255,152,0,0.30)',
			  background: location.pathname === '/cart' ? 'rgba(255,152,0,0.10)' : 'var(--nav-pill-bg-2)',
			  transition: 'background 0.2s, border 0.2s',
			}}
		  >
			<span role="img" aria-label="cart" style={{ fontSize: 20 }}>🛒</span>
			<span style={{ fontWeight: 900, color: 'var(--text)' }}>Cart{cartCount > 0 ? ` (${cartCount})` : ''}</span>
		  </Link>

		  <div className="account-dropdown-parent" style={{ position: 'relative' }}>
			<button
			  type="button"
			  className="navbar-pill"
			  onClick={() => setAccountOpen((open) => !open)}
			  style={{
				display: 'flex',
				alignItems: 'center',
				gap: 10,
				padding: '8px 14px',
				borderRadius: 999,
				border: '1.5px solid rgba(255,152,0,0.35)',
				background: accountOpen ? 'rgba(255,152,0,0.14)' : 'var(--nav-pill-bg)',
				cursor: 'pointer',
				transition: 'background 0.2s, border 0.2s',
			  }}
			>
			  <span className="navbar-avatar" aria-hidden>
				AD
			  </span>
			  <span style={{ color: 'var(--text)', fontWeight: 900, fontSize: 14, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
				admin@dummy.com
			  </span>
			  <span style={{ color: 'var(--accent)', fontWeight: 900, fontSize: 12 }}>▼</span>
			</button>

			<ul
			  className="navbar-menu navbar-menu--right"
			  style={{
				position: 'absolute',
				top: 46,
				right: 0,
				background: 'var(--nav-menu-bg)',
				border: '1.5px solid rgba(255,152,0,0.45)',
				borderRadius: 14,
				boxShadow: 'var(--shadow)',
				padding: 8,
				margin: 0,
				minWidth: 220,
				zIndex: 120,
				display: accountOpen ? 'block' : 'none',
				listStyle: 'none',
			  }}
			>
			  <li>
				<Link to="/" onClick={() => setAccountOpen(false)} className="navbar-menu-item" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: 'var(--text)', textDecoration: 'none', fontWeight: 900, borderRadius: 10 }}>
				  <span aria-hidden>👤</span> Home
				</Link>
			  </li>
			  <li>
				<Link to="/products" onClick={() => setAccountOpen(false)} className="navbar-menu-item" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', color: 'var(--text)', textDecoration: 'none', fontWeight: 900, borderRadius: 10 }}>
				  <span aria-hidden>🛍️</span> Products
				</Link>
			  </li>
			  <li>
				<button
				  type="button"
				  className="navbar-menu-item"
				  onClick={() => setAccountOpen(false)}
				  style={{
					display: 'flex',
					alignItems: 'center',
					gap: 10,
					padding: '10px 12px',
					color: 'var(--text)',
					textDecoration: 'none',
					fontWeight: 900,
					borderRadius: 10,
					background: 'transparent',
					border: 'none',
					width: '100%',
					cursor: 'pointer',
					textAlign: 'left',
				  }}
				>
				  <span aria-hidden>🚪</span> Logout
				</button>
			  </li>
			</ul>
		  </div>

		  <button
			type="button"
			className="navbar-pill theme-toggle"
			onClick={() => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))}
			aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
			title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
			style={{
			  display: 'inline-flex',
			  alignItems: 'center',
			  justifyContent: 'center',
			  gap: 8,
			  padding: '8px 14px',
			  borderRadius: 999,
			  border: '1.5px solid rgba(255,152,0,0.35)',
			  background: 'var(--nav-pill-bg)',
			  color: 'var(--text)',
			  cursor: 'pointer',
			  fontWeight: 900,
			  fontSize: 14,
			  transition: 'background 0.2s, border 0.2s',
			}}
		  >
			<span aria-hidden style={{ fontSize: 16 }}>{theme === 'dark' ? '🌙' : '☀️'}</span>
		  </button>
		</div>
	  </div>
	</nav>
  )
}

export default Navbar

