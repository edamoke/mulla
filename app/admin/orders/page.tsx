"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Calendar,
  Users,
  Settings,
  Home,
  Search,
  Eye,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { AdminSidebar } from "@/components/admin/sidebar"
import type { Order } from "@/lib/types"

const statusIcons: Record<string, typeof Package> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
}

const statusColors: Record<string, string> = {
  pending: "text-yellow-600 bg-yellow-50",
  confirmed: "text-blue-600 bg-blue-50",
  processing: "text-purple-600 bg-purple-50",
  shipped: "text-indigo-600 bg-indigo-50",
  delivered: "text-green-600 bg-green-50",
  cancelled: "text-red-600 bg-red-50",
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const { user, isAdmin, isLoading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth/login?redirect=/admin/orders")
      } else if (!isAdmin) {
        router.push("/")
      }
    }
  }, [user, isAdmin, authLoading, router])

  useEffect(() => {
    async function fetchOrders() {
      if (!user || !isAdmin) return

      const supabase = createClient()
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })

      if (!error && data) {
        setOrders(data as Order[])
      }
      setIsLoading(false)
    }

    if (user && isAdmin) {
      fetchOrders()
    }
  }, [user, isAdmin])

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || o.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId)

    if (!error) {
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o)))
    }
  }

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="lg:ml-64 flex-1 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl text-foreground">Orders</h1>
            <p className="text-muted-foreground">Manage customer orders</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border/50 rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-border/50 rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Orders Table */}
          <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="p-8">
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingCart className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Order
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Customer
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Total
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Payment
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const StatusIcon = statusIcons[order.status] || Package
                    const statusColor = statusColors[order.status] || "text-gray-600 bg-gray-50"

                    return (
                      <tr
                        key={order.id}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/30"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-foreground">{order.order_number}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-foreground">
                            {order.customer_name || "Guest"}
                          </p>
                          <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("en-KE", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 font-medium text-foreground">
                          KES {order.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              order.payment_status === "paid"
                                ? "bg-green-50 text-green-600"
                                : order.payment_status === "failed"
                                ? "bg-red-50 text-red-600"
                                : "bg-yellow-50 text-yellow-600"
                            }`}
                          >
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className={`px-3 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${statusColor}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
