export type DepartmentStatus = 'active' | 'seasonal' | 'archived'

export interface DepartmentRecord {
  id: number
  name: string
  slug: string
  description: string
  categoryCount: number
  productCount: number
  featuredProduct: string
  updatedAt: string
  status: DepartmentStatus
}

export interface CategoryRecord {
  id: number
  name: string
  description: string
  departmentId: number | null
  departmentName: string | null
  productCount: number
}

export interface ProductRecord {
  id: number
  name: string
  brand: string | null
  rating: number
  price: number
  description: string
  stock: number
  imagePath: string | null
  categoryId: number | null
  categoryName: string | null
  departmentId: number | null
  departmentName: string | null
}

export interface UserRecord {
  id: number
  first_name: string
  last_name: string
  email: string
  password?: string
  role: string
  phoneNumber: string
  address: string
  avatar_path: string | null
}

export interface ReviewRecord {
  id: number
  productId: number
  productName: string
  productImagePath: string | null
  userId: number
  userEmail: string
  userFullName: string
  rating: number
  comment: string
  created_at: string
  updated_at: string
}

export interface OrderRecord {
  id: number
  userId: number
  userEmail: string
  total: number
  status: string
  shippingAddress: string
  createdAt: string
  itemCount: number
}

export interface OrderDetailRecord extends OrderRecord {
  items: Array<{
    productId: number
    productName: string
    imagePath: string | null
    price: number
    quantity: number
  }>
}

export interface HighlightMetric {
  label: string
  value: string
  note: string
}

export interface StoreProduct {
  id: number
  name: string
  department: string
  category: string
  price: number
  rating: number
  badge: string
  blurb: string
  description: string
  emoji: string
  accent: string
  stock: number
}

export interface CartLineItem {
  id: number
  productId: number
  name: string
  price: number
  quantity: number
  department: string
}

