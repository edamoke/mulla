'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Users, ShoppingBag, DollarSign, Mail, Phone, 
  Calendar, Search, Filter, ChevronDown, User, Star, TrendingUp
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Customer {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  created_at: string
  total_orders: number
  total_spent: number
  last_order_date: string | null
}

interface Order {
  id: string
  order_number: string
  total: number
  status: string
  created_at: string
  customer_email: string
  items_count: number
}

export default function CRMPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'customers' | 'orders'>('customers')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerOrders, setCustomerOrders] = useState<Order[]>([])

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)

    // Fetch customer profiles
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false })

    // For each customer, get their order stats
    if (profilesData) {
      const customersWithStats = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: ordersData } = await supabase
            .from('orders')
            .select('total, created_at')
            .eq('user_id', profile.id)
            .eq('payment_status', 'paid')

          const totalOrders = ordersData?.length || 0
          const totalSpent = ordersData?.reduce((sum, o) => sum + (o.total || 0), 0) || 0
          const lastOrder = ordersData?.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0]

          return {
            ...profile,
            total_orders: totalOrders,
            total_spent: totalSpent,
            last_order_date: lastOrder?.created_at || null
          }
        })
      )
      setCustomers(customersWithStats as Customer[])
    }

    // Fetch recent orders
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*, order_items(count)')
      .order('created_at', { ascending: false })
      .limit(50)

    if (ordersData) {
      setRecentOrders(ordersData.map(o => ({
        ...o,
        items_count: o.order_items?.[0]?.count || 0
      })) as Order[])
    }

    setIsLoading(false)
  }

  const fetchCustomerOrders = async (customerId: string) => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(count)')
      .eq('user_id', customerId)
      .order('created_at', { ascending: false })

    if (data) {
      setCustomerOrders(data.map(o => ({
        ...o,
        items_count: o.order_items?.[0]?.count || 0
      })) as Order[])
    }
  }

  const filteredCustomers = customers.filter(c =>
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  )

  const filteredOrders = recentOrders.filter(o =>
    o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'delivered': return 'bg-green-100 text-green-700'
      case 'processing': case 'shipped': return 'bg-blue-100 text-blue-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Stats
  const totalCustomers = customers.length
  const activeCustomers = customers.filter(c => c.total_orders > 0).length
  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0)
  const avgOrderValue = totalRevenue / (recentOrders.length || 1)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 hover:bg-accent rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold">Customer Relationship Management</h1>
                <p className="text-sm text-muted-foreground">Manage customers and orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{totalCustomers}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Buyers</p>
                <p className="text-2xl font-bold">{activeCustomers}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold">{formatCurrency(avgOrderValue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setActiveTab('customers')
              setSelectedCustomer(null)
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'customers' ? 'bg-primary text-primary-foreground' : 'bg-accent'
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => {
              setActiveTab('orders')
              setSelectedCustomer(null)
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'orders' ? 'bg-primary text-primary-foreground' : 'bg-accent'
            }`}
          >
            Orders
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={activeTab === 'customers' ? 'Search customers...' : 'Search orders...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {selectedCustomer ? (
          /* Customer Detail View */
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {selectedCustomer.first_name || selectedCustomer.last_name 
                        ? `${selectedCustomer.first_name || ''} ${selectedCustomer.last_name || ''}`
                        : 'Customer'}
                    </h2>
                    <p className="text-muted-foreground">{selectedCustomer.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Back to list
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-background rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{selectedCustomer.total_orders}</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedCustomer.total_spent)}</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-lg font-medium">{selectedCustomer.phone || 'Not provided'}</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Customer Since</p>
                  <p className="text-lg font-medium">
                    {new Date(selectedCustomer.created_at).toLocaleDateString('en-KE')}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Orders */}
            <div className="bg-card border border-border rounded-xl">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Order History</h3>
              </div>
              <div className="divide-y divide-border">
                {customerOrders.map(order => (
                  <div key={order.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.items_count} items | {new Date(order.created_at).toLocaleDateString('en-KE')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="font-semibold">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                ))}
                {customerOrders.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No orders yet
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'customers' ? (
          /* Customers Table */
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-accent/50">
                <tr>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Contact</th>
                  <th className="text-right p-4 font-medium">Orders</th>
                  <th className="text-right p-4 font-medium">Total Spent</th>
                  <th className="text-left p-4 font-medium">Last Order</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-accent/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {customer.first_name || customer.last_name 
                              ? `${customer.first_name || ''} ${customer.last_name || ''}`
                              : 'Customer'}
                          </p>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {customer.phone || '-'}
                    </td>
                    <td className="p-4 text-right font-medium">
                      {customer.total_orders}
                    </td>
                    <td className="p-4 text-right font-semibold text-green-600">
                      {formatCurrency(customer.total_spent)}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {customer.last_order_date 
                        ? new Date(customer.last_order_date).toLocaleDateString('en-KE')
                        : 'Never'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer)
                          fetchCustomerOrders(customer.id)
                        }}
                        className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCustomers.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No customers found
              </div>
            )}
          </div>
        ) : (
          /* Orders Table */
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-accent/50">
                <tr>
                  <th className="text-left p-4 font-medium">Order</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-right p-4 font-medium">Items</th>
                  <th className="text-right p-4 font-medium">Total</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-accent/30">
                    <td className="p-4 font-medium">{order.order_number}</td>
                    <td className="p-4 text-muted-foreground">{order.customer_email || '-'}</td>
                    <td className="p-4 text-right">{order.items_count}</td>
                    <td className="p-4 text-right font-semibold">{formatCurrency(order.total)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('en-KE')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No orders found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
