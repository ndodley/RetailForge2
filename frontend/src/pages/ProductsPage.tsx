import { useState } from "react"
import type { ButtonHTMLAttributes } from "react"
import Layout from "../components/common/Layout"
import AdvancedSearchPanel from "../components/common/AdvancedSearchPanel"
import ProductCard from "../components/common/ProductCard"

import { useStorefrontData } from "../hooks/products/useStorefrontData.ts"
import { usePublicProductFilters } from "../hooks/products/usePublicProductFilters.ts"
import { usePagination } from "../hooks/usePagination.ts"
import "./ProductsPage.css"

const PAGE_SIZE = 8

// Public button for AdvancedSearchPanel
function PublicButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button type="button" className="product-page__search-btn" {...props}>
			{children}
		</button>
	)
}

function ProductsPage() {
	const { products, categories, departments, loading, error } = useStorefrontData()

	const {
		search,
		setSearch,
		filterSections,
		filteredProducts,
		resetFilters,
	} = usePublicProductFilters(products, categories, departments)

	const [filtersOpen, setFiltersOpen] = useState(false)

	const {
		setPage,
		safePage,
		totalPages,
		pagedItems,
	} = usePagination(filteredProducts, PAGE_SIZE)

	return (
		<Layout isStorefront>
			<div className="product-page">
				<h2 className="product-page__title">Shop All Products</h2>

				<div className="product-page__search-wrap">
					<AdvancedSearchPanel
						title="Advanced Search"
						query={search}
						onQueryChange={setSearch}
						isOpen={filtersOpen}
						onToggleOpen={() => setFiltersOpen((v) => !v)}
						onSearch={() => setFiltersOpen(false)}
						onReset={resetFilters}
						sections={filterSections}
						ActionButtonComponent={PublicButton}
					/>
				</div>

				{loading ? (
					<div className="product-page__loading">Loading products...</div>
				) : error ? (
					<div className="product-page__error">{error}</div>
				) : (
					<>
						{filteredProducts.length > 0 && (
							<div className="product-page__results-bar">
								<div className="product-page__results-copy">
									Showing {(safePage - 1) * PAGE_SIZE + 1}-
									{Math.min(safePage * PAGE_SIZE, filteredProducts.length)} of{" "}
									{filteredProducts.length}
								</div>

								<div className="product-page__pagination">
									<button
										type="button"
										className="product-page__page-btn"
										disabled={safePage <= 1}
										onClick={() => setPage((p) => p - 1)}
									>
										Prev
									</button>

									<div className="product-page__page-indicator">
										Page {safePage} / {totalPages}
									</div>

									<button
										type="button"
										className="product-page__page-btn"
										disabled={safePage >= totalPages}
										onClick={() => setPage((p) => p + 1)}
									>
										Next
									</button>
								</div>
							</div>
						)}

						<div className="product-page__grid">
							{filteredProducts.length === 0 ? (
								<div className="product-page__empty">No products found.</div>
							) : (
								pagedItems.map((product) => <ProductCard key={product.id} product={product} />)
							)}
						</div>
					</>
				)}
			</div>
		</Layout>
	)
}

export default ProductsPage
