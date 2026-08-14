import React from "react";
import Table from "../Table";
import type { ReviewRecord } from "../../../types/store";
import { Link } from "react-router-dom";
import { buildBackendImageUrl } from "../../../api/products";
import "./MyReviewTable.css";

interface MyReviewTableProps {
    items: ReviewRecord[];
    editingId: number | null;
    editRating: number;
    editComment: string;
    saving: boolean;
    onStartEdit: (review: ReviewRecord) => void;
    onCancelEdit: () => void;
    onSaveEdit: (id: number) => void;
    onDeleteReview: (id: number) => void;
    onChangeRating: (rating: number) => void;
    onChangeComment: (comment: string) => void;
}

const Stars: React.FC<{
    value: number;
    readOnly?: boolean;
    onChange?: (v: number) => void;
}> = ({ value, readOnly = false, onChange }) => {
    return (
        <div className="myrev-stars">
            {Array.from({ length: 5 }).map((_, idx) => {
                const starValue = idx + 1;
                const filled = starValue <= value;

                return (
                    <button
                        key={starValue}
                        type="button"
                        disabled={readOnly}
                        className={`myrev-star ${filled ? "filled" : ""}`}
                        onClick={() => onChange && onChange(starValue)}
                    >
                        {filled ? "★" : "☆"}
                    </button>
                );
            })}
        </div>
    );
};

const MyReviewTable: React.FC<MyReviewTableProps> = ({
                                                         items,
                                                         editingId,
                                                         editRating,
                                                         editComment,
                                                         saving,
                                                         onStartEdit,
                                                         onCancelEdit,
                                                         onSaveEdit,
                                                         onDeleteReview,
                                                         onChangeRating,
                                                         onChangeComment,
                                                     }) => {
    return (
        <Table
            items={items}
            renderItem={(r) => {
                const isEditing = editingId === r.id;
                const createdAt = new Date(r.created_at).toLocaleString();

                return (
                    <div className="myrev-card">
                        {/* Top Section */}
                        <div className="myrev-top">
                            <Link to={`/products/${r.productId}`} className="myrev-img-link">
                                <img
                                    src={buildBackendImageUrl(r.productImagePath)}
                                    alt={r.productName}
                                    className="myrev-img"
                                    onError={(e) => {
                                        const img = e.target as HTMLImageElement;
                                        img.onerror = null; // prevent loop if fallback also fails
                                        img.src = buildBackendImageUrl(null);
                                    }}
                                />
                            </Link>

                            <div className="myrev-info">
                                <Link
                                    to={`/products/${r.productId}`}
                                    className="myrev-product-name"
                                >
                                    {r.productName}
                                </Link>

                                <div className="myrev-rating-row">
                                    <Stars
                                        value={isEditing ? editRating : r.rating}
                                        readOnly={!isEditing}
                                        onChange={isEditing ? onChangeRating : undefined}
                                    />
                                    <div className="myrev-date">{createdAt}</div>
                                </div>
                            </div>
                        </div>

                        {/* Comment Section */}
                        <div className="myrev-comment">
                            {isEditing ? (
                                <textarea
                                    className="myrev-edit-textarea"
                                    value={editComment}
                                    onChange={(e) => onChangeComment(e.target.value)}
                                />
                            ) : (
                                <div className="myrev-comment-box">{r.comment}</div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="myrev-actions">
                            {isEditing ? (
                                <>
                                    <button
                                        type="button"
                                        className="myrev-btn cancel"
                                        disabled={saving}
                                        onClick={onCancelEdit}
                                    >
                                        ✕ Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="myrev-btn save"
                                        disabled={saving}
                                        onClick={() => onSaveEdit(r.id)}
                                    >
                                        {saving ? "Saving…" : "✓ Save"}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        className="myrev-btn edit"
                                        onClick={() => onStartEdit(r)}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        type="button"
                                        className="myrev-btn delete"
                                        onClick={() => onDeleteReview(r.id)}
                                    >
                                        🗑️ Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                );
            }}
        />
    );
};

export default MyReviewTable;
