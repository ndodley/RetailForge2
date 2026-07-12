import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthPage from '../pages/auth/AuthPage'
import HomePage from '../pages/HomePage'
import ProductsPage from '../pages/ProductsPage.tsx'
import ProductInfoPage from '../pages/ProductInfoPage'
import CartPage from '../pages/CartPage.tsx'
import CheckoutPage from '../pages/CheckoutPage'
import OrderConfirmationPage from "../pages/OrderConfirmationPage.tsx";
import AdminCategoriesPage from '../pages/admin/categories/AdminCategoriesPage.tsx'
import AdminDepartmentsPage from '../pages/admin/departments/AdminDepartmentsPage.tsx'
import AdminProductsPage from '../pages/admin/products/AdminProductsPage.tsx'
import AdminReviewsPage from '../pages/admin/reviews/AdminReviewsPage.tsx'
import AdminUsersPage from '../pages/admin/users/AdminUsersPage.tsx'
import AdminOrdersPage from '../pages/admin/orders/AdminOrdersPage.tsx'
import AdminOrderDetailPage from '../pages/admin/orders/AdminOrderDetailPage.tsx'
//import MyProfilePage from '../pages/mypages/MyProfilePage'
//import MyFavoritesPage from '../pages/mypages/MyFavoritesPage'
//import MyReviewsPage from '../pages/mypages/MyReviewsPage'
//import MyOrdersPage from '../pages/mypages/MyOrdersPage'
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
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductInfoPage />} />
                <Route path="/cart" element={<CartPage />} />

                // My Personal Pages
                {/*<Route path="/my-profile" element={<MyProfilePage />} />
                <Route path="/my-favorites" element={<MyFavoritesPage />} />
                <Route path="/my-reviews" element={<MyReviewsPage />} />
                <Route path="/my-orders" element={<MyOrdersPage />} />*/}

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
                            <AdminDepartmentsPage />
                        </RequireRole>
                    }
                />

                <Route path="/admin/categories"
                    element={
                        <RequireRole allowedRoles={['manager', 'employee']}>
                            <AdminCategoriesPage />
                        </RequireRole>
                    }
                />
                <Route path="/admin/products"
                    element={
                        <RequireRole allowedRoles={['manager', 'employee']}>
                            <AdminProductsPage />
                        </RequireRole>
                    }
                />
                <Route path="/admin/reviews"
                    element={
                        <RequireRole allowedRoles={['manager', 'employee']}>
                            <AdminReviewsPage />
                        </RequireRole>
                    }
                />
                <Route path="/admin/users"
                       element={
                           <RequireRole allowedRoles={['manager', 'employee']}>
                               <AdminUsersPage />
                           </RequireRole>
                       }
                />
                <Route path="/admin/orders"
                       element={
                           <RequireRole allowedRoles={['manager', 'employee']}>
                               <AdminOrdersPage />
                           </RequireRole>
                       }
                />
                <Route path="/admin/orders/:id"
                       element={
                           <RequireRole allowedRoles={['manager', 'employee']}>
                               <AdminOrderDetailPage />
                           </RequireRole>
                       }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes
