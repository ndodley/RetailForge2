import React from 'react'
import './Button.css'

export type ButtonVariant = 'primary' | 'danger' | 'pill'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    fullWidth?: boolean
}

const Button: React.FC<ButtonProps> = ({
                                           variant = 'primary',
                                           fullWidth = false,
                                           className = '',
                                           children,
                                           ...rest
                                       }) => {
    const classes = [
        'rf-btn',
        `rf-btn--${variant}`,
        fullWidth ? 'rf-btn--full' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <button className={classes} {...rest}>
            {children}
        </button>
    )
}

export default Button
