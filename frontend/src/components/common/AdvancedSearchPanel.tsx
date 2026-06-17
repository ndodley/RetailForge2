import { useId, useMemo } from "react"
import "./AdvancedSearchPanel.css"

interface SearchOption {
  value: string
  label: string
}

interface SearchSection {
  key: string
  title: string
  type: "radio" | "checkbox"
  value?: string
  values?: string[]
  onChange?: (value: string | string[]) => void
  options: SearchOption[]
}

export type { SearchSection }

interface AdvancedSearchPanelProps {
  title?: string
  query: string
  onQueryChange: (value: string) => void
  onSearch?: () => void
  isOpen: boolean
  onToggleOpen: () => void
  sections?: SearchSection[]
}

function AdvancedSearchPanel({
                               title = "Advanced Search",
                               query,
                               onQueryChange,
                               onSearch,
                               isOpen,
                               onToggleOpen,
                               sections = [],
                             }: AdvancedSearchPanelProps) {
  const instanceId = useId()
  const safeSections = useMemo(() => (Array.isArray(sections) ? sections : []), [sections])

  return (
      <section className="adv-search" aria-label={title}>
        <div className="adv-search-header">
          <div className="adv-search-title">{title}</div>
        </div>

        <div className="adv-search-topbar">
          <div className="adv-search-inputWrap">
            <input
                className="adv-search-input"
                type="text"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search..."
                aria-label="Search"
            />
          </div>

          <div className="adv-search-actions">
            <button
                type="button"
                className="adv-search-btn adv-search-btn--ghost"
                onClick={onToggleOpen}
                aria-expanded={isOpen}
                aria-controls={`adv-search-filters-${instanceId}`}
            >
              Filter
            </button>
            <button
                type="button"
                className="adv-search-btn adv-search-btn--primary"
                onClick={onSearch}
            >
              Search
            </button>
          </div>
        </div>

        {isOpen && (
            <div className="adv-search-grid" id={`adv-search-filters-${instanceId}`}>
              {safeSections.map((section) => {
                const sectionId = `${instanceId}-${section.key}`
                const options = Array.isArray(section.options) ? section.options : []

                return (
                    <details className="adv-search-card" key={section.key} open>
                      <summary className="adv-search-cardSummary">
                        <span className="adv-search-cardTitle">{section.title}</span>
                        <span className="adv-search-caret" aria-hidden="true" />
                      </summary>

                      <div className="adv-search-cardBody" role="group" aria-labelledby={sectionId}>
                        <div id={sectionId} className="adv-search-srOnly">
                          {section.title}
                        </div>

                        <div className="adv-search-options">
                          {options.map((option) => {
                            const inputId = `${sectionId}-${String(option.value)}`
                            const isRadio = section.type === "radio"
                            const checked = isRadio
                                ? String(section.value) === String(option.value)
                                : Array.isArray(section.values) &&
                                section.values.map(String).includes(String(option.value))

                            return (
                                <label className="adv-search-option" key={option.value} htmlFor={inputId}>
                                  <input
                                      id={inputId}
                                      className="adv-search-control"
                                      type={isRadio ? "radio" : "checkbox"}
                                      name={isRadio ? sectionId : undefined}
                                      checked={checked}
                                      onChange={() => {
                                        if (isRadio) {
                                          section.onChange?.(option.value)
                                          return
                                        }

                                        const current = Array.isArray(section.values) ? section.values : []
                                        const next = checked
                                            ? current.filter((value) => String(value) !== String(option.value))
                                            : [...current, option.value]

                                        section.onChange?.(next)
                                      }}
                                  />
                                  <span className="adv-search-label">{option.label}</span>
                                </label>
                            )
                          })}
                        </div>
                      </div>
                    </details>
                )
              })}
            </div>
        )}
      </section>
  )
}

export default AdvancedSearchPanel
