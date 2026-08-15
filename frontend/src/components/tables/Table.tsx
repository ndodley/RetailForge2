import "./Table.css"
import React from "react";

interface TableProps<T> {
    items: T[]
    renderItem: (item: T) => React.ReactNode
    onItemClick?: (item: T) => void
}

function Table<T>({ items, renderItem, onItemClick }: TableProps<T>) {
    return (
        <div className="rf-table-grid">
            {items.map((item, index) => (
                <div
                    key={index}
                    className={`rf-table-card${onItemClick ? " rf-table-card--clickable" : ""}`}
                    onClick={onItemClick ? () => onItemClick(item) : undefined}
                    role={onItemClick ? "button" : undefined}
                    tabIndex={onItemClick ? 0 : undefined}
                    onKeyDown={
                        onItemClick
                            ? (e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault()
                                      onItemClick(item)
                                  }
                              }
                            : undefined
                    }
                >
                    {renderItem(item)}
                </div>
            ))}
        </div>
    )
}

export default Table
