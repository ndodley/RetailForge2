interface ProductSearchBarProps {
  search: string
  setSearch: (value: string) => void
  placeholder?: string
}

function ProductSearchBar({
  search,
  setSearch,
  placeholder = 'Search products...',
}: ProductSearchBarProps) {
  return (
	<div
	  className="product-filters"
	  style={{
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 0,
		marginBottom: '2rem',
		flexWrap: 'nowrap',
		width: '100%',
		maxWidth: 700,
		marginLeft: 'auto',
		marginRight: 'auto',
	  }}
	>
	  <input
		type="text"
		placeholder={placeholder}
		value={search}
		onChange={(event) => setSearch(event.target.value)}
		style={{
		  flex: '0 1 220px',
		  minWidth: 180,
		  maxWidth: 240,
		  height: 44,
		  padding: '0 1rem',
		  borderRadius: '8px 0 0 8px',
		  border: '1.5px solid #b3c6e0',
		  borderRight: 'none',
		  fontSize: 16,
		  background: '#fff',
		  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
		  outline: 'none',
		  transition: 'border 0.2s',
		}}
		onFocus={(event) => {
		  event.target.style.border = '2px solid #007bff'
		}}
		onBlur={(event) => {
		  event.target.style.border = '1.5px solid #b3c6e0'
		}}
	  />
	</div>
  )
}

export default ProductSearchBar

