import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthPage from '../pages/auth/AuthPage'
import HomePage from '../pages/HomePage'
import ProductPage from '../pages/ProductPage'
import ProductInfoPage from '../pages/ProductInfoPage'
import Cart from '../pages/Cart'
import CheckoutPage from '../pages/CheckoutPage'
import OrderConfirmationPage from "../pages/OrderConfirmationPage.tsx";
import CategoriesPage from '../pages/admin/categories/CategoriesPage'
import DepartmentsPage from '../pages/admin/departments/DepartmentsPage'
import ProductsPage from '../pages/admin/products/ProductsPage'
import ReviewsPage from '../pages/admin/reviews/ReviewsPage'
import UsersPage from '../pages/admin/users/UsersPage'
import OrdersPage from '../pages/admin/orders/OrdersPage'
import OrderDetailPage from '../pages/admin/orders/OrderDetailPage'
import { RequireRole } from './RequireRole'

// ⭐ Stripe imports
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

// ⭐ Load Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

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

                {/* ⭐ FIXED: Wrap CheckoutPage in <Elements> */}
                <Route path="/checkout"
                    element={
                        <Elements stripe={stripePromise}>
                            <CheckoutPage />
                        </Elements>
                    }
                />

                <Route path="/order-confirmation"
                    element={<OrderConfirmationPage />} />

                <Route path="/admin/departments"
                    element={
                        <RequireRole allowedRoles={['manager', 'employee']}>
                            <DepartmentsPage />
                        </RequireRole>
                    }
                />

                <Route path="/admin/categories"
                    element={
                        <RequireRole allowedRoles={['manager', 'employee']}>
                            <CategoriesPage />
                        </RequireRole>
                    }
                />
                <Route path="/admin/products"
                    element={
                        <RequireRole allowedRoles={['manager', 'employee']}>
                            <ProductsPage />
                        </RequireRole>
                    }
                />
                <Route path="/admin/reviews"
                    element={
                        <RequireRole allowedRoles={['manager', 'employee']}>
                            <ReviewsPage />
                        </RequireRole>
                    }
                />
                <Route path="/admin/users"
                       element={
                           <RequireRole allowedRoles={['manager', 'employee']}>
                               <UsersPage />
                           </RequireRole>
                       }
                />
                <Route path="/admin/orders"
                       element={
                           <RequireRole allowedRoles={['manager', 'employee']}>
                               <OrdersPage />
                           </RequireRole>
                       }
                />
                <Route path="/admin/orders/:id"
                       element={
                           <RequireRole allowedRoles={['manager', 'employee']}>
                               <OrderDetailPage />
                           </RequireRole>
                       }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes
