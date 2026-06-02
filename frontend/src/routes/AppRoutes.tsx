import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import ProductPage from '../pages/ProductPage'
import ProductInfoPage from '../pages/ProductInfoPage'
import Cart from '../pages/Cart'
import CategoriesPage from '../pages/admin/categories/CategoriesPage'
import DepartmentsPage from '../pages/admin/departments/DepartmentsPage'
import ProductsPage from '../pages/admin/products/ProductsPage'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/products/:id" element={<ProductInfoPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/admin/departments" element={<DepartmentsPage />} />
        <Route path="/admin/categories" element={<CategoriesPage />} />
        <Route path="/admin/products" element={<ProductsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
