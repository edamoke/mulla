"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Calendar,
  Users,
  Settings,
  Home,
  Save,
  CreditCard,
  Boxes,
  Calculator,
  Sparkles,
  Receipt,
  UserCircle,
  Store,
  Globe,
  FileText,
  Mail,
  Bell,
  Shield,
  Smartphone,
} from "lucide-react"

export default function AdminSettingsPage() {
  const { profile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    store_name: "Boty",
    store_email: "info@boty.co.ke",
    store_phone: "+254 700 000 000",
    store_address: "Nairobi, Kenya",
    currency: "KES",
    tax_rate: "16",
    enable_guest_checkout: true,
    enable_email_notifications: true,
    enable_sms_notifications: false,
    low_stock_threshold: "10",
    maintenance_mode: false,
    etims_pin: "P051234567A",
    etims_device_id: "DEV-MULLA-2026",
    etims_server_url: "https://etims-api.kra.go.ke/v1",
    mpesa_shortcode: "174379",
    mpesa_consumer_key: "CON_KEY_MULLA_2026",
    mpesa_consumer_secret: "CON_SEC_MULLA_2026",
    mpesa_passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
    enable_online_pos_purchase: true,
  })

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch('/api/admin/settings')
        const data = await response.json()
        if (data.success && data.settings) {
          setSettings(data.settings)
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
    loadSettings()
  }, [])

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin", active: false },
    { icon: CreditCard, label: "POS", href: "/admin/pos", active: false },
    { icon: Package, label: "Products", href: "/admin/products", active: false },
    { icon: Boxes, label: "Inventory", href: "/admin/inventory", active: false },
    { icon: ShoppingCart, label: "Orders", href: "/admin/orders", active: false },
    { icon: Home, label: "Apartments", href: "/admin/apartments", active: false },
    { icon: Calendar, label: "Bookings", href: "/admin/bookings", active: false },
    { icon: Receipt, label: "Rent Collection", href: "/admin/rent", active: false },
    { icon: Sparkles, label: "Cleaning", href: "/admin/cleaning", active: false },
    { icon: Calculator, label: "Accounting", href: "/admin/accounting", active: false },
    { icon: UserCircle, label: "CRM", href: "/admin/crm", active: false },
    { icon: Users, label: "Staff", href: "/admin/staff", active: false },
    { icon: FileText, label: "CMS", href: "/admin/cms", active: false },
    { icon: Settings, label: "Settings", href: "/admin/settings", active: true },
  ]

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      const data = await response.json()
      if (data.success) {
        alert("Settings saved successfully!")
      } else {
        alert("Failed to save settings.")
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert("Failed to save settings.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r bg-background lg:block">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Home className="h-6 w-6 text-primary" />
          <span className="font-serif text-xl font-semibold">Boty Admin</span>
        </div>
        <nav className="space-y-1 p-4">
          {sidebarItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                item.active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6">
          <h1 className="text-xl font-semibold">Settings</h1>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </header>

        <div className="p-6 space-y-6 max-w-4xl">
          {/* Store Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Store Information
              </CardTitle>
              <CardDescription>
                Basic information about your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="store_name">Store Name</Label>
                  <Input
                    id="store_name"
                    value={settings.store_name}
                    onChange={(e) =>
                      setSettings({ ...settings, store_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store_email">Store Email</Label>
                  <Input
                    id="store_email"
                    type="email"
                    value={settings.store_email}
                    onChange={(e) =>
                      setSettings({ ...settings, store_email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="store_phone">Phone Number</Label>
                  <Input
                    id="store_phone"
                    value={settings.store_phone}
                    onChange={(e) =>
                      setSettings({ ...settings, store_phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store_address">Address</Label>
                  <Input
                    id="store_address"
                    value={settings.store_address}
                    onChange={(e) =>
                      setSettings({ ...settings, store_address: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Regional Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Regional Settings
              </CardTitle>
              <CardDescription>
                Currency and tax configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={settings.currency}
                    onChange={(e) =>
                      setSettings({ ...settings, currency: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.tax_rate}
                    onChange={(e) =>
                      setSettings({ ...settings, tax_rate: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive order and booking notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.enable_email_notifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enable_email_notifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive important alerts via SMS
                  </p>
                </div>
                <Switch
                  checked={settings.enable_sms_notifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enable_sms_notifications: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Checkout Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Checkout Settings
              </CardTitle>
              <CardDescription>
                Configure checkout behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Guest Checkout</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to checkout without an account
                  </p>
                </div>
                <Switch
                  checked={settings.enable_guest_checkout}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enable_guest_checkout: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Inventory Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Boxes className="h-5 w-5" />
                Inventory Settings
              </CardTitle>
              <CardDescription>
                Configure inventory management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="low_stock_threshold">Low Stock Alert Threshold</Label>
                <Input
                  id="low_stock_threshold"
                  type="number"
                  min="0"
                  value={settings.low_stock_threshold}
                  onChange={(e) =>
                    setSettings({ ...settings, low_stock_threshold: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Get alerts when product stock falls below this number
                </p>
              </div>
            </CardContent>
          </Card>

          {/* KRA eTIMS Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-red-600" />
                Kenya Revenue Authority (KRA) eTIMS Config
              </CardTitle>
              <CardDescription>
                Configure eTIMS values for tax invoice serialization and compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="etims_pin">Taxpayer PIN *</Label>
                  <Input
                    id="etims_pin"
                    value={settings.etims_pin}
                    onChange={(e) =>
                      setSettings({ ...settings, etims_pin: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="etims_device_id">eTIMS Device ID / Serial *</Label>
                  <Input
                    id="etims_device_id"
                    value={settings.etims_device_id}
                    onChange={(e) =>
                      setSettings({ ...settings, etims_device_id: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="etims_server_url">KRA API Server Endpoint URL</Label>
                <Input
                  id="etims_server_url"
                  value={settings.etims_server_url}
                  onChange={(e) =>
                    setSettings({ ...settings, etims_server_url: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* M-Pesa Payment Gateway Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-green-600" />
                Safaricom Daraja M-Pesa Integration
              </CardTitle>
              <CardDescription>
                Configure Daraja API keys for online checkout & STK push prompts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mpesa_shortcode">Business Shortcode (Till/Paybill) *</Label>
                  <Input
                    id="mpesa_shortcode"
                    value={settings.mpesa_shortcode}
                    onChange={(e) =>
                      setSettings({ ...settings, mpesa_shortcode: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mpesa_consumer_key">Daraja Consumer Key</Label>
                  <Input
                    id="mpesa_consumer_key"
                    type="password"
                    value={settings.mpesa_consumer_key}
                    onChange={(e) =>
                      setSettings({ ...settings, mpesa_consumer_key: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mpesa_consumer_secret">Daraja Consumer Secret</Label>
                  <Input
                    id="mpesa_consumer_secret"
                    type="password"
                    value={settings.mpesa_consumer_secret}
                    onChange={(e) =>
                      setSettings({ ...settings, mpesa_consumer_secret: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mpesa_passkey">M-Pesa Online Passkey</Label>
                  <Input
                    id="mpesa_passkey"
                    type="password"
                    value={settings.mpesa_passkey}
                    onChange={(e) =>
                      setSettings({ ...settings, mpesa_passkey: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Online POS Sync settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Boxes className="h-5 w-5 text-blue-600" />
                POS Sync & Online Inventory
              </CardTitle>
              <CardDescription>
                Sync real-time brick-and-mortar stock with online storefront
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Online Purchase of POS Products</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow online customers to purchase POS-cataloged products and sync local inventory
                  </p>
                </div>
                <Switch
                  checked={settings.enable_online_pos_purchase}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enable_online_pos_purchase: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Maintenance
              </CardTitle>
              <CardDescription>
                Security and site maintenance options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable the storefront for maintenance
                  </p>
                </div>
                <Switch
                  checked={settings.maintenance_mode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, maintenance_mode: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Admin Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                Admin Account
              </CardTitle>
              <CardDescription>
                Your admin account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{profile?.email || "Not logged in"}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Role</span>
                  <span className="font-medium capitalize">{profile?.role || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">
                    {profile?.first_name} {profile?.last_name}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
