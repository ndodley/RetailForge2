import { useEffect, useMemo, useState } from 'react'
import { fetchCategories, type CategoryDto } from '../api/categories'
import { fetchDepartments, getApiErrorMessage, type DepartmentDto } from '../api/departments'
import { fetchStoreProducts, type StoreProductDto } from '../api/products'
import AdvancedSearchPanel from '../components/common/AdvancedSearchPanel'
import Footer from '../components/common/Footer'
import Navbar from '../components/common/Navbar'
import ProductCard from '../components/common/ProductCard'

function ProductPage() {
  const [products, setProducts] = useState<StoreProductDto[]>([])
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [sortBy, setSortBy] = useState('best')
  const [sortOrder, setSortOrder] = useState('asc')
  const [stockFilter, setStockFilter] = useState('any')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const pageSize = 8

  useEffect(() => {
	let isMounted = true

	async function loadStorefrontData() {
	  setLoading(true)
	  setError(null)

	  try {
		const [productsData, categoriesData, departmentsData] = await Promise.all([
		  fetchStoreProducts(),
		  fetchCategories(),
		  fetchDepartments(),
		])

		if (!isMounted) {
		  return
		}

		setProducts(productsData)
		setCategories(categoriesData)
		setDepartments(departmentsData)
	  } catch (loadError) {
		if (!isMounted) {
		  return
		}

		setError(getApiErrorMessage(loadError, 'Failed to load products, categories, or departments.'))
	  } finally {
		if (isMounted) {
		  setLoading(false)
		}
	  }
	}

	void loadStorefrontData()

	return () => {
	  isMounted = false
	}
  }, [])

  const availableCategories = useMemo(() => {
	if (selectedDepartment === 'all') {
	  return []
	}

	return categories.filter((category) => String(category.departmentId) === selectedDepartment)
  }, [categories, selectedDepartment])

  const departmentOptions = useMemo(
	() => [
	  { value: 'all', label: 'Any' },
	  ...[...departments]
		.sort((left, right) => left.name.localeCompare(right.name))
		.map((department) => ({ value: String(department.id), label: department.name })),
	],
	[departments],
  )

  const categoryOptions = useMemo(
	() => [
	  { value: 'all', label: 'Any' },
	  ...[...availableCategories]
		.sort((left, right) => left.name.localeCompare(right.name))
		.map((category) => ({ value: String(category.id), label: category.name })),
	],
	[availableCategories],
  )

  const filterSections = useMemo(
	() => [
	  {
		key: 'sort',
		title: 'Sort',
		type: 'radio' as const,
		value: sortBy,
		onChange: (value: string | string[]) => setSortBy(String(value)),
		options: [
		  { value: 'best', label: 'Best Match' },
		  { value: 'alpha', label: 'Alphabet' },
		  { value: 'price', label: 'Price' },
		  { value: 'stock', label: 'Stock' },
		],
	  },
	  {
		key: 'order',
		title: 'Order',
		type: 'radio' as const,
		value: sortOrder,
		onChange: (value: string | string[]) => setSortOrder(String(value)),
		options: [
		  { value: 'asc', label: 'Ascending' },
		  { value: 'desc', label: 'Descending' },
		],
	  },
	  {
		key: 'department',
		title: 'Department',
		type: 'radio' as const,
		value: selectedDepartment,
		onChange: (value: string | string[]) => {
		  const nextDepartment = String(value)
		  setSelectedDepartment(nextDepartment)
		  setSelectedCategory('all')
		},
		options: departmentOptions,
	  },
	  {
		key: 'category',
		title: 'Category',
		type: 'radio' as const,
		value: selectedCategory,
		onChange: (value: string | string[]) => setSelectedCategory(String(value)),
		options: categoryOptions,
	  },
	  {
		key: 'stock',
		title: 'In Stock',
		type: 'radio' as const,
		value: stockFilter,
		onChange: (value: string | string[]) => setStockFilter(String(value)),
		options: [
		  { value: 'any', label: 'Any' },
		  { value: 'in', label: 'True' },
		  { value: 'out', label: 'False' },
		],
	  },
	],
	[categoryOptions, departmentOptions, selectedCategory, selectedDepartment, sortBy, sortOrder, stockFilter],
  )

  const filteredProducts = useMemo(() => {
	let filtered = [...products]

	if (selectedDepartment !== 'all') {
	  filtered = filtered.filter((product) => String(product.departmentId) === selectedDepartment)
	}

	if (selectedCategory !== 'all') {
	  filtered = filtered.filter((product) => String(product.categoryId) === selectedCategory)
	}

	if (search.trim()) {
	  const normalizedSearch = search.toLowerCase()
	  filtered = filtered.filter((product) => product.name.toLowerCase().includes(normalizedSearch))
	}

	if (stockFilter === 'in') {
	  filtered = filtered.filter((product) => Number(product.stock ?? 0) > 0)
	}

	if (stockFilter === 'out') {
	  filtered = filtered.filter((product) => Number(product.stock ?? 0) <= 0)
	}

	const multiplier = sortOrder === 'asc' ? 1 : -1

	return filtered.sort((left, right) => {
	  if (sortBy === 'alpha') {
		return multiplier * left.name.localeCompare(right.name)
	  }

	  if (sortBy === 'price') {
		return multiplier * (Number(left.price ?? 0) - Number(right.price ?? 0))
	  }

	  if (sortBy === 'stock') {
		return multiplier * (Number(left.stock ?? 0) - Number(right.stock ?? 0))
	  }

	  return 0
	})
  }, [products, search, selectedCategory, selectedDepartment, sortBy, sortOrder, stockFilter])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const pagedProducts = filteredProducts.slice((safePage - 1) * pageSize, safePage * pageSize)

  return (
	<>
	  <Navbar />
	  <main
		style={{
		  minHeight: '100vh',
		  background: 'var(--app-bg)',
		  padding: 0,
		}}
	  >
		<div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' }}>
		  <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Shop All Products</h2>

		  <div
			style={{
			  display: 'flex',
			  flexDirection: 'column',
			  alignItems: 'center',
			  justifyContent: 'center',
			  gap: 16,
			  marginBottom: 24,
			  width: '100%',
			  maxWidth: 900,
			  marginLeft: 'auto',
			  marginRight: 'auto',
			}}
		  >
			<AdvancedSearchPanel
			  title="Advanced Search"
			  query={search}
			  onQueryChange={setSearch}
			  isOpen={filtersOpen}
			  onToggleOpen={() => setFiltersOpen((currentValue) => !currentValue)}
			  onSearch={() => setFiltersOpen(false)}
			  sections={filterSections}
			/>
		  </div>

		  {loading ? (
			<div style={{ color: 'var(--muted-2)', fontWeight: 800, textAlign: 'center', padding: '3rem 1rem' }}>
			  Loading products...
			</div>
		  ) : error ? (
			<div style={{ color: '#ef4444', fontWeight: 800, textAlign: 'center', padding: '2rem 1rem' }}>
			  {error}
			</div>
		  ) : (
			<>
			  {filteredProducts.length > 0 && (
				<div className="product-page__results-bar">
				  <div className="product-page__results-copy">
					Showing {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, filteredProducts.length)} of {filteredProducts.length}
				  </div>

				  <div className="product-page__pagination">
					<button
					  type="button"
					  disabled={safePage <= 1}
					  onClick={() => setPage(Math.max(1, safePage - 1))}
					  style={{
						background: 'var(--surface-3)',
						color: 'var(--text)',
						border: '1px solid var(--border)',
						borderRadius: 12,
						padding: '10px 12px',
						fontWeight: 900,
						cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
						opacity: safePage <= 1 ? 0.6 : 1,
					  }}
					>
					  Prev
					</button>

					<div className="product-page__page-indicator">
					  Page {safePage} / {totalPages}
					</div>

					<button
					  type="button"
					  disabled={safePage >= totalPages}
					  onClick={() => setPage(Math.min(totalPages, safePage + 1))}
					  style={{
						background: 'var(--surface-3)',
						color: 'var(--text)',
						border: '1px solid var(--border)',
						borderRadius: 12,
						padding: '10px 12px',
						fontWeight: 900,
						cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
						opacity: safePage >= totalPages ? 0.6 : 1,
					  }}
					>
					  Next
					</button>
				  </div>
				</div>
			  )}

			  <div className="product-page__grid">
				{filteredProducts.length === 0 ? (
				  <div className="product-page__empty">
					No products found.
				  </div>
				) : (
				  pagedProducts.map((product) => <ProductCard key={product.id} product={product} />)
				)}
			  </div>
			</>
		  )}
		</div>
	  </main>
	  <Footer />
	</>
  )
}

export default ProductPage

