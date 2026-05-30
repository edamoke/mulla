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
  TrendingUp,
  DollarSign,
  Home,
  ArrowUp,
  ArrowDown,
  CreditCard,
  Boxes,
  Calculator,
  Sparkles,
  Receipt,
  UserCircle,
  FileText,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { AdminSidebar } from "@/components/admin/sidebar"

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalBookings: number
  totalProducts: number
  recentOrders: any[]
  recentBookings: any[]
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isAdmin, isLoading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth/login?redirect=/admin")
      } else if (!isAdmin) {
        router.push("/")
      }
    }
  }, [user, isAdmin, authLoading, router])

  useEffect(() => {
    async function fetchStats() {
      if (!user || !isAdmin) return

      const supabase = createClient()

      // Fetch all stats in parallel
      const [ordersRes, bookingsRes, productsRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
        supabase
          .from("apartment_bookings")
          .select("*, apartments(name)")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("products").select("id", { count: "exact" }),
      ])

      const orders = ordersRes.data || []
      const bookings = bookingsRes.data || []

      const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
      const bookingRevenue = bookings.reduce((sum, b) => sum + (b.total || 0), 0)

      setStats({
        totalRevenue: totalRevenue + bookingRevenue,
        totalOrders: orders.length,
        totalBookings: bookings.length,
        totalProducts: productsRes.count || 0,
        recentOrders: orders,
        recentBookings: bookings.map((b: any) => ({
          ...b,
          apartment_name: b.apartments?.name,
        })),
      })
      setIsLoading(false)
    }

    if (user && isAdmin) {
      fetchStats()
    }
  }, [user, isAdmin])

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }


  const statCards = [
    {
      title: "Total Revenue",
      value: stats ? `KES ${stats.totalRevenue.toLocaleString()}` : "---",
      icon: DollarSign,
      change: "+12%",
      positive: true,
    },
    {
      title: "Orders",
      value: stats?.totalOrders?.toString() || "0",
      icon: ShoppingCart,
      change: "+5%",
      positive: true,
    },
    {
      title: "Bookings",
      value: stats?.totalBookings?.toString() || "0",
      icon: Calendar,
      change: "+8%",
      positive: true,
    },
    {
      title: "Products",
      value: stats?.totalProducts?.toString() || "0",
      icon: Package,
      change: "0%",
      positive: true,
    },
  ]

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here&apos;s what&apos;s happening with your store.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat) => (
              <div
                key={stat.title}
                className="bg-card border border-border/50 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      stat.positive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.positive ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-card border border-border/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-medium text-foreground">Recent Orders</h2>
                <Link
                  href="/admin/orders"
                  className="text-sm text-primary hover:text-primary/80"
                >
                  View all
                </Link>
              </div>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
                  ))}
                </div>
              ) : stats?.recentOrders.length === 0 ? (
                <p className="text-muted-foreground text-sm">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {stats?.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {order.order_number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.customer_name || order.customer_email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm text-foreground">
                          KES {order.total?.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {order.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Bookings */}
            <div className="bg-card border border-border/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-medium text-foreground">Recent Bookings</h2>
                <Link
                  href="/admin/bookings"
                  className="text-sm text-primary hover:text-primary/80"
                >
                  View all
                </Link>
              </div>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
                  ))}
                </div>
              ) : stats?.recentBookings.length === 0 ? (
                <p className="text-muted-foreground text-sm">No bookings yet</p>
              ) : (
                <div className="space-y-4">
                  {stats?.recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {booking.apartment_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.guest_name || booking.guest_email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm text-foreground">
                          KES {booking.total?.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {booking.status?.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
