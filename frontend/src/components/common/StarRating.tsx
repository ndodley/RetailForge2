interface StarRatingProps {
    rating: number
    wrapperClassName?: string
    wrapperAriaLabel?: string
    getStarClassName?: (filled: boolean) => string | undefined
}

// Shared read-only star display. Was previously duplicated (the same
// Array.from({ length: 5 }) filled/empty loop) in ReviewRow, AdminReviewTable,
// ProductInfoPage, and HomeProductShowcase. Each caller passes its own class
// names via getStarClassName/wrapperClassName so this is a drop-in
// replacement for what each file already rendered — no CSS had to change.
//
// MyReviewTable's star picker is NOT included here on purpose: it renders
// clickable <button> elements to let a user pick a rating while editing a
// review, which is a genuinely different (interactive) component, not just
// a display with different styling.
function StarRating({ rating, wrapperClassName, wrapperAriaLabel, getStarClassName }: StarRatingProps) {
    const filledCount = Math.round(rating)

    return (
        <span
            className={wrapperClassName}
            aria-hidden={wrapperAriaLabel ? undefined : true}
            aria-label={wrapperAriaLabel}
        >
            {Array.from({ length: 5 }).map((_, i) => {
                const filled = i < filledCount
                return (
                    <span key={i} className={getStarClassName?.(filled)}>
                        {filled ? '★' : '☆'}
                    </span>
                )
            })}
        </span>
    )
}

export default StarRating
