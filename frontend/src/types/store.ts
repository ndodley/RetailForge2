export type DepartmentStatus = 'active' | 'seasonal' | 'archived'

export interface DepartmentRecord {
  id: number
  name: string
  slug: string
  description: string
  categoryCount: number
  productCount: number
  featuredProduct: string
  manager: string
  updatedAt: string
  status: DepartmentStatus
}

export interface CategoryRecord {
  id: number
  name: string
  description: string
  departmentId: number | null
  departmentName: string | null
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

