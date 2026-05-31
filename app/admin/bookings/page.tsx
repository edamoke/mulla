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
  XCircle,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { AdminSidebar } from "@/components/admin/sidebar"
import type { ApartmentBooking } from "@/lib/types"

const statusIcons: Record<string, typeof Calendar> = {
  pending: Clock,
  confirmed: CheckCircle,
  checked_in: Home,
  checked_out: CheckCircle,
  cancelled: XCircle,
}

const statusColors: Record<string, string> = {
  pending: "text-yellow-600 bg-yellow-50",
  confirmed: "text-blue-600 bg-blue-50",
  checked_in: "text-green-600 bg-green-50",
  checked_out: "text-gray-600 bg-gray-50",
  cancelled: "text-red-600 bg-red-50",
}

export default function AdminBookingsPage() {
  const router = useRouter()
  const { user, isAdmin, isLoading: authLoading } = useAuth()
  const [bookings, setBookings] = useState<(ApartmentBooking & { apartment_name?: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth/login?redirect=/admin/bookings")
      } else if (!isAdmin) {
        router.push("/")
      }
    }
  }, [user, isAdmin, authLoading, router])

  useEffect(() => {
    async function fetchBookings() {
      if (!user || !isAdmin) return

      const supabase = createClient()
      const { data, error } = await supabase
        .from("apartment_bookings")
        .select("*, apartments(name)")
        .order("created_at", { ascending: false })

      if (!error && data) {
        setBookings(
          data.map((b: any) => ({
            ...b,
            apartment_name: b.apartments?.name,
          }))
        )
      }
      setIsLoading(false)
    }

    if (user && isAdmin) {
      fetchBookings()
    }
  }, [user, isAdmin])

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.booking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.guest_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.guest_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.apartment_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || b.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("apartment_bookings")
      .update({ status: newStatus })
      .eq("id", bookingId)

    if (!error) {
      setBookings(
        bookings.map((b) => (b.id === bookingId ? { ...b, status: newStatus as any } : b))
      )
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

      {/* Main content */}
      <main className="lg:ml-64 flex-1 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-3xl text-foreground">Bookings</h1>
            <p className="text-muted-foreground">Manage apartment reservations</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search bookings..."
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
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Bookings Table */}
          <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="p-8">
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No bookings found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Booking
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Apartment
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Guest
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Dates
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                      Total
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
                  {filteredBookings.map((booking) => {
                    const StatusIcon = statusIcons[booking.status] || Calendar
                    const statusColor =
                      statusColors[booking.status] || "text-gray-600 bg-gray-50"

                    return (
                      <tr
                        key={booking.id}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/30"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-foreground">
                            {booking.booking_number}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {booking.apartment_name || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-foreground">
                            {booking.guest_name || "Guest"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {booking.guest_email}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          <p>
                            {new Date(booking.check_in_date).toLocaleDateString("en-KE", {
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            -{" "}
                            {new Date(booking.check_out_date).toLocaleDateString("en-KE", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-xs">
                            {booking.nights} night{booking.nights > 1 ? "s" : ""}
                          </p>
                        </td>
                        <td className="px-6 py-4 font-medium text-foreground">
                          KES {booking.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={booking.status}
                            onChange={(e) =>
                              updateBookingStatus(booking.id, e.target.value)
                            }
                            className={`px-3 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${statusColor}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="checked_in">Checked In</option>
                            <option value="checked_out">Checked Out</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/bookings/${booking.id}`}
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
