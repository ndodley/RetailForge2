import React from "react"
import AdminButton from "../AdminButton"
import "./UpsertForm.css"

interface UpsertFormProps {
    title: string
    subtitle?: string
    isSaving: boolean
    isEditing: boolean
    onSubmit: () => void
    onBack: () => void
    children: React.ReactNode
}

function UpsertForm({
                        title,
                        subtitle,
                        isSaving,
                        isEditing,
                        onSubmit,
                        onBack,
                        children,
                    }: UpsertFormProps) {
    return (
        <div className="rf-upsert">
            <div className="rf-upsert-header">
                <h2 className="rf-upsert-title">{title}</h2>
                {subtitle && <p className="rf-upsert-subtitle">{subtitle}</p>}
            </div>

            <div className="rf-upsert-body">{children}</div>

            <div className="rf-upsert-actions">
                <AdminButton
                    variant="primary"
                    onClick={onSubmit}
                    disabled={isSaving}
                >
                    {isEditing ? "Save Changes" : "Add Department"}
                </AdminButton>

                <AdminButton variant="surface" onClick={onBack}>
                    Go Back
                </AdminButton>
            </div>
        </div>
    )
}

export default UpsertForm