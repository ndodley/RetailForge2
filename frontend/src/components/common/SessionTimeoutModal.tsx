import { useSessionTimeoutWarning } from '../../hooks/useSessionTimeoutWarning'
import Button from './Button'
import './SessionTimeoutModal.css'

function SessionTimeoutModal() {
    const { show, stayLoggedIn, logOutNow } = useSessionTimeoutWarning()

    if (!show) return null

    return (
        <div className="session-timeout-overlay" role="presentation">
            <div
                className="session-timeout-card"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="session-timeout-title"
                aria-describedby="session-timeout-desc"
            >
                <div className="session-timeout-icon" aria-hidden="true">⏳</div>
                <h2 id="session-timeout-title">Are you still there?</h2>
                <p id="session-timeout-desc">
                    You've been inactive for a while. For your security, you'll be
                    logged out automatically soon unless you confirm you're still here.
                </p>
                <div className="session-timeout-actions">
                    <Button variant="danger" onClick={() => void logOutNow()}>
                        No
                    </Button>
                    <Button variant="primary" onClick={() => void stayLoggedIn()}>
                        Yes
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default SessionTimeoutModal
