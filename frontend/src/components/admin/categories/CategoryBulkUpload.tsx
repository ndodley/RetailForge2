import { downloadCategoriesTemplate } from "../../../util/categoryCsv"

interface DraftState {
    name: string
    description: string
    departmentId: string
    uploadFile: File | null
    uploadFileName: string
    isUploading: boolean
}

interface CategoryBulkUploadProps {
    draft: DraftState
    setDraft: (next: DraftState) => void
    onConfirmUpload: () => void
}

function CategoryBulkUpload({
                                draft,
                                setDraft,
                                onConfirmUpload,
                            }: CategoryBulkUploadProps) {
    return (
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
                            setDraft({
                                ...draft,
                                uploadFile: nextFile,
                                uploadFileName: nextFile?.name ?? "",
                            })
                        }}
                    />
                </label>

                <button
                    type="button"
                    className="admin-btn admin-btn--sm"
                    onClick={downloadCategoriesTemplate}
                >
                    Download Template
                </button>
                <button
                    type="button"
                    className="admin-btn admin-btn--sm"
                    onClick={() =>
                        setDraft({
                            ...draft,
                            uploadFile: null,
                            uploadFileName: "",
                        })
                    }
                >
                    Clear
                </button>
                <button
                    type="button"
                    className="admin-btn admin-btn--primary admin-btn--sm"
                    onClick={() => void onConfirmUpload()}
                    disabled={draft.isUploading || !draft.uploadFile}
                >
                    {draft.isUploading ? "Uploading…" : "Confirm Upload"}
                </button>
            </div>

            <div className="rf-bulk-hint">
                {draft.uploadFileName
                    ? `Selected file: ${draft.uploadFileName}`
                    : "Expected format: categories.csv"}
            </div>
        </div>
    )
}

export default CategoryBulkUpload
