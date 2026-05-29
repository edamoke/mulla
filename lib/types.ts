// Database types for Mulla Boutique

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  price: number
  compare_at_price: number | null
  cost_price: number | null
  sku: string | null
  barcode: string | null
  category_id: string | null
  images: string[]
  thumbnail_url: string | null
  sizes: string[]
  colors: string[]
  materials: string | null
  dimensions: string | null
  weight: number | null
  stock_quantity: number
  low_stock_threshold: number
  track_inventory: boolean
  allow_backorder: boolean
  badge: 'new' | 'bestseller' | 'sale' | 'limited' | null
  is_featured: boolean
  is_active: boolean
  meta_title: string | null
  meta_description: string | null
  tags: string[]
  created_at: string
  updated_at: string
  category?: Category
}

export interface Order {
  id: string
  order_number: string
  user_id: string | null
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method: 'mpesa' | 'card' | 'bank_transfer' | 'cash_on_delivery'
  payment_reference: string | null
  subtotal: number
  shipping_cost: number
  tax_amount: number
  discount_amount: number
  total: number
  currency: string
  shipping_address: {
    line1: string
    line2?: string
    city: string
    country: string
    postal_code?: string
  } | null
  billing_address: {
    line1: string
    line2?: string
    city: string
    country: string
    postal_code?: string
  } | null
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  notes: string | null
  tracking_number: string | null
  shipped_at: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_image: string | null
  quantity: number
  unit_price: number
  total_price: number
  size: string | null
  color: string | null
  created_at: string
}

export interface Apartment {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  price_per_night: number
  price_per_week: number | null
  price_per_month: number | null
  cleaning_fee: number
  security_deposit: number
  location: string
  address: string | null
  latitude: number | null
  longitude: number | null
  images: string[]
  thumbnail_url: string | null
  bedrooms: number
  bathrooms: number
  max_guests: number
  area_sqm: number | null
  amenities: string[]
  house_rules: string[]
  check_in_time: string
  check_out_time: string
  minimum_nights: number
  maximum_nights: number
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ApartmentBooking {
  id: string
  booking_number: string
  apartment_id: string
  user_id: string | null
  check_in_date: string
  check_out_date: string
  nights: number
  guests: number
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show'
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded'
  payment_method: string
  payment_reference: string | null
  accommodation_total: number
  cleaning_fee: number
  service_fee: number
  tax_amount: number
  discount_amount: number
  total: number
  currency: string
  guest_name: string | null
  guest_email: string | null
  guest_phone: string | null
  special_requests: string | null
  internal_notes: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
  created_at: string
  updated_at: string
  apartment?: Apartment
}

export interface Profile {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  country: string | null
  role: 'customer' | 'admin' | 'staff'
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  user_id: string
  product_id: string | null
  apartment_id: string | null
  rating: number
  title: string | null
  content: string | null
  is_verified_purchase: boolean
  is_approved: boolean
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product?: Product
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  size: string | null
  color: string | null
  created_at: string
  updated_at: string
  product?: Product
}

// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
