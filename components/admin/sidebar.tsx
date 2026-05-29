"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Calendar,
  Users,
  Settings,
  Home,
  CreditCard,
  Boxes,
  Calculator,
  Sparkles,
  Receipt,
  UserCircle,
  FileText,
} from "lucide-react"

interface SidebarItem {
  icon: any
  label: string
  href: string
}

export function AdminSidebar() {
  const pathname = usePathname()

  const sidebarItems: SidebarItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: CreditCard, label: "POS", href: "/admin/pos" },
    { icon: Package, label: "Products", href: "/admin/products" },
    { icon: Boxes, label: "Inventory", href: "/admin/inventory" },
    { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
    { icon: Home, label: "Apartments", href: "/admin/apartments" },
    { icon: Calendar, label: "Bookings", href: "/admin/bookings" },
    { icon: Receipt, label: "Rent Collection", href: "/admin/rent" },
    { icon: Sparkles, label: "Cleaning", href: "/admin/cleaning" },
    { icon: Calculator, label: "Accounting", href: "/admin/accounting" },
    { icon: UserCircle, label: "CRM", href: "/admin/crm" },
    { icon: Users, label: "Staff", href: "/admin/staff" },
    { icon: FileText, label: "CMS", href: "/admin/cms" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ]

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border/50 z-50 hidden lg:block">
      <div className="p-6">
        <Link href="/" className="font-serif text-2xl text-foreground font-semibold">
          Mulla
        </Link>
        <p className="text-xs text-muted-foreground mt-1">Admin Dashboard</p>
      </div>
      <nav className="px-4 space-y-1 overflow-y-auto h-[calc(100vh-140px)]">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium boty-transition ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50 bg-card">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted boty-transition"
        >
          <Home className="w-5 h-5" />
          Back to Store
        </Link>
      </div>
    </aside>
  )
}
