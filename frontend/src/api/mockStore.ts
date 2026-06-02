import type {
  CartLineItem,
  DepartmentRecord,
  HighlightMetric,
  StoreProduct,
} from '../types/store'

export const departmentSeed: DepartmentRecord[] = [
  {
	id: 1,
	name: 'Electronics',
	slug: 'electronics',
	description: 'Premium devices, smart home picks, headphones, and everyday productivity gear.',
	categoryCount: 6,
	productCount: 48,
	featuredProduct: 'Aurora Wireless Headphones',
	manager: 'Avery Chen',
	updatedAt: '2026-05-10',
	status: 'active',
  },
  {
	id: 2,
	name: 'Home & Living',
	slug: 'home-living',
	description: 'Kitchen upgrades, decor, soft furnishings, and useful home essentials.',
	categoryCount: 5,
	productCount: 32,
	featuredProduct: 'Foundry Espresso Machine',
	manager: 'Jordan Rivera',
	updatedAt: '2026-05-08',
	status: 'active',
  },
  {
	id: 3,
	name: 'Sports & Outdoors',
	slug: 'sports-outdoors',
	description: 'Travel-friendly gear, activewear accessories, and trail-ready essentials.',
	categoryCount: 4,
	productCount: 21,
	featuredProduct: 'North Trail Daypack',
	manager: 'Taylor Brooks',
	updatedAt: '2026-05-06',
	status: 'seasonal',
  },
  {
	id: 4,
	name: 'Beauty',
	slug: 'beauty',
	description: 'Skincare, self-care bundles, and wellness products curated for gifting.',
	categoryCount: 3,
	productCount: 17,
	featuredProduct: 'Luma Skincare Set',
	manager: 'Morgan Patel',
	updatedAt: '2026-04-30',
	status: 'archived',
  },
]

export const homeHighlights: HighlightMetric[] = [
  {
	label: 'Pages ready to build from',
	value: '5',
	note: 'Home, products, product details, cart, and admin departments.',
  },
  {
	label: 'Department workflows mocked',
	value: 'List + Upsert',
	note: 'Combined into one tabbed page so you can design now and wire the API later.',
  },
  {
	label: 'Backend target',
	value: 'Spring Boot + PostgreSQL',
	note: 'Use this mock data first, then replace it with real controller endpoints.',
  },
]

export const productSeed: StoreProduct[] = [
  {
	id: 101,
	name: 'Aurora Wireless Headphones',
	department: 'Electronics',
	category: 'Audio',
	price: 199,
	rating: 4.8,
	badge: 'Best seller',
	blurb: 'Immersive sound and premium comfort for a modern storefront hero section.',
	description:
	  'Aurora Wireless Headphones are a strong first product for your remake because they showcase price, rating, badges, and a clean detail page layout.\n\nUse this mock description until your Spring Boot product endpoint is ready.',
	emoji: '',
	accent: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
	stock: 14,
  },
  {
	id: 102,
	name: 'Foundry Espresso Machine',
	department: 'Home & Living',
	category: 'Kitchen',
	price: 289,
	rating: 4.7,
	badge: 'Kitchen favorite',
	blurb: 'A polished premium card that helps shape the tone of the remake home page.',
	description:
	  'Foundry Espresso Machine gives the catalog more depth and helps you test featured sections, pricing, and product cards.\n\nThis is also a good placeholder for future inventory, cart, and checkout flows.',
	emoji: '☕',
	accent: 'linear-gradient(135deg, #f97316, #ea580c)',
	stock: 9,
  },
  {
	id: 103,
	name: 'North Trail Daypack',
	department: 'Sports & Outdoors',
	category: 'Outdoor Gear',
	price: 124,
	rating: 4.6,
	badge: 'Adventure pick',
	blurb: 'Great sample data for stock-aware cart rules and category filtering later.',
	description:
	  'North Trail Daypack helps you test a second major department with different merchandising language.\n\nIt also works well for future favorites, cart, and order detail pages.',
	emoji: '',
	accent: 'linear-gradient(135deg, #059669, #0f766e)',
	stock: 22,
  },
  {
	id: 104,
	name: 'Luma Skincare Set',
	department: 'Beauty',
	category: 'Skincare',
	price: 76,
	rating: 4.5,
	badge: 'Self-care',
	blurb: 'Rounds out the mock catalog with a softer lifestyle-focused department.',
	description:
	  'Luma Skincare Set gives the storefront a more complete department-store feeling.\n\nIt is a useful placeholder while you rebuild categories, products, and reviews.',
	emoji: '✨',
	accent: 'linear-gradient(135deg, #ec4899, #db2777)',
	stock: 18,
  },
]

export const cartSeed: CartLineItem[] = [
  {
	id: 1,
	productId: 101,
	name: 'Aurora Wireless Headphones',
	price: 199,
	quantity: 1,
	department: 'Electronics',
  },
  {
	id: 2,
	productId: 103,
	name: 'North Trail Daypack',
	price: 124,
	quantity: 2,
	department: 'Sports & Outdoors',
  },
]

