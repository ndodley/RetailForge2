import type React from "react"
import Button, { type ButtonVariant } from "../common/Button"
import "./AdminButton.css"

export type AdminButtonVariant = ButtonVariant | "surface"

interface AdminButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: AdminButtonVariant
    fullWidth?: boolean
    icon?: "edit" | "delete" | "filter" | "search" | "none"
}

const AdminButton: React.FC<AdminButtonProps> = ({
                                                     variant = "primary",
                                                     fullWidth = false,
                                                     className = "",
                                                     icon = "none",
                                                     children,
                                                     ...rest
                                                 }) => {
    const classes = ["rf-admin-btn", className].filter(Boolean).join(" ")

    const buttonVariant: ButtonVariant =
        variant === "surface"
            ? ("secondary" as ButtonVariant)
            : (variant as ButtonVariant)

    const iconMap: Record<string, string> = {
        edit: "✏️",
        delete: "🗑️",
        filter: "⚙️",
        search: "🔍",
        none: "",
    }

    const iconSymbol = iconMap[icon] ?? ""

    return (
        <Button
            variant={buttonVariant}
            fullWidth={fullWidth}
            className={classes}
            {...rest}
        >
            {iconSymbol && (
                <span className="rf-admin-btn-icon">{iconSymbol}</span>
            )}
            <span className="rf-admin-btn-label">{children}</span>
        </Button>
    )
}

export default AdminButton
