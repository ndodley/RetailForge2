import { useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import type { AuthRole, RegisterAuthInput } from '../../api/authStore'
import Footer from '../../components/common/Footer'
import Navbar from '../../components/common/Navbar'
import { useAuth } from '../../hooks/useAuth'
import './AuthPage.css'
import * as React from "react";

type AuthTab = 'login' | 'register'

interface RedirectTarget {
  pathname?: string
  search?: string
}

const roleCopy: Record<AuthRole, { title: string; hint: string }> = {
  customer: {
    title: 'Customer',
    hint: 'Shop, save products, and manage your account.',
  },
  manager: {
    title: 'Manager',
    hint: 'Access admin catalog workflows and management tools.',
  },
  employee: {
    title: 'Employee',
    hint: 'Use internal catalog and support workflows.',
  },
}

function resolveRequestedTab(pathname: string, searchParams: URLSearchParams): AuthTab {
  if (pathname === '/register') {
    return 'register'
  }

  if (pathname === '/login') {
    return 'login'
  }

  return searchParams.get('tab') === 'register' ? 'register' : 'login'
}

function AuthPage() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading, login, register } = useAuth()

  const activeTab = resolveRequestedTab(location.pathname, searchParams)

  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })

  const [registerForm, setRegisterForm] = useState<RegisterAuthInput>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    role: 'customer',
  })

  const headingCopy = useMemo(
      () =>
          activeTab === 'login'
              ? {
                icon: '🔒',
                title: 'Sign In',
                subtitle: 'Log in with your RetailForge account to continue.',
                submitLabel: 'Login',
              }
              : {
                icon: '📝',
                title: 'Create Account',
                subtitle: 'Create your RetailForge account and choose your role.',
                submitLabel: 'Register',
              },
      [activeTab],
  )

  function navigateToTab(tab: AuthTab) {
    setErrorMessage('')
    navigate(
        {
          pathname: '/auth',
          search: `?tab=${tab}`,
        },
        {
          replace: location.pathname !== '/auth',
          state: location.state,
        },
    )
  }

  function resolveSuccessDestination(nextRole: AuthRole) {
    const from = location.state?.from as RedirectTarget | string | undefined

    if (from && typeof from === 'object' && from.pathname) {
      return `${from.pathname}${from.search ?? ''}`
    }

    if (typeof from === 'string' && from.length > 0) {
      return from
    }

    return nextRole === 'customer' ? '/products' : '/admin/products'
  }

  function handleLoginChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.currentTarget
    setLoginForm((currentValue) => ({
      ...currentValue,
      [name]: value,
    }))
  }

  function handleRegisterChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.currentTarget
    setRegisterForm((currentValue) => ({
      ...currentValue,
      [name]: value,
    }))
  }

  async function handleLoginSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage('')

    const result = await login(loginForm.email, loginForm.password)

    if (!result.user) {
      setErrorMessage(result.error ?? 'Unable to log in.')
      setSubmitting(false)
      return
    }

    navigate(resolveSuccessDestination(result.user.role), { replace: true })
  }

  async function handleRegisterSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage('')

    const result = await register(registerForm)

    if (!result.user) {
      setErrorMessage(result.error ?? 'Unable to create your account.')
      setSubmitting(false)
      return
    }

    navigate(resolveSuccessDestination(result.user.role), { replace: true })
  }

  if (loading) {
    return (
        <>
          <Navbar />
          <main className="auth-page">
            <div className="auth-page__main">
              <section className="auth-page__card">
                <div className="auth-page__icon" aria-hidden>
                  ⏳
                </div>
                <h1 className="auth-page__title">Loading</h1>
                <p className="auth-page__subtitle">Checking your session…</p>
              </section>
            </div>
          </main>
          <Footer />
        </>
    )
  }

  if (user) {
    return <Navigate to={resolveSuccessDestination(user.role)} replace />
  }

  return (
      <>
        <Navbar />
        <main className="auth-page">
          <div className="auth-page__main">
            <section className="auth-page__card">
              <div className="auth-page__tabs" role="tablist" aria-label="Authentication tabs">
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'login'}
                    className={activeTab === 'login' ? 'auth-page__tab auth-page__tab--active' : 'auth-page__tab'}
                    onClick={() => navigateToTab('login')}
                >
                  Login
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'register'}
                    className={activeTab === 'register' ? 'auth-page__tab auth-page__tab--active' : 'auth-page__tab'}
                    onClick={() => navigateToTab('register')}
                >
                  Register
                </button>
              </div>

              <div className="auth-page__icon" aria-hidden>
                {headingCopy.icon}
              </div>

              <h1 className="auth-page__title">{headingCopy.title}</h1>
              <p className="auth-page__subtitle">{headingCopy.subtitle}</p>

              {errorMessage ? (
                  <div className="auth-page__alert auth-page__alert--error" role="alert">
                    {errorMessage}
                  </div>
              ) : null}

              {activeTab === 'login' ? (
                  <form className="auth-page__form" onSubmit={handleLoginSubmit}>
                    <input
                        className="auth-page__input"
                        type="email"
                        name="email"
                        placeholder="Email"
                        autoComplete="email"
                        value={loginForm.email}
                        onChange={handleLoginChange}
                        required
                    />

                    <input
                        className="auth-page__input"
                        type="password"
                        name="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        required
                    />

                    <button
                        type="submit"
                        className="auth-page__submit auth-page__submit--login"
                        disabled={submitting}
                    >
                      {submitting ? 'Signing in...' : headingCopy.submitLabel}
                    </button>
                  </form>
              ) : (
                  <form className="auth-page__form" onSubmit={handleRegisterSubmit}>
                    <div className="auth-page__form-grid auth-page__form-grid--two">
                      <input
                          className="auth-page__input"
                          type="text"
                          name="firstName"
                          placeholder="First Name"
                          autoComplete="given-name"
                          value={registerForm.firstName}
                          onChange={handleRegisterChange}
                          required
                      />

                      <input
                          className="auth-page__input"
                          type="text"
                          name="lastName"
                          placeholder="Last Name"
                          autoComplete="family-name"
                          value={registerForm.lastName}
                          onChange={handleRegisterChange}
                          required
                      />
                    </div>

                    <div className="auth-page__form-grid auth-page__form-grid--two">
                      <input
                          className="auth-page__input"
                          type="email"
                          name="email"
                          placeholder="Email"
                          autoComplete="email"
                          value={registerForm.email}
                          onChange={handleRegisterChange}
                          required
                      />

                      <input
                          className="auth-page__input"
                          type="text"
                          name="phoneNumber"
                          placeholder="Phone Number"
                          autoComplete="tel"
                          value={registerForm.phoneNumber}
                          onChange={handleRegisterChange}
                          required
                      />
                    </div>

                    <input
                        className="auth-page__input"
                        type="password"
                        name="password"
                        placeholder="Password"
                        autoComplete="new-password"
                        value={registerForm.password}
                        onChange={handleRegisterChange}
                        required
                    />

                    <div className="auth-page__roles">
                      {(Object.entries(roleCopy) as Array<[AuthRole, { title: string; hint: string }]>).map(
                          ([role, copy]) => (
                              <label key={role}>
                                <input
                                    className="auth-page__roleInput"
                                    type="radio"
                                    name="role"
                                    value={role}
                                    checked={registerForm.role === role}
                                    onChange={handleRegisterChange}
                                />
                                <span className="auth-page__roleCard">
                          <span className="auth-page__roleTitle">{copy.title}</span>
                          <span className="auth-page__roleHint">{copy.hint}</span>
                        </span>
                              </label>
                          ),
                      )}
                    </div>

                    <textarea
                        className="auth-page__textarea"
                        name="address"
                        placeholder="Address"
                        autoComplete="street-address"
                        value={registerForm.address}
                        onChange={handleRegisterChange}
                        required
                    />

                    <button
                        type="submit"
                        className="auth-page__submit auth-page__submit--register"
                        disabled={submitting}
                    >
                      {submitting ? 'Creating account...' : headingCopy.submitLabel}
                    </button>
                  </form>
              )}

              <div className="auth-page__footer">
                {activeTab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                    type="button"
                    className="auth-page__footerButton"
                    onClick={() => navigateToTab(activeTab === 'login' ? 'register' : 'login')}
                >
                  {activeTab === 'login' ? 'Register' : 'Login'}
                </button>
              </div>
            </section>
          </div>
        </main>
        <Footer />
      </>
  )
}

export default AuthPage