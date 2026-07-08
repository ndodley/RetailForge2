import AdminButton from "../AdminButton"
import "./BulkUpload.css"

export interface BulkPreviewColumn {
    key: string
    header: string
}

interface BulkUploadProps {
    title: string
    subtitle?: string
    file: File | null
    onFileChange: (file: File | null) => void
    onDownloadTemplate: () => void
    onClear: () => void
    onConfirm: () => void
    expectedFileName: string
    previewColumns?: BulkPreviewColumn[]
    previewRows?: Array<Record<string, string | number>>
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
                        previewColumns,
                        previewRows,
                    }: BulkUploadProps) {
    return (
        <div className="rf-bulk">
            <div className="rf-bulk-header">
                <h3 className="rf-bulk-title">{title}</h3>
                {subtitle && <p className="rf-bulk-subtitle">{subtitle}</p>}
            </div>

            <div className="rf-bulk-body">
                {/* File picker + action buttons on same row */}
                <div className="rf-bulk-controls">
                    <div className="rf-bulk-left">
                        <label className="rf-bulk-fileLabel">
                            <input
                                type="file"
                                accept=".csv"
                                className="rf-bulk-fileInput"
                                onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
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
                        <AdminButton variant="primary" onClick={onConfirm} disabled={!file}>
                            Confirm Upload
                        </AdminButton>
                    </div>
                </div>

                {/* File info lines */}
                <div className="rf-bulk-info">
                    {file && (
                        <div className="rf-bulk-info-line">
                            Selected: <strong>{file.name}</strong>
                        </div>
                    )}
                    <div className="rf-bulk-info-line">
                        Expected format: <strong>{expectedFileName}</strong>
                    </div>
                </div>

                {/* CSV preview table */}
                {previewColumns && previewRows && previewRows.length > 0 && (
                    <div className="rf-bulk-preview">
                        <div className="rf-bulk-preview-heading">
                            PREVIEW ({previewRows.length} ROWS)
                        </div>
                        <div className="rf-bulk-preview-scroll">
                            <table className="rf-bulk-preview-table">
                                <thead>
                                <tr>
                                    {previewColumns.map((col) => (
                                        <th key={col.key}>{col.header}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {previewRows.map((row, i) => (
                                    <tr key={i}>
                                        {previewColumns.map((col) => (
                                            <td key={col.key}>
                                                {String(row[col.key] ?? "")}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default BulkUpload