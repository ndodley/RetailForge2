import "./Table.css"
import React from "react";

interface TableProps<T> {
    items: T[]
    renderItem: (item: T) => React.ReactNode
}

function Table<T>({ items, renderItem }: TableProps<T>) {
    return (
        <div className="rf-table-grid">
            {items.map((item, index) => (
                <div key={index} className="rf-table-card">
                    {renderItem(item)}
                </div>
            ))}
        </div>
    )
}

export default Table
