"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Package, Calendar, Heart, Settings, LogOut, ChevronRight, Home } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useAuth } from "@/lib/auth-context"

export default function AccountPage() {
  const router = useRouter()
  const { user, profile, isLoading, signOut } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login?redirect=/account")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const menuItems = [
    {
      icon: Package,
      label: "My Orders",
      description: "View and track your orders",
      href: "/account/orders",
    },
    {
      icon: Calendar,
      label: "My Bookings",
      description: "Manage apartment reservations",
      href: "/account/bookings",
    },
    {
      icon: Home,
      label: "Tenant Portal (Rent & Lease)",
      description: "Manage your active lease and rent payments",
      href: "/account/tenant",
    },
    {
      icon: Heart,
      label: "Wishlist",
      description: "Products you've saved",
      href: "/account/wishlist",
    },
    {
      icon: Settings,
      label: "Account Settings",
      description: "Update your profile and preferences",
      href: "/account/settings",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="bg-muted/30 rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h1 className="font-serif text-3xl text-foreground mb-1">
                  {profile?.first_name
                    ? `${profile.first_name} ${profile.last_name || ""}`
                    : "Welcome"}
                </h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-3">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between p-5 bg-card border border-border/50 rounded-xl hover:border-border hover:shadow-sm boty-transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center group-hover:bg-primary/10 boty-transition">
                    <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary boty-transition" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{item.label}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground boty-transition" />
              </Link>
            ))}
          </div>

          {/* Sign Out Button */}
          <div className="mt-8 pt-8 border-t border-border/50">
            <button
              onClick={() => signOut()}
              className="flex items-center gap-3 text-destructive hover:text-destructive/80 boty-transition"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
