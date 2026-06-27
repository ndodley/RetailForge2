import AdminButton from "../AdminButton"
import "./BulkUpload.css"

interface BulkUploadProps {
    title: string
    subtitle?: string
    file: File | null
    onFileChange: (file: File | null) => void
    onDownloadTemplate: () => void
    onClear: () => void
    onConfirm: () => void
    expectedFileName: string
}

function BulkUpload({
                        title,
                        subtitle,
                        file,
                        onFileChange,
                        onDownloadTemplate,
                        onClear,
                        onConfirm,
                        expectedFileName,
                    }: BulkUploadProps) {
    return (
        <div className="rf-bulk">
            <div className="rf-bulk-header">
                <h3 className="rf-bulk-title">{title}</h3>
                {subtitle && <p className="rf-bulk-subtitle">{subtitle}</p>}
            </div>

            <div className="rf-bulk-body">
                <div className="rf-bulk-fileRow">
                    <label className="rf-bulk-fileLabel">
                        <input
                            type="file"
                            accept=".csv"
                            className="rf-bulk-fileInput"
                            onChange={(e) =>
                                onFileChange(e.target.files?.[0] ?? null)
                            }
                        />
                        <span className="rf-bulk-fileBtn">Choose File</span>
                    </label>

                    <span className="rf-bulk-fileName">
            {file ? file.name : "No file chosen"}
          </span>
                </div>

                <div className="rf-bulk-actions">
                    <AdminButton variant="pill" onClick={onDownloadTemplate}>
                        Download Template
                    </AdminButton>

                    <AdminButton variant="surface" onClick={onClear}>
                        Clear
                    </AdminButton>

                    <AdminButton
                        variant="primary"
                        onClick={onConfirm}
                        disabled={!file}
                    >
                        Confirm Upload
                    </AdminButton>
                </div>

                <div className="rf-bulk-footer">
                    Expected format: <strong>{expectedFileName}</strong>
                </div>
            </div>
        </div>
    )
}

export default BulkUpload