import { useEffect, useMemo, useState } from 'react'
import categoryAdminApi from '../../../api/categoryAdmin.ts'
import { fetchDepartments, getApiErrorMessage, type DepartmentDto } from '../../../api/departments.ts'
import AdminLayout from '../../../components/admin/AdminLayout.tsx'
import AdvancedSearchPanel from '../../../components/common/AdvancedSearchPanel.tsx'
import CategoryTable from '../../../components/tables/CategoryTable.tsx'

type CategoryTab = 'dashboard' | 'upsert'
type SortField = 'best' | 'alpha' | 'dept'
type SortDirection = 'asc' | 'desc'
type DepartmentFilter = 'all' | 'unassigned' | `${number}`

const pageSize = 6

interface CategoryRecord {
  id: number
  name: string
  description: string
  departmentId: number | null
  departmentName: string | null
}

function toCategoryRecord(category: {
  id: number
  name: string
  description: string
  departmentId: number | null
  departmentName: string | null
}): CategoryRecord {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    departmentId: category.departmentId,
    departmentName: category.departmentName,
  }
}

function parseCsvLine(line: string) {
  const values: string[] = []
  let currentValue = ''
  let insideQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    const nextCharacter = line[index + 1]

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
      values.push(currentValue)
      currentValue = ''
      continue
    }

    currentValue += character
  }

  values.push(currentValue)
  return values.map((value) => value.trim())
}

async function parseCategoryCsv(file: File) {
  const text = await file.text()
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length === 0) {
    return []
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase())
  const nameIndex = headers.indexOf('name')
  const descriptionIndex = headers.indexOf('description')
  const departmentNameIndex = headers.indexOf('department_name')
  const departmentIdIndex = headers.indexOf('department_id')

  if (nameIndex === -1 || descriptionIndex === -1 || (departmentNameIndex === -1 && departmentIdIndex === -1)) {
    throw new Error('CSV must include name, description, and department_name.')
  }

  return lines
    .slice(1)
    .map((line) => parseCsvLine(line))
    .map((columns) => {
      const departmentIdText = departmentIdIndex === -1 ? '' : columns[departmentIdIndex]?.trim() ?? ''
      const parsedDepartmentId = departmentIdText ? Number.parseInt(departmentIdText, 10) : undefined

      return {
        name: columns[nameIndex]?.trim() ?? '',
        description: columns[descriptionIndex]?.trim() ?? '',
        departmentName: departmentNameIndex === -1 ? undefined : columns[departmentNameIndex]?.trim() ?? '',
        departmentId: Number.isFinite(parsedDepartmentId) ? parsedDepartmentId : undefined,
      }
    })
    .filter((row) => row.name.length > 0 || row.description.length > 0 || (row.departmentName ?? '').length > 0)
}

function CategoriesPage() {
  const [activeTab, setActiveTab] = useState<CategoryTab>('dashboard')
  const [categories, setCategories] = useState<CategoryRecord[]>([])
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentFilter>('all')
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
  const [draftName, setDraftName] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const [draftDepartmentId, setDraftDepartmentId] = useState('')

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  )

  const departmentOptions = useMemo(() => {
    const sortedDepartments = [...departments].sort((left, right) => left.name.localeCompare(right.name))

    return [
      { value: 'all', label: 'Any' },
      { value: 'unassigned', label: 'Unassigned' },
      ...sortedDepartments.map((department) => ({
        value: String(department.id),
        label: department.name,
      })),
    ]
  }, [departments])

  const filterSections = useMemo(
    () => [
      {
        key: 'department',
        title: 'Department',
        type: 'radio' as const,
        value: selectedDepartment,
        onChange: (value: string | string[]) => setSelectedDepartment(String(value) as DepartmentFilter),
        options: departmentOptions,
      },
      {
        key: 'sort',
        title: 'Sort',
        type: 'radio' as const,
        value: sortField,
        onChange: (value: string | string[]) => setSortField(String(value) as SortField),
        options: [
          { value: 'best', label: 'Best Match' },
          { value: 'alpha', label: 'Alphabet' },
          { value: 'dept', label: 'Department' },
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
    ],
    [departmentOptions, selectedDepartment, sortDirection, sortField],
  )

  const visibleCategories = useMemo(() => {
    let next = Array.isArray(categories) ? categories : []

    if (selectedDepartment !== 'all') {
      if (selectedDepartment === 'unassigned') {
        next = next.filter((category) => category.departmentId === null)
      } else {
        next = next.filter((category) => String(category.departmentId) === selectedDepartment)
      }
    }

    const normalizedQuery = searchTerm.trim().toLowerCase()
    if (normalizedQuery) {
      next = next.filter((category) => {
        const name = category.name.toLowerCase()
        const description = category.description.toLowerCase()
        const departmentName = (category.departmentName ?? '').toLowerCase()

        return name.includes(normalizedQuery)
          || description.includes(normalizedQuery)
          || departmentName.includes(normalizedQuery)
      })
    }

    const direction = sortDirection === 'asc' ? 1 : -1
    next = [...next].sort((left, right) => {
      if (sortField === 'alpha') {
        return left.name.localeCompare(right.name) * direction
      }

      if (sortField === 'dept') {
        return (left.departmentName ?? '').localeCompare(right.departmentName ?? '') * direction
      }

      return 0
    })

    return next
  }, [categories, searchTerm, selectedDepartment, sortDirection, sortField])

  const totalPages = Math.max(1, Math.ceil(visibleCategories.length / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const pagedCategories = visibleCategories.slice((safePage - 1) * pageSize, safePage * pageSize)

  useEffect(() => {
    async function loadPageData() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const [categoriesResponse, departmentsResponse] = await Promise.all([
          categoryAdminApi.fetchCategories(),
          fetchDepartments(),
        ])

        setCategories(categoriesResponse.map(toCategoryRecord))
        setDepartments(departmentsResponse)
      } catch (error) {
        setCategories([])
        setDepartments([])
        setErrorMessage(getApiErrorMessage(error, 'Unable to load categories from the backend.'))
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
    setSelectedCategoryId(null)
    setDraftName('')
    setDraftDescription('')
    setDraftDepartmentId('')
  }

  function openDashboardTab() {
    resetUpsertState()
    setActiveTab('dashboard')
  }

  function handleSearch() {
    setFiltersOpen(false)
    if (page !== 1) {
      setPage(1)
    }
  }

  function openCreateTab() {
    clearMessages()
    resetUpsertState()
    setActiveTab('upsert')
  }

  function handleEditCategory(categoryId: number) {
    clearMessages()
    const categoryToEdit = categories.find((category) => category.id === categoryId)
    setSelectedCategoryId(categoryId)
    setDraftName(categoryToEdit?.name ?? '')
    setDraftDescription(categoryToEdit?.description ?? '')
    setDraftDepartmentId(
      categoryToEdit?.departmentId === null || categoryToEdit?.departmentId === undefined
        ? ''
        : String(categoryToEdit.departmentId),
    )
    setActiveTab('upsert')
  }

  async function reloadCategories() {
    const response = await categoryAdminApi.fetchCategories()
    setCategories(response.map(toCategoryRecord))
  }

  async function handleDeleteCategory(categoryId: number) {
    clearMessages()

    try {
      await categoryAdminApi.deleteCategory(categoryId)
      setCategories((currentCategories) =>
        currentCategories.filter((category) => category.id !== categoryId),
      )

      if (selectedCategoryId === categoryId) {
        resetUpsertState()
      }

      setSuccessMessage('Category deleted successfully.')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to delete the category.'))
    }
  }

  async function handleSaveChanges() {
    const trimmedName = draftName.trim()
    const trimmedDescription = draftDescription.trim()
    const parsedDepartmentId = Number.parseInt(draftDepartmentId, 10)

    if (!trimmedName) {
      setErrorMessage('Category name is required.')
      return
    }

    if (!trimmedDescription) {
      setErrorMessage('Category description is required.')
      return
    }

    if (!Number.isFinite(parsedDepartmentId)) {
      setErrorMessage('Department is required.')
      return
    }

    clearMessages()
    setIsSaving(true)

    try {
      const payload = {
        name: trimmedName,
        description: trimmedDescription,
        departmentId: parsedDepartmentId,
      }

      if (selectedCategoryId === null) {
        const createdCategory = toCategoryRecord(await categoryAdminApi.createCategory(payload))
        setCategories((currentCategories) => [createdCategory, ...currentCategories])
        setSelectedCategoryId(createdCategory.id)
        setSuccessMessage('Category created successfully.')
      } else {
        const updatedCategory = toCategoryRecord(
          await categoryAdminApi.updateCategory(selectedCategoryId, payload),
        )

        setCategories((currentCategories) =>
          currentCategories.map((category) =>
            category.id === selectedCategoryId ? updatedCategory : category,
          ),
        )

        setSuccessMessage('Category updated successfully.')
      }

      resetUpsertState()
      setActiveTab('dashboard')
      setPage(1)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to save the category.'))
    } finally {
      setIsSaving(false)
    }
  }

  function handleExportCsv() {
    const headers = ['name', 'description', 'department_name']
    const rows = visibleCategories.map((category) => [
      category.name,
      category.description,
      category.departmentName ?? '',
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'categories.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  function handleDownloadTemplate() {
    const csv = 'name,description,department_name\n'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'categories-template.csv'
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
      const rows = await parseCategoryCsv(uploadFile)

      if (rows.length === 0) {
        setErrorMessage('No category rows were found in the CSV file.')
        return
      }

      const result = await categoryAdminApi.bulkCreateCategories(rows)
      await reloadCategories()
      setUploadFile(null)
      setUploadFileName('')
      setActiveTab('dashboard')
      setPage(1)
      setSuccessMessage(`Uploaded ${result.inserted} categor${result.inserted === 1 ? 'y' : 'ies'} successfully.`)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to complete the bulk upload.'))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <AdminLayout
      title={activeTab === 'dashboard' ? 'Manage Categories' : selectedCategory ? 'Edit Category' : 'Add New Category'}
      subtitle={
        activeTab === 'dashboard'
          ? undefined
          : 'Categories belong to a department.'
      }
      actions={
        activeTab === 'dashboard' ? (
          <button type="button" className="admin-btn admin-btn--primary" onClick={openCreateTab}>
            Add New Category
          </button>
        ) : null
      }
    >
      <div className="rf-tabbar" role="tablist" aria-label="Category tabs">
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
          Upsert Category
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
            <div className="rf-loading-state">Loading categories...</div>
          ) : visibleCategories.length > 0 ? (
            <>
              <div className="admin-pagination">
                <div className="admin-pagination-meta">
                  Showing {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, visibleCategories.length)} of {visibleCategories.length}
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

              <CategoryTable
                categories={pagedCategories}
                onEdit={handleEditCategory}
                onDelete={(categoryId: number) => void handleDeleteCategory(categoryId)}
              />
            </>
          ) : (
            <div className="rf-empty-state">No categories found.</div>
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
                <div className="admin-label">Name</div>
                <input
                  className="admin-input"
                  type="text"
                  name="name"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  required
                />
              </div>

              <div className="admin-field">
                <div className="admin-label">Department</div>
                <select
                  className="admin-select"
                  name="departmentId"
                  value={draftDepartmentId}
                  onChange={(event) => setDraftDepartmentId(event.target.value)}
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

              <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
                <div className="admin-label">Description</div>
                <textarea
                  className="admin-textarea"
                  name="description"
                  value={draftDescription}
                  onChange={(event) => setDraftDescription(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="admin-actions rf-upsert-actions">
              <button className="admin-btn admin-btn--primary" type="submit" disabled={isSaving}>
                {isSaving ? 'Saving…' : selectedCategory ? 'Update Category' : 'Add Category'}
              </button>
              <button className="admin-btn" type="button" onClick={openDashboardTab}>
                Go Back
              </button>
            </div>
          </form>

          {!selectedCategory ? (
            <div className="rf-bulk-card">
              <div className="rf-bulk-title">Bulk Upload</div>
              <div className="rf-bulk-subtitle">
                Upload a categories CSV. department_name is required for each row.
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
                {uploadFileName ? `Selected file: ${uploadFileName}` : 'Expected format: categories.csv'}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </AdminLayout>
  )
}

export default CategoriesPage

