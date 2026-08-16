import { Navigate, useLocation, Link } from "react-router-dom"
import Layout from "../../components/common/Layout"
import { useAuth } from "../../hooks/useAuth"
import { useMyProfile } from "../../hooks/profile/useMyProfile"
import { buildAvatarUrl } from "../../api/users"
import "./MyProfilePage.css"

const DEFAULT_AVATAR = buildAvatarUrl(null)

function MyProfilePage() {
    const { user, loading } = useAuth()
    const location = useLocation()

    const {
        profile,
        isLoading,
        errorMessage,
        successMessage,
        isEditing,
        isSaving,
        draft,
        setDraft,
        startEdit,
        cancelEdit,
        saveProfile,
        selectedFile,
        setSelectedFile,
        previewUrl,
        isUploading,
        handleUploadAvatar,
    } = useMyProfile()

    if (loading) {
        return <div className="myprof-fullscreen">Loading...</div>
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (isLoading) {
        return <div className="myprof-fullscreen">Loading your profile...</div>
    }

    const avatarSrc = previewUrl || buildAvatarUrl(profile?.avatar_path)
    const roleValue = String(profile?.role || "").toLowerCase()
    const shouldShowRole = roleValue !== "customer" && roleValue !== ""

    return (
        <Layout isStorefront>
            <div className="myprof-page">
                <div className="myprof-topbar">
                    <Link to="/products" className="myprof-back-link">
                        ← Back to products
                    </Link>
                </div>

                <div className="myprof-panel">
                    <div className="myprof-panel-header">
                        <div className="myprof-heading">
                            <div className="myprof-heading-icon" aria-hidden>
                                👤
                            </div>
                            <div className="myprof-title-block">
                                <h2 className="myprof-title">My Profile</h2>
                                <span className="myprof-subtitle">
                                    View and edit your account info, plus upload an avatar.
                                </span>
                            </div>
                        </div>

                        <div className="myprof-actions">
                            {!isEditing ? (
                                <button type="button" className="myprof-btn myprof-btn--outline" onClick={startEdit}>
                                    Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        className="myprof-btn"
                                        onClick={cancelEdit}
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="myprof-btn myprof-btn--primary"
                                        onClick={saveProfile}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? "Saving…" : "Save Changes"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="myprof-panel-body">
                        {errorMessage && <div className="myprof-error">{errorMessage}</div>}
                        {successMessage && <div className="myprof-success">{successMessage}</div>}

                        <div className="myprof-sections">
                            <div className="myprof-card">
                                <div className="myprof-card-title">Avatar</div>

                                <div className="myprof-avatar-wrap">
                                    <img
                                        src={avatarSrc}
                                        alt="Your avatar"
                                        className="myprof-avatar"
                                        onError={(e) => {
                                            const img = e.target as HTMLImageElement
                                            img.onerror = null
                                            img.src = DEFAULT_AVATAR
                                        }}
                                    />
                                    {shouldShowRole && (
                                        <span className={`myprof-avatar-role-dot myprof-avatar-role-dot--${roleValue}`} />
                                    )}
                                </div>

                                <label className="myprof-file-input">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                                    />
                                    <span>{selectedFile ? selectedFile.name : "Choose an image…"}</span>
                                </label>

                                <button
                                    type="button"
                                    className="myprof-btn myprof-btn--accent"
                                    onClick={handleUploadAvatar}
                                    disabled={isUploading || !selectedFile}
                                >
                                    {isUploading ? "Uploading…" : "Upload Avatar"}
                                </button>
                            </div>

                            <div className="myprof-card">
                                <div className="myprof-card-title">Account Info</div>

                                <div className="myprof-fields">
                                    <div className="myprof-field">
                                        <span className="myprof-field-label">First Name</span>
                                        {isEditing ? (
                                            <input
                                                className="myprof-input"
                                                value={draft.first_name}
                                                onChange={(e) =>
                                                    setDraft((d) => ({ ...d, first_name: e.target.value }))
                                                }
                                            />
                                        ) : (
                                            <span className="myprof-value">{profile?.first_name || "—"}</span>
                                        )}
                                    </div>

                                    <div className="myprof-field">
                                        <span className="myprof-field-label">Last Name</span>
                                        {isEditing ? (
                                            <input
                                                className="myprof-input"
                                                value={draft.last_name}
                                                onChange={(e) =>
                                                    setDraft((d) => ({ ...d, last_name: e.target.value }))
                                                }
                                            />
                                        ) : (
                                            <span className="myprof-value">{profile?.last_name || "—"}</span>
                                        )}
                                    </div>

                                    <div className="myprof-field">
                                        <span className="myprof-field-label">
                                            <span aria-hidden>📱</span> Phone
                                        </span>
                                        {isEditing ? (
                                            <input
                                                className="myprof-input"
                                                value={draft.phoneNumber}
                                                onChange={(e) =>
                                                    setDraft((d) => ({ ...d, phoneNumber: e.target.value }))
                                                }
                                            />
                                        ) : (
                                            <span className="myprof-value">{profile?.phoneNumber || "—"}</span>
                                        )}
                                    </div>

                                    {shouldShowRole && (
                                        <div className="myprof-field">
                                            <span className="myprof-field-label">Role</span>
                                            <span className={`myprof-role-badge myprof-role-badge--${roleValue}`}>
                                                {profile?.role}
                                            </span>
                                        </div>
                                    )}

                                    <div className="myprof-field myprof-field--full">
                                        <span className="myprof-field-label">
                                            <span aria-hidden>📧</span> Email
                                        </span>
                                        {isEditing ? (
                                            <input
                                                className="myprof-input"
                                                value={draft.email}
                                                onChange={(e) =>
                                                    setDraft((d) => ({ ...d, email: e.target.value }))
                                                }
                                            />
                                        ) : (
                                            <span className="myprof-value myprof-value--wrap">
                                                {profile?.email || "—"}
                                            </span>
                                        )}
                                    </div>

                                    <div className="myprof-field myprof-field--full">
                                        <span className="myprof-field-label">
                                            <span aria-hidden>📍</span> Address
                                        </span>
                                        {isEditing ? (
                                            <textarea
                                                className="myprof-input myprof-textarea"
                                                value={draft.address}
                                                onChange={(e) =>
                                                    setDraft((d) => ({ ...d, address: e.target.value }))
                                                }
                                            />
                                        ) : (
                                            <span className="myprof-value myprof-value--pre">
                                                {profile?.address || "—"}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {shouldShowRole && isEditing && (
                                    <div className="myprof-note">Note: role cannot be changed here.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default MyProfilePage
