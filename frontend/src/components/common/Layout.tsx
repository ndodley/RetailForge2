import type { ReactNode } from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"
import "./Layout.css"

interface LayoutProps {
    children: ReactNode
    isAdmin?: boolean
    isStorefront?: boolean
}

function Layout({ children, isAdmin = false, isStorefront = false }: LayoutProps) {
    return (
        <>
            <Navbar />
            <main
                className={
                    `layout-page` +
                    (isAdmin ? " admin-layout" : "") +
                    (isStorefront ? " storefront-layout" : "")
                }
            >
                <div className="layout-container">{children}</div>
            </main>
            <Footer />
        </>
    )
}

export default Layout
