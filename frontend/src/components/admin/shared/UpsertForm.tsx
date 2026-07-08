import React from "react"
import AdminButton from "../AdminButton"
import "./UpsertForm.css"

interface UpsertFormProps {
    title: string
    subtitle?: string
    submitLabel?: string
    isSaving: boolean
    isEditing: boolean
    onSubmit: () => void
    onBack: () => void
    children: React.ReactNode
}

function UpsertForm({
                        title,
                        subtitle,
                        submitLabel,
                        isSaving,
                        isEditing,
                        onSubmit,
                        onBack,
                        children,
                    }: UpsertFormProps) {
    const btnLabel = submitLabel ?? (isEditing ? "Save Changes" : "Add")

    return (
        <div className="rf-upsert-wrapper">
            <div className="rf-upsert-page-header">
                <h2 className="rf-upsert-page-title">{title}</h2>
                {subtitle && <p className="rf-upsert-page-subtitle">{subtitle}</p>}
            </div>

            <div className="rf-upsert">
                <div className="rf-upsert-body">{children}</div>

                <div className="rf-upsert-actions">
                    <AdminButton variant="primary" onClick={onSubmit} disabled={isSaving}>
                        {btnLabel}
                    </AdminButton>
                    <AdminButton variant="surface" onClick={onBack}>
                        Go Back
                    </AdminButton>
                </div>
            </div>
        </div>
    )
}

export default UpsertForm