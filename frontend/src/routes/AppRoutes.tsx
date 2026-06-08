import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthPage from '../pages/auth/AuthPage'
import HomePage from '../pages/HomePage'
import ProductPage from '../pages/ProductPage'
import ProductInfoPage from '../pages/ProductInfoPage'
import Cart from '../pages/Cart'
import CategoriesPage from '../pages/admin/categories/CategoriesPage'
import DepartmentsPage from '../pages/admin/departments/DepartmentsPage'
import ProductsPage from '../pages/admin/products/ProductsPage'
import { RequireRole } from './RequireRole'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/products/:id" element={<ProductInfoPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/admin/departments"
          element={
            <RequireRole allowedRoles={['manager', 'employee']}>
              <DepartmentsPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <RequireRole allowedRoles={['manager', 'employee']}>
              <CategoriesPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/products"
          element={
            <RequireRole allowedRoles={['manager', 'employee']}>
              <ProductsPage />
            </RequireRole>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
