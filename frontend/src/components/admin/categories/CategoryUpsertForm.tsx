import type { DepartmentDto } from "../../../api/departments"
import type { CategoryRecord } from "../../../hooks/useCategories"
import CategoryBulkUpload from "./CategoryBulkUpload"

interface DraftState {
    name: string
    description: string
    departmentId: string
    uploadFile: File | null
    uploadFileName: string
    isUploading: boolean
}

interface CategoryUpsertFormProps {
    draft: DraftState
    setDraft: (next: DraftState) => void
    departments: DepartmentDto[]
    selectedCategory: CategoryRecord | null
    onSave: () => void
    onBack: () => void
    onBulkUpload: () => void
}

function CategoryUpsertForm({
                                draft,
                                setDraft,
                                departments,
                                selectedCategory,
                                onSave,
                                onBack,
                                onBulkUpload,
                            }: CategoryUpsertFormProps) {
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        void onSave()
    }

    return (
        <div className="rf-admin-section rf-admin-section--upsert">
            <form onSubmit={handleSubmit}>
                <div className="admin-field-grid">
                    <div className="admin-field">
                        <div className="admin-label">Name</div>
                        <input
                            className="admin-input"
                            type="text"
                            name="name"
                            value={draft.name}
                            onChange={(event) =>
                                setDraft({ ...draft, name: event.target.value })
                            }
                            required
                        />
                    </div>

                    <div className="admin-field">
                        <div className="admin-label">Department</div>
                        <select
                            className="admin-select"
                            name="departmentId"
                            value={draft.departmentId}
                            onChange={(event) =>
                                setDraft({ ...draft, departmentId: event.target.value })
                            }
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

                    <div className="admin-field" style={{ gridColumn: "1 / -1" }}>
                        <div className="admin-label">Description</div>
                        <textarea
                            className="admin-textarea"
                            name="description"
                            value={draft.description}
                            onChange={(event) =>
                                setDraft({ ...draft, description: event.target.value })
                            }
                            required
                        />
                    </div>
                </div>

                <div className="admin-actions rf-upsert-actions">
                    <button className="admin-btn admin-btn--primary" type="submit">
                        {selectedCategory ? "Update Category" : "Add Category"}
                    </button>
                    <button className="admin-btn" type="button" onClick={onBack}>
                        Go Back
                    </button>
                </div>
            </form>

            {!selectedCategory && (
                <CategoryBulkUpload
                    draft={draft}
                    setDraft={setDraft}
                    onConfirmUpload={onBulkUpload}
                />
            )}
        </div>
    )
}

export default CategoryUpsertForm
