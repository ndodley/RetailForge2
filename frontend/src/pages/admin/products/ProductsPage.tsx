import { useEffect, useMemo, useState } from 'react'
import { fetchCategories, type CategoryDto } from '../../../api/categories.ts'
import { fetchDepartments, getApiErrorMessage, type DepartmentDto } from '../../../api/departments.ts'
import {
  bulkCreateProducts,
  createProduct,
  deleteProduct,
  fetchProducts,
  type ProductAdminBulkRowDto,
  type ProductAdminDto,
  updateProduct,
} from '../../../api/productAdminApi.ts'
import AdminLayout from '../../../components/admin/AdminLayout.tsx'
import AdvancedSearchPanel from '../../../components/common/AdvancedSearchPanel.tsx'
import ProductTable from '../../../components/tables/ProductTable.tsx'

type ProductTab = 'dashboard' | 'upsert'
type SortField = 'best' | 'alpha' | 'price' | 'stock'
type SortDirection = 'asc' | 'desc'
type DepartmentFilter = 'all' | `${number}`
type CategoryFilter = 'all' | `${number}`

const pageSize = 6
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function parseCsvRecords(text: string) {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentValue = ''
  let insideQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    const nextCharacter = text[index + 1]

    if (character === '"') {
      if (insideQuotes && nextCharacter === '"') {
        currentValue += '"'
        index += 1
      } else {
        insideQuotes = !insideQuotes
      }
      continue
    }

    if (character === ',' && !insideQuotes) {
      currentRow.push(currentValue.trim())
      currentValue = ''
      continue
    }

    if ((character === '\n' || character === '\r') && !insideQuotes) {
      if (character === '\r' && nextCharacter === '\n') {
        index += 1
      }

      currentRow.push(currentValue.trim())
      currentValue = ''

      if (currentRow.some((value) => value.length > 0)) {
        rows.push(currentRow)
      }

      currentRow = []
      continue
    }

    currentValue += character
  }

  if (currentValue.length > 0 || currentRow.length > 0) {
    currentRow.push(currentValue.trim())
    if (currentRow.some((value) => value.length > 0)) {
      rows.push(currentRow)
    }
  }

  return rows
}

async function parseProductCsv(file: File) {
  const text = await file.text()
  const rows = parseCsvRecords(text)

  if (rows.length === 0) {
    return []
  }

  const headers = rows[0].map((header) => header.toLowerCase())
  const nameIndex = headers.indexOf('name')
  const brandIndex = headers.indexOf('brand')
  const ratingIndex = headers.indexOf('rating')
  const descriptionIndex = headers.indexOf('description')
  const priceIndex = headers.indexOf('price')
  const stockIndex = headers.indexOf('stock')
  const categoryNameIndex = headers.indexOf('category_name')
  const departmentNameIndex = headers.indexOf('department_name')
  const imagePathIndex = headers.indexOf('image_path')

  if (nameIndex === -1 || descriptionIndex === -1 || priceIndex === -1 || stockIndex === -1 || categoryNameIndex === -1) {
    throw new Error('CSV must include name, description, price, stock, and category_name columns.')
  }

  return rows
    .slice(1)
    .map((columns) => {
      const priceText = columns[priceIndex]?.trim() ?? ''
      const stockText = columns[stockIndex]?.trim() ?? ''
      const ratingText = ratingIndex === -1 ? '' : columns[ratingIndex]?.trim() ?? ''
      const parsedPrice = Number.parseFloat(priceText)
      const parsedStock = Number.parseInt(stockText, 10)
      const parsedRating = ratingText ? Number.parseFloat(ratingText) : 0

      if (!Number.isFinite(parsedPrice) || !Number.isFinite(parsedStock) || !Number.isFinite(parsedRating)) {
        throw new Error('CSV contains invalid numeric values for price, stock, or rating.')
      }

      return {
        name: columns[nameIndex]?.trim() ?? '',
        brand: brandIndex === -1 ? '' : columns[brandIndex]?.trim() ?? '',
        rating: parsedRating,
        description: columns[descriptionIndex]?.trim() ?? '',
        price: parsedPrice,
        stock: parsedStock,
        categoryName: columns[categoryNameIndex]?.trim() ?? '',
        departmentName: departmentNameIndex === -1 ? '' : columns[departmentNameIndex]?.trim() ?? '',
        imagePath: imagePathIndex === -1 ? '' : columns[imagePathIndex]?.trim() ?? '',
      } satisfies ProductAdminBulkRowDto
    })
    .filter((row) => row.name.length > 0 || row.description.length > 0 || row.categoryName.length > 0)
}

function toProductRecord(product: ProductAdminDto) {
  return {
    ...product,
    brand: product.brand ?? null,
    imagePath: product.imagePath ?? null,
    categoryId: product.categoryId ?? null,
    categoryName: product.categoryName ?? null,
    departmentId: product.departmentId ?? null,
    departmentName: product.departmentName ?? null,
    rating: Number(product.rating ?? 0),
    price: Number(product.price ?? 0),
    stock: Number(product.stock ?? 0),
  }
}

function buildProductCsvRow(values: string[]) {
  return values.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')
}

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState<ProductTab>('dashboard')
  const [products, setProducts] = useState<ReturnType<typeof toProductRecord>[]>([])
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentFilter>('all')
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all')
  const [sortField, setSortField] = useState<SortField>('best')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadFileName, setUploadFileName] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [draftDepartmentId, setDraftDepartmentId] = useState('')
  const [draftCategoryId, setDraftCategoryId] = useState('')
  const [draftName, setDraftName] = useState('')
  const [draftBrand, setDraftBrand] = useState('')
  const [draftRating, setDraftRating] = useState('0')
  const [draftDescription, setDraftDescription] = useState('')
  const [draftPrice, setDraftPrice] = useState('')
  const [draftStock, setDraftStock] = useState('')
  const [draftCurrentImagePath, setDraftCurrentImagePath] = useState('')

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) ?? null,
    [products, selectedProductId],
  )

  const categoryFilterOptions = useMemo(() => {
    if (selectedDepartment === 'all') {
      return [{ value: 'all', label: 'All Categories' }]
    }

    return [
      { value: 'all', label: 'All Categories' },
      ...categories
        .filter((category) => String(category.departmentId) === selectedDepartment)
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((category) => ({ value: String(category.id), label: category.name })),
    ]
  }, [categories, selectedDepartment])

  const formCategories = useMemo(
    () => categories.filter((category) => String(category.departmentId) === draftDepartmentId),
    [categories, draftDepartmentId],
  )

  const filterSections = useMemo(
    () => [
      {
        key: 'sort',
        title: 'Sort',
        type: 'radio' as const,
        value: sortField,
        onChange: (value: string | string[]) => setSortField(String(value) as SortField),
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
        value: sortDirection,
        onChange: (value: string | string[]) => setSortDirection(String(value) as SortDirection),
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
          setSelectedDepartment(String(value) as DepartmentFilter)
          setSelectedCategory('all')
        },
        options: [
          { value: 'all', label: 'All Departments' },
          ...[...departments]
            .sort((left, right) => left.name.localeCompare(right.name))
            .map((department) => ({ value: String(department.id), label: department.name })),
        ],
      },
      {
        key: 'category',
        title: 'Category',
        type: 'radio' as const,
        value: selectedCategory,
        onChange: (value: string | string[]) => setSelectedCategory(String(value) as CategoryFilter),
        options: categoryFilterOptions,
      },
    ],
    [categoryFilterOptions, departments, selectedCategory, selectedDepartment, sortDirection, sortField],
  )

  const visibleProducts = useMemo(() => {
    let next = Array.isArray(products) ? products : []

    if (selectedDepartment !== 'all') {
      next = next.filter((product) => String(product.departmentId) === selectedDepartment)
    }

    if (selectedCategory !== 'all') {
      next = next.filter((product) => String(product.categoryId) === selectedCategory)
    }

    const normalizedQuery = searchTerm.trim().toLowerCase()
    if (normalizedQuery) {
      next = next.filter((product) => {
        const name = product.name.toLowerCase()
        const brand = (product.brand ?? '').toLowerCase()
        const description = product.description.toLowerCase()
        const categoryName = (product.categoryName ?? '').toLowerCase()
        return name.includes(normalizedQuery)
          || brand.includes(normalizedQuery)
          || description.includes(normalizedQuery)
          || categoryName.includes(normalizedQuery)
      })
    }

    const direction = sortDirection === 'asc' ? 1 : -1
    next = [...next].sort((left, right) => {
      if (sortField === 'alpha') {
        return left.name.localeCompare(right.name) * direction
      }

      if (sortField === 'price') {
        return (left.price - right.price) * direction
      }

      if (sortField === 'stock') {
        return (left.stock - right.stock) * direction
      }

      return 0
    })

    return next
  }, [products, searchTerm, selectedCategory, selectedDepartment, sortDirection, sortField])

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const pagedProducts = visibleProducts.slice((safePage - 1) * pageSize, safePage * pageSize)

  useEffect(() => {
    async function loadPageData() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const [productsResponse, departmentsResponse, categoriesResponse] = await Promise.all([
          fetchProducts(),
          fetchDepartments(),
          fetchCategories(),
        ])

        setProducts(productsResponse.map(toProductRecord))
        setDepartments(departmentsResponse)
        setCategories(categoriesResponse)
      } catch (error) {
        setProducts([])
        setDepartments([])
        setCategories([])
        setErrorMessage(getApiErrorMessage(error, 'Unable to load products from the backend.'))
      } finally {
        setIsLoading(false)
      }
    }

    void loadPageData()
  }, [])

  function clearMessages() {
    setErrorMessage('')
    setSuccessMessage('')
  }

  function resetUpsertState() {
    setSelectedProductId(null)
    setDraftDepartmentId('')
    setDraftCategoryId('')
    setDraftName('')
    setDraftBrand('')
    setDraftRating('0')
    setDraftDescription('')
    setDraftPrice('')
    setDraftStock('')
    setDraftCurrentImagePath('')
    setImageFile(null)
  }

  function openDashboardTab() {
    resetUpsertState()
    setActiveTab('dashboard')
  }

  function openCreateTab() {
    clearMessages()
    resetUpsertState()
    setActiveTab('upsert')
  }

  function handleSearch() {
    setFiltersOpen(false)
    if (page !== 1) {
      setPage(1)
    }
  }

  function handleEditProduct(productId: number) {
    clearMessages()
    const productToEdit = products.find((product) => product.id === productId)

    setSelectedProductId(productId)
    setDraftDepartmentId(productToEdit?.departmentId ? String(productToEdit.departmentId) : '')
    setDraftCategoryId(productToEdit?.categoryId ? String(productToEdit.categoryId) : '')
    setDraftName(productToEdit?.name ?? '')
    setDraftBrand(productToEdit?.brand ?? '')
    setDraftRating(String(productToEdit?.rating ?? 0))
    setDraftDescription(productToEdit?.description ?? '')
    setDraftPrice(productToEdit ? String(productToEdit.price) : '')
    setDraftStock(productToEdit ? String(productToEdit.stock) : '')
    setDraftCurrentImagePath(productToEdit?.imagePath ?? '')
    setImageFile(null)
    setActiveTab('upsert')
  }

  async function reloadProducts() {
    const response = await fetchProducts()
    setProducts(response.map(toProductRecord))
  }

  async function handleDeleteProduct(productId: number) {
    clearMessages()

    try {
      await deleteProduct(productId)
      setProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId))

      if (selectedProductId === productId) {
        resetUpsertState()
      }

      setSuccessMessage('Product deleted successfully.')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to delete the product.'))
    }
  }

  function buildProductFormData() {
    const parsedRating = Number.parseFloat(draftRating)
    const parsedPrice = Number.parseFloat(draftPrice)
    const parsedStock = Number.parseInt(draftStock, 10)
    const parsedCategoryId = Number.parseInt(draftCategoryId, 10)

    if (!draftDepartmentId) {
      throw new Error('Department is required.')
    }

    if (!Number.isFinite(parsedCategoryId)) {
      throw new Error('Category is required.')
    }

    if (!draftName.trim()) {
      throw new Error('Product name is required.')
    }

    if (!draftDescription.trim()) {
      throw new Error('Description is required.')
    }

    if (!Number.isFinite(parsedRating) || parsedRating < 0 || parsedRating > 5) {
      throw new Error('Rating must be between 0 and 5.')
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      throw new Error('Price must be greater than 0.')
    }

    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      throw new Error('Stock must be 0 or greater.')
    }

    const formData = new FormData()
    formData.append('name', draftName.trim())
    formData.append('brand', draftBrand.trim())
    formData.append('rating', String(parsedRating))
    formData.append('description', draftDescription.trim())
    formData.append('price', String(parsedPrice))
    formData.append('stock', String(parsedStock))
    formData.append('categoryId', String(parsedCategoryId))

    if (imageFile) {
      formData.append('image', imageFile)
    }

    return formData
  }

  async function handleSaveChanges() {
    clearMessages()
    setIsSaving(true)

    try {
      const formData = buildProductFormData()

      if (selectedProductId === null) {
        const createdProduct = toProductRecord(await createProduct(formData))
        setProducts((currentProducts) => [createdProduct, ...currentProducts])
        setSuccessMessage('Product created successfully.')
      } else {
        const updatedProduct = toProductRecord(await updateProduct(selectedProductId, formData))
        setProducts((currentProducts) =>
          currentProducts.map((product) => (product.id === selectedProductId ? updatedProduct : product)),
        )
        setSuccessMessage('Product updated successfully.')
      }

      resetUpsertState()
      setActiveTab('dashboard')
      setPage(1)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to save the product.'))
    } finally {
      setIsSaving(false)
    }
  }

  function handleExportCsv() {
    const headers = ['name', 'brand', 'rating', 'description', 'price', 'stock', 'category_name', 'department_name', 'image_path']
    const rows = visibleProducts.map((product) => [
      product.name,
      product.brand ?? '',
      product.rating.toFixed(1),
      product.description,
      product.price.toFixed(2),
      String(product.stock),
      product.categoryName ?? '',
      product.departmentName ?? '',
      product.imagePath ?? '',
    ])

    const csv = [headers, ...rows].map(buildProductCsvRow).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'products.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  function handleDownloadTemplate() {
    const csv = 'name,brand,rating,description,price,stock,category_name,department_name,image_path\n'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'products-template.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  async function handleConfirmUpload() {
    if (!uploadFile) {
      setErrorMessage('Select a CSV file before confirming upload.')
      return
    }

    clearMessages()
    setIsUploading(true)

    try {
      const rows = await parseProductCsv(uploadFile)

      if (rows.length === 0) {
        setErrorMessage('No product rows were found in the CSV file.')
        return
      }

      const result = await bulkCreateProducts(rows)
      await reloadProducts()
      setUploadFile(null)
      setUploadFileName('')
      setActiveTab('dashboard')
      setPage(1)
      setSuccessMessage(`Uploaded ${result.inserted} product${result.inserted === 1 ? '' : 's'} successfully.`)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to complete the bulk upload.'))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <AdminLayout
      title={activeTab === 'dashboard' ? 'Manage Products' : selectedProduct ? 'Edit Product' : 'Add New Product'}
      subtitle={
        activeTab === 'dashboard'
          ? undefined
          : 'Products appear in the store catalog and can include an optional image.'
      }
      actions={
        activeTab === 'dashboard' ? (
          <button type="button" className="admin-btn admin-btn--primary" onClick={openCreateTab}>
            Add New Product
          </button>
        ) : null
      }
    >
      <div className="rf-tabbar" role="tablist" aria-label="Product tabs">
        <button
          type="button"
          className={activeTab === 'dashboard' ? 'rf-tab rf-tab--active' : 'rf-tab'}
          onClick={openDashboardTab}
        >
          Dashboard
        </button>
        <button
          type="button"
          className={activeTab === 'upsert' ? 'rf-tab rf-tab--active' : 'rf-tab'}
          onClick={openCreateTab}
        >
          Upsert Product
        </button>
      </div>

      {errorMessage ? <div className="admin-alert admin-alert--error">{errorMessage}</div> : null}
      {successMessage ? <div className="admin-alert admin-alert--success">{successMessage}</div> : null}

      {activeTab === 'dashboard' ? (
        <div className="rf-admin-section">
          <div className="rf-admin-searchWrap">
            <AdvancedSearchPanel
              title="Advanced Search"
              query={searchTerm}
              onQueryChange={setSearchTerm}
              isOpen={filtersOpen}
              onToggleOpen={() => setFiltersOpen((value) => !value)}
              onSearch={handleSearch}
              sections={filterSections}
            />
          </div>

          <div className="rf-admin-toolbar">
            <button type="button" className="admin-btn admin-btn--sm" onClick={handleExportCsv}>
              Download CSV
            </button>
          </div>

          {isLoading ? (
            <div className="rf-loading-state">Loading products...</div>
          ) : visibleProducts.length > 0 ? (
            <>
              <div className="admin-pagination">
                <div className="admin-pagination-meta">
                  Showing {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, visibleProducts.length)} of {visibleProducts.length}
                </div>
                <div className="admin-pagination-controls">
                  <button
                    type="button"
                    className="admin-btn admin-btn--sm"
                    disabled={safePage <= 1}
                    onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                  >
                    Prev
                  </button>
                  <div className="admin-pagination-meta">Page {safePage} / {totalPages}</div>
                  <button
                    type="button"
                    className="admin-btn admin-btn--sm"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                  >
                    Next
                  </button>
                </div>
              </div>

              <ProductTable
                products={pagedProducts}
                onEdit={handleEditProduct}
                onDelete={(productId: number) => void handleDeleteProduct(productId)}
              />
            </>
          ) : (
            <div className="rf-empty-state">No products found.</div>
          )}
        </div>
      ) : (
        <div className="rf-admin-section rf-admin-section--upsert">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void handleSaveChanges()
            }}
          >
            <div className="admin-field-grid">
              <div className="admin-field">
                <div className="admin-label">Department</div>
                <select
                  className="admin-select"
                  value={draftDepartmentId}
                  onChange={(event) => {
                    setDraftDepartmentId(event.target.value)
                    setDraftCategoryId('')
                  }}
                  required
                >
                  <option value="">Select a Department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-field">
                <div className="admin-label">Category</div>
                <select
                  className="admin-select"
                  value={draftCategoryId}
                  onChange={(event) => setDraftCategoryId(event.target.value)}
                  disabled={!draftDepartmentId}
                  required
                >
                  <option value="">Select a Category</option>
                  {formCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-field">
                <div className="admin-label">Name</div>
                <input
                  className="admin-input"
                  type="text"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  required
                />
              </div>

              <div className="admin-field">
                <div className="admin-label">Brand (optional)</div>
                <input
                  className="admin-input"
                  type="text"
                  value={draftBrand}
                  onChange={(event) => setDraftBrand(event.target.value)}
                />
              </div>

              <div className="admin-field">
                <div className="admin-label">Rating (0-5)</div>
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={draftRating}
                  onChange={(event) => setDraftRating(event.target.value)}
                  required
                />
              </div>

              <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
                <div className="admin-label">Description</div>
                <textarea
                  className="admin-textarea"
                  value={draftDescription}
                  onChange={(event) => setDraftDescription(event.target.value)}
                  required
                />
              </div>

              <div className="admin-field">
                <div className="admin-label">Price</div>
                <input
                  className="admin-input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={draftPrice}
                  onChange={(event) => setDraftPrice(event.target.value)}
                  required
                />
              </div>

              <div className="admin-field">
                <div className="admin-label">Stock</div>
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  step="1"
                  value={draftStock}
                  onChange={(event) => setDraftStock(event.target.value)}
                  required
                />
              </div>

              <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
                <div className="admin-label">Image (optional)</div>
                <input
                  className="admin-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                />
              </div>

              {draftCurrentImagePath ? (
                <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
                  <div className="admin-label">Current Image</div>
                  <div className="product-current-image">
                    <img
                      src={`${apiBaseUrl}${draftCurrentImagePath}`}
                      alt="Current product"
                      className="product-current-image__preview"
                       onError={(event) => {
                         event.currentTarget.style.display = 'none'
                       }}
                    />
                    <input className="admin-input" type="text" value={draftCurrentImagePath} readOnly />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="admin-actions rf-upsert-actions">
              <button className="admin-btn admin-btn--primary" type="submit" disabled={isSaving}>
                {isSaving ? 'Saving…' : selectedProduct ? 'Update Product' : 'Add Product'}
              </button>
              <button className="admin-btn" type="button" onClick={openDashboardTab}>
                Go Back
              </button>
            </div>
          </form>

          {!selectedProduct ? (
            <div className="rf-bulk-card">
              <div className="rf-bulk-title">Bulk Upload</div>
              <div className="rf-bulk-subtitle">
                Upload a products CSV to create multiple products. The image_path column is optional and should point to a served image path.
              </div>

              <div className="rf-bulk-controls">
                <label className="rf-file-input-wrap">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(event) => {
                      const nextFile = event.target.files?.[0] ?? null
                      setUploadFile(nextFile)
                      setUploadFileName(nextFile?.name ?? '')
                    }}
                  />
                </label>

                <button type="button" className="admin-btn admin-btn--sm" onClick={handleDownloadTemplate}>
                  Download Template
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--sm"
                  onClick={() => {
                    setUploadFile(null)
                    setUploadFileName('')
                  }}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--primary admin-btn--sm"
                  onClick={() => void handleConfirmUpload()}
                  disabled={isUploading || !uploadFile}
                >
                  {isUploading ? 'Uploading…' : 'Confirm Upload'}
                </button>
              </div>

              <div className="rf-bulk-hint">
                {uploadFileName ? `Selected file: ${uploadFileName}` : 'Expected format: products.csv'}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </AdminLayout>
  )
}



