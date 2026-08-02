import AdvancedSearchPanel, {
    type FilterSection,
} from "../common/AdvancedSearchPanel"
import AdminButton from "./AdminButton"
import "./AdminSearchPanel.css"

interface AdminSearchPanelProps {
    title: string
    query: string
    onQueryChange: (value: string) => void
    isOpen: boolean
    onToggleOpen: () => void
    onSearch: () => void
    onReset: () => void
    sections: FilterSection[]
}

function AdminSearchPanel(props: AdminSearchPanelProps) {
    return (
        <div className="rf-admin-search">
            <AdvancedSearchPanel
                {...props}
                ActionButtonComponent={AdminButton}
            />
        </div>
    )
}

export default AdminSearchPanel
