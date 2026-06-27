import Layout from "../components/common/Layout"
import AdvancedSearchPanel from "../components/common/AdvancedSearchPanel"
import ProductCard from "../components/common/ProductCard"

import { useStorefrontData } from "../hooks/useStorefrontData"
import { usePublicProductFilters } from "../hooks/usePublicProductFilters"
import { useState } from "react"

// Public button for AdvancedSearchPanel
function PublicButton({ children, ...props }) {
	return (
		<button
			style={{
				padding: "8px 14px",
				borderRadius: 10,
				fontWeight: 700,
				background: "var(--accent)",
				color: "white",
				border: "none",
				cursor: "pointer",
			}}
			{...props}
		>
			{children}
		</button>
	)
}

function ProductPage() {
	const { products, categories, departments, loading, error } = useStorefrontData()

	const {
		search,
		setSearch,
		filterSections,
		filteredProducts,
		resetFilters,
	} = usePublicProductFilters(products, categories, departments)

	const [filtersOpen, setFiltersOpen] = useState(false)
	const [page, setPage] = useState(1)
	const pageSize = 8

	const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
	const safePage = Math.min(Math.max(1, page), totalPages)
	const pagedProducts = filteredProducts.slice((safePage - 1) * pageSize, safePage * pageSize)

	return (
		<Layout isStorefront>
			<h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Shop All Products</h2>

			<div style={{ maxWidth: 900, margin: "0 auto 24px", width: "100%" }}>
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
				<div style={{ textAlign: "center", padding: "3rem 1rem", fontWeight: 800 }}>
					Loading products...
				</div>
			) : error ? (
				<div style={{ textAlign: "center", padding: "2rem 1rem", color: "#ef4444", fontWeight: 800 }}>
					{error}
				</div>
			) : (
				<>
					{filteredProducts.length > 0 && (
						<div className="product-page__results-bar">
							<div className="product-page__results-copy">
								Showing {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, filteredProducts.length)} of{" "}
								{filteredProducts.length}
							</div>

							<div className="product-page__pagination">
								<button disabled={safePage <= 1} onClick={() => setPage(Math.max(1, safePage - 1))}>
									Prev
								</button>

								<div className="product-page__page-indicator">
									Page {safePage} / {totalPages}
								</div>

								<button disabled={safePage >= totalPages} onClick={() => setPage(Math.min(totalPages, safePage + 1))}>
									Next
								</button>
							</div>
						</div>
					)}

					<div className="product-page__grid">
						{filteredProducts.length === 0 ? (
							<div className="product-page__empty">No products found.</div>
						) : (
							pagedProducts.map((product) => <ProductCard key={product.id} product={product} />)
						)}
					</div>
				</>
			)}
		</Layout>
	)
}

export default ProductPage
