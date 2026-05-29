"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Calendar, Clock, CheckCircle, Home, XCircle } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
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

export default function BookingsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [bookings, setBookings] = useState<(ApartmentBooking & { apartment_name?: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/account/bookings")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    async function fetchBookings() {
      if (!user) return

      const supabase = createClient()
      const { data, error } = await supabase
        .from("apartment_bookings")
        .select(`
          *,
          apartments (name)
        `)
        .eq("user_id", user.id)
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

    if (user) {
      fetchBookings()
    }
  }, [user])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 boty-transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Account
          </Link>

          <h1 className="font-serif text-4xl text-foreground mb-8">My Bookings</h1>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h2 className="font-serif text-2xl text-foreground mb-2">No bookings yet</h2>
              <p className="text-muted-foreground mb-6">
                Browse our apartments and make your first reservation
              </p>
              <Link
                href="/apartments"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 boty-transition"
              >
                Browse Apartments
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const StatusIcon = statusIcons[booking.status] || Calendar
                const statusColor = statusColors[booking.status] || "text-gray-600 bg-gray-50"

                return (
                  <div
                    key={booking.id}
                    className="p-6 bg-card border border-border/50 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {booking.apartment_name || "Apartment"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.booking_number}
                        </p>
                      </div>
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1).replace("_", " ")}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-muted-foreground">Check-in</p>
                        <p className="font-medium text-foreground">
                          {new Date(booking.check_in_date).toLocaleDateString("en-KE", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Check-out</p>
                        <p className="font-medium text-foreground">
                          {new Date(booking.check_out_date).toLocaleDateString("en-KE", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-4 border-t border-border/50">
                      <span className="text-muted-foreground">
                        {booking.nights} night{booking.nights > 1 ? "s" : ""} &middot;{" "}
                        {booking.guests} guest{booking.guests > 1 ? "s" : ""}
                      </span>
                      <span className="font-medium text-foreground">
                        KES {booking.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
