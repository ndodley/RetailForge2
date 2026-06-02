import { useEffect, useMemo, useState } from 'react'
import {
  bulkCreateDepartments,
  createDepartment,
  deleteDepartment as deleteDepartmentRequest,
  fetchDepartments,
  getApiErrorMessage,
  updateDepartment as updateDepartmentRequest,
  type DepartmentDto,
} from '../../../api/departments'
import AdminLayout from '../../../components/admin/AdminLayout'
import AdvancedSearchPanel from '../../../components/common/AdvancedSearchPanel'
import DepartmentTable from '../../../components/tables/DepartmentTable'
import type { DepartmentRecord, DepartmentStatus } from '../../../types/store'

type DepartmentTab = 'dashboard' | 'upsert'
type SortField = 'best' | 'alpha'
type SortDirection = 'asc' | 'desc'

const defaultStatus: DepartmentStatus = 'active'
const pageSize = 6
const defaultDescription = 'Departments are used to group categories and products.'
const defaultManager = 'Unassigned'
const defaultFeaturedProduct = 'No featured product yet'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function toDepartmentRecord(department: DepartmentDto): DepartmentRecord {
  return {
    id: department.id,
    name: department.name,
    slug: slugify(department.name),
    description: defaultDescription,
    categoryCount: 0,
    productCount: 0,
    featuredProduct: defaultFeaturedProduct,
    manager: defaultManager,
    updatedAt: new Date().toISOString().slice(0, 10),
    status: defaultStatus,
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

async function parseDepartmentCsv(file: File) {
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

  if (nameIndex === -1) {
    throw new Error('CSV must include a name column.')
  }

  return lines
    .slice(1)
    .map((line) => parseCsvLine(line))
    .map((columns) => ({ name: columns[nameIndex]?.trim() ?? '' }))
    .filter((row) => row.name.length > 0)
}

function DepartmentsPage() {
  const [activeTab, setActiveTab] = useState<DepartmentTab>('dashboard')
  const [departments, setDepartments] = useState<DepartmentRecord[]>([])
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
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

  const selectedDepartment = useMemo(
    () => departments.find((department) => department.id === selectedDepartmentId) ?? null,
    [departments, selectedDepartmentId],
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
    [sortDirection, sortField],
  )

  const visibleDepartments = useMemo(() => {
    let next = Array.isArray(departments) ? departments : []
    const normalizedQuery = searchTerm.trim().toLowerCase()

    if (normalizedQuery) {
      next = next.filter((department) => department.name.toLowerCase().includes(normalizedQuery))
    }

    const direction = sortDirection === 'asc' ? 1 : -1

    if (sortField === 'alpha') {
      next = [...next].sort((left, right) => left.name.localeCompare(right.name) * direction)
    } else if (sortDirection === 'desc') {
      next = [...next].reverse()
    }

    return next
  }, [departments, searchTerm, sortDirection, sortField])

  const totalPages = Math.max(1, Math.ceil(visibleDepartments.length / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const pagedDepartments = visibleDepartments.slice((safePage - 1) * pageSize, safePage * pageSize)

  useEffect(() => {
    async function loadDepartments() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const response = await fetchDepartments()
        setDepartments(response.map(toDepartmentRecord))
      } catch (error) {
        setDepartments([])
        setErrorMessage(getApiErrorMessage(error, 'Unable to load departments from the backend.'))
      } finally {
        setIsLoading(false)
      }
    }

    void loadDepartments()
  }, [])

  function clearMessages() {
    setErrorMessage('')
    setSuccessMessage('')
  }

  function resetUpsertState() {
    setSelectedDepartmentId(null)
    setDraftName('')
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

  function handleEditDepartment(departmentId: number) {
    clearMessages()
    const departmentToEdit = departments.find((department) => department.id === departmentId)
    setSelectedDepartmentId(departmentId)
    setDraftName(departmentToEdit?.name ?? '')
    setActiveTab('upsert')
  }

  async function reloadDepartments() {
    const response = await fetchDepartments()
    setDepartments(response.map(toDepartmentRecord))
  }

  async function handleDeleteDepartment(departmentId: number) {
    clearMessages()

    try {
      await deleteDepartmentRequest(departmentId)
      setDepartments((currentDepartments) =>
        currentDepartments.filter((department) => department.id !== departmentId),
      )

      if (selectedDepartmentId === departmentId) {
        setSelectedDepartmentId(null)
      }

      setSuccessMessage('Department deleted successfully.')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to delete the department.'))
    }
  }

  async function handleSaveChanges() {
    const trimmedName = draftName.trim()

    if (!trimmedName) {
      setErrorMessage('Department name is required.')
      return
    }

    clearMessages()
    setIsSaving(true)

    try {
      if (selectedDepartmentId === null) {
        const createdDepartment = toDepartmentRecord(await createDepartment({ name: trimmedName }))
        setDepartments((currentDepartments) => [createdDepartment, ...currentDepartments])
        setSelectedDepartmentId(createdDepartment.id)
        setSuccessMessage('Department created successfully.')
      } else {
        const updatedDepartment = toDepartmentRecord(
          await updateDepartmentRequest(selectedDepartmentId, { name: trimmedName }),
        )

        setDepartments((currentDepartments) =>
          currentDepartments.map((department) =>
            department.id === selectedDepartmentId ? updatedDepartment : department,
          ),
        )

        setSuccessMessage('Department updated successfully.')
      }

      resetUpsertState()
      setActiveTab('dashboard')
      setPage(1)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to save the department.'))
    } finally {
      setIsSaving(false)
    }
  }

  function handleExportCsv() {
    const headers = ['name']
    const rows = visibleDepartments.map((department) => [department.name])

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'departments.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  function handleDownloadTemplate() {
    const csv = 'name\n'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'departments-template.csv'
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
      const rows = await parseDepartmentCsv(uploadFile)

      if (rows.length === 0) {
        throw new Error('No department rows were found in the CSV file.')
      }

      const result = await bulkCreateDepartments(rows)
      await reloadDepartments()
      setUploadFile(null)
      setUploadFileName('')
      setActiveTab('dashboard')
      setPage(1)
      setSuccessMessage(`Uploaded ${result.inserted} department${result.inserted === 1 ? '' : 's'} successfully.`)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to complete the bulk upload.'))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <AdminLayout
      title={activeTab === 'dashboard' ? 'Manage Departments' : selectedDepartment ? 'Edit Department' : 'Add New Department'}
      subtitle={
        activeTab === 'dashboard'
          ? undefined
          : 'Departments are used to group categories and products.'
      }
      actions={
        activeTab === 'dashboard' ? (
          <button type="button" className="admin-btn admin-btn--primary" onClick={openCreateTab}>
            Add New Department
          </button>
        ) : null
      }
    >
      <div className="rf-tabbar" role="tablist" aria-label="Department tabs">
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
          Upsert Department
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
            <div className="rf-loading-state">Loading departments...</div>
          ) : visibleDepartments.length > 0 ? (
            <>
              <div className="admin-pagination">
                <div className="admin-pagination-meta">
                  Showing {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, visibleDepartments.length)} of {visibleDepartments.length}
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

              <DepartmentTable
                departments={pagedDepartments}
                onEdit={handleEditDepartment}
                onDelete={(departmentId) => void handleDeleteDepartment(departmentId)}
              />
            </>
          ) : (
            <div className="rf-empty-state">No departments found.</div>
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
                <div className="admin-label">Department Name</div>
                <input
                  className="admin-input"
                  type="text"
                  name="name"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  placeholder="e.g., Electronics"
                  required
                />
              </div>
            </div>

            <div className="admin-actions rf-upsert-actions">
              <button className="admin-btn admin-btn--primary" type="submit" disabled={isSaving}>
                {isSaving ? 'Saving…' : selectedDepartment ? 'Update Department' : 'Add Department'}
              </button>
              <button className="admin-btn" type="button" onClick={openDashboardTab}>
                Go Back
              </button>
            </div>
          </form>

          {!selectedDepartment ? (
            <div className="rf-bulk-card">
              <div className="rf-bulk-title">Bulk Upload</div>
              <div className="rf-bulk-subtitle">
                Upload a departments CSV to create multiple departments at once.
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
                {uploadFileName ? `Selected file: ${uploadFileName}` : 'Expected format: departments.csv'}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </AdminLayout>
  )
}

export default DepartmentsPage
