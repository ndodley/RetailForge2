import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from './useAuth'

// Mirrors backend/src/main/resources/application.properties:
// server.servlet.session.timeout=4h - keep these in sync if that changes.
const LOGOUT_AFTER_MS = 4 * 60 * 60 * 1000
// Warn the user 2 hours before that auto-logout actually happens.
const WARNING_AFTER_MS = LOGOUT_AFTER_MS - 2 * 60 * 60 * 1000
const CHECK_INTERVAL_MS = 15_000

const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = ['mousedown', 'keydown', 'touchstart', 'scroll']

// Tracks page activity for a logged-in user and surfaces a "are you still
// there?" warning 2 hours before the backend's session would time out, so
// nobody gets silently logged out mid-task without a chance to stay signed in.
export function useSessionTimeoutWarning() {
    const { isAuthenticated, logout, refreshUser } = useAuth()
    const [show, setShow] = useState(false)
    // Placeholder only - always overwritten by the effect below (synchronously,
    // before any listener/interval can fire) as soon as isAuthenticated is
    // true, so calling Date.now() here during render isn't needed and trips
    // the react-hooks/purity rule.
    const lastActivityRef = useRef(0)
    const warningShownAtRef = useRef<number | null>(null)

    // Any page interaction counts as "still here" - but only before the
    // warning is showing. Once it's up, only the Yes/No buttons resolve it,
    // so a stray mouse movement can't silently dismiss a warning that's
    // meant to get an explicit answer.
    useEffect(() => {
        if (!isAuthenticated) return

        function markActive() {
            if (warningShownAtRef.current === null) {
                lastActivityRef.current = Date.now()
            }
        }

        ACTIVITY_EVENTS.forEach(evt => window.addEventListener(evt, markActive, { passive: true }))
        return () => {
            ACTIVITY_EVENTS.forEach(evt => window.removeEventListener(evt, markActive))
        }
    }, [isAuthenticated])

    useEffect(() => {
        if (!isAuthenticated) {
            // Resets the warning state on logout.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShow(false)
            warningShownAtRef.current = null
            return
        }

        lastActivityRef.current = Date.now()
        warningShownAtRef.current = null
        setShow(false)

        const interval = setInterval(() => {
            const now = Date.now()

            if (warningShownAtRef.current === null) {
                if (now - lastActivityRef.current >= WARNING_AFTER_MS) {
                    warningShownAtRef.current = now
                    setShow(true)
                }
                return
            }

            // No response to the warning within its own window - the backend
            // session has timed out by now anyway, so log out locally to match.
            if (now - warningShownAtRef.current >= LOGOUT_AFTER_MS - WARNING_AFTER_MS) {
                setShow(false)
                warningShownAtRef.current = null
                void logout()
            }
        }, CHECK_INTERVAL_MS)

        return () => clearInterval(interval)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated])

    const stayLoggedIn = useCallback(async () => {
        setShow(false)
        warningShownAtRef.current = null
        lastActivityRef.current = Date.now()
        // Re-fetches the current user, which touches the backend session and
        // resets its inactivity clock the same way any real request would.
        await refreshUser()
    }, [refreshUser])

    const logOutNow = useCallback(async () => {
        setShow(false)
        warningShownAtRef.current = null
        await logout()
    }, [logout])

    return { show, stayLoggedIn, logOutNow }
}
