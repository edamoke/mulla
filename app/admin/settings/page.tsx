"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Save,
  CreditCard,
  Boxes,
  Receipt,
  UserCircle,
  Store,
  Globe,
  Bell,
  Shield,
  Smartphone,
  Printer,
} from "lucide-react"

import { useRouter } from "next/navigation"

export default function AdminSettingsPage() {
  const router = useRouter()
  const { user, isAdmin, isLoading: authLoading, profile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth/login?redirect=/admin/settings")
      } else if (!isAdmin) {
        router.push("/")
      }
    }
  }, [user, isAdmin, authLoading, router])
  const [settings, setSettings] = useState({
    store_name: "Boty Luxury Boutique",
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
    etims_pin: "PIN_MULLA_TEST_2026",
    etims_device_id: "DEVICE_MULLA_TEST_2026",
    etims_server_url: "https://etims-api-test.kra.go.ke/v1",
    mpesa_shortcode: "174379",
    mpesa_consumer_key: "CON_KEY_MULLA_TEST",
    mpesa_consumer_secret: "CON_SEC_MULLA_TEST",
    mpesa_passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
    enable_online_pos_purchase: true,
    printer_paper_size: "80mm",
    printer_connection_type: "usb",
    printer_ip_address: "192.168.1.100",
    receipt_header_note: "Welcome to Boty Luxury Boutique!",
    receipt_footer_note: "Thank you for shopping with us! Compliant with KRA e-TIMS rules."
  })

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch('/api/admin/settings')
        const data = await response.json()
        if (data.success && data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }))
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
    loadSettings()
  }, [])

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

  // Sample items for live receipt calculations
  const sampleItems = [
    { name: "Boty Premium Jacket", qty: 1, price: 12000 },
    { name: "Luxury Heels Black", qty: 1, price: 8500 },
  ]
  const subtotal = sampleItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const taxRateVal = parseFloat(settings.tax_rate || "16")
  const vatableAmount = subtotal / (1 + taxRateVal / 100)
  const taxAmount = subtotal - vatableAmount

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="lg:ml-64 flex-1 overflow-auto">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
          <h1 className="text-xl font-semibold pl-12 lg:pl-0">Settings</h1>
          <Button onClick={handleSave} disabled={isLoading} size="sm" className="lg:size-default">
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </header>

        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {/* Main Layout Grid - 2 columns for Form settings, 1 column for live interactive preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Form Fields: Column 1 & 2 */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Store Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-primary" />
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
                    <Globe className="h-5 w-5 text-indigo-500" />
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

              {/* POS Printer Configuration */}
              <Card className="border-primary/40 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Printer className="h-5 w-5 text-primary" />
                    POS Thermal Printer Config
                  </CardTitle>
                  <CardDescription>
                    Configure physical thermal receipt printer behavior and layout
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="printer_paper_size">Paper Width Size</Label>
                      <select
                        id="printer_paper_size"
                        title="Printer Paper Size"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={settings.printer_paper_size}
                        onChange={(e) =>
                          setSettings({ ...settings, printer_paper_size: e.target.value })
                        }
                      >
                        <option value="80mm">80mm Standard Roll</option>
                        <option value="58mm">58mm Small Roll</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="printer_connection_type">Connection Interface</Label>
                      <select
                        id="printer_connection_type"
                        title="Printer Connection Type"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={settings.printer_connection_type}
                        onChange={(e) =>
                          setSettings({ ...settings, printer_connection_type: e.target.value })
                        }
                      >
                        <option value="usb">USB Port Direct</option>
                        <option value="network">Ethernet / Network IP</option>
                        <option value="bluetooth">Bluetooth Wireless</option>
                      </select>
                    </div>
                  </div>

                  {settings.printer_connection_type === "network" && (
                    <div className="space-y-2 animate-in fade-in duration-200">
                      <Label htmlFor="printer_ip_address">Printer Local IP Address</Label>
                      <Input
                        id="printer_ip_address"
                        placeholder="e.g. 192.168.1.100"
                        value={settings.printer_ip_address}
                        onChange={(e) =>
                          setSettings({ ...settings, printer_ip_address: e.target.value })
                        }
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="receipt_header_note">Receipt Custom Header Message</Label>
                    <Input
                      id="receipt_header_note"
                      placeholder="e.g. Welcome to Boty Luxury Boutique!"
                      value={settings.receipt_header_note}
                      onChange={(e) =>
                        setSettings({ ...settings, receipt_header_note: e.target.value })
                      }
                    />
                    <p className="text-xs text-muted-foreground">Centered at the top of printed receipts</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receipt_footer_note">Receipt Custom Footer Message</Label>
                    <Input
                      id="receipt_footer_note"
                      placeholder="e.g. Thank you for shopping with us!"
                      value={settings.receipt_footer_note}
                      onChange={(e) =>
                        setSettings({ ...settings, receipt_footer_note: e.target.value })
                      }
                    />
                    <p className="text-xs text-muted-foreground">Centered at the bottom of printed receipts</p>
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

            {/* Live Interactive Thermal Receipt Preview: Column 3 */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    <Printer className="w-5 h-5 text-primary" />
                    Live Receipt Preview
                  </h3>
                  <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-1 rounded-full capitalize">
                    {settings.printer_paper_size} layout
                  </span>
                </div>

                {/* Simulated Thermal Receipt */}
                <div className="flex justify-center bg-muted/60 p-4 rounded-xl border border-border/50 shadow-inner">
                  <div
                    className={`bg-white text-zinc-900 shadow-lg p-5 font-mono text-xs transition-all duration-300 relative border-t-8 border-dashed border-zinc-200`}
                    style={{
                      width: settings.printer_paper_size === "58mm" ? "250px" : "330px",
                    }}
                  >
                    {/* Top Serrated Tear Effect */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-300 border-b border-dashed border-white"></div>

                    {/* Receipt Header Content */}
                    <div className="text-center space-y-1 mb-4">
                      <h4 className="font-bold text-sm uppercase tracking-wider">{settings.store_name}</h4>
                      <p className="text-[10px] text-zinc-600">{settings.store_address}</p>
                      <p className="text-[10px] text-zinc-600">TEL: {settings.store_phone}</p>
                      {settings.receipt_header_note && (
                        <p className="text-[10px] text-zinc-500 italic mt-1 border-t border-dashed border-zinc-200 pt-1">
                          "{settings.receipt_header_note}"
                        </p>
                      )}
                    </div>

                    <div className="border-b border-dashed border-zinc-300 pb-2 mb-2">
                      <p className="text-[10px]">TX REF: POS-{Date.now().toString().slice(-6)}</p>
                      <p className="text-[10px]">DATE: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
                      <p className="text-[10px]">CASHIER: {profile?.first_name || "Admin"}</p>
                    </div>

                    {/* Receipt Items Table */}
                    <table className="w-full text-left border-collapse mb-4 text-[11px]">
                      <thead>
                        <tr className="border-b border-dashed border-zinc-300 text-zinc-600">
                          <th className="pb-1 font-bold">ITEM</th>
                          <th className="pb-1 text-center font-bold">QTY</th>
                          <th className="pb-1 text-right font-bold">TOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sampleItems.map((item, idx) => (
                          <tr key={idx} className="border-b border-zinc-100 last:border-0">
                            <td className="py-1 max-w-[130px] truncate">{item.name}</td>
                            <td className="py-1 text-center">{item.qty}</td>
                            <td className="py-1 text-right">
                              {(item.price * item.qty).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Totals Section */}
                    <div className="space-y-1 text-xs border-t border-dashed border-zinc-300 pt-2 mb-3">
                      <div className="flex justify-between">
                        <span>SUBTOTAL</span>
                        <span>{settings.currency} {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-zinc-600 text-[10px]">
                        <span>VATABLE ({settings.tax_rate}%)</span>
                        <span>{settings.currency} {vatableAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-zinc-600 text-[10px]">
                        <span>TAX/VAT ({settings.tax_rate}%)</span>
                        <span>{settings.currency} {taxAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm border-t border-dashed border-zinc-300 pt-1">
                        <span>TOTAL</span>
                        <span>{settings.currency} {subtotal.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* KRA e-TIMS Tax Compliance Block */}
                    <div className="bg-zinc-50 border border-zinc-200 rounded p-2 text-[9px] text-zinc-700 space-y-1 mb-4">
                      <div className="flex justify-between">
                        <span className="font-semibold text-zinc-800">KRA e-TIMS COMPLIANT</span>
                        <span className="text-[8px] bg-red-100 text-red-700 px-1 rounded">VERIFIED</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Taxpayer PIN:</span> <span className="font-mono">{settings.etims_pin}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Device ID:</span> <span className="font-mono">{settings.etims_device_id}</span>
                      </div>
                      <div className="truncate">
                        <span className="text-zinc-500">Invoice:</span> <span className="font-mono text-[8px]">eTIMS-KRA-{settings.etims_pin}-{settings.etims_device_id}-48501230</span>
                      </div>
                    </div>

                    {/* Dynamic Simulated Barcode / QR Compliance Code */}
                    <div className="flex flex-col items-center justify-center p-2 border border-dashed border-zinc-200 rounded bg-zinc-50 mb-4">
                      <div className="w-24 h-24 bg-zinc-800 flex items-center justify-center text-white relative">
                        {/* Fake QR matrix structure using grid */}
                        <div className="grid grid-cols-5 gap-0.5 w-16 h-16 bg-white p-1 text-black">
                          {[...Array(25)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-full h-full ${
                                (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 4 || i === 20 || i === 24
                                  ? "bg-zinc-900"
                                  : "bg-white"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-[7px] text-zinc-400 mt-1 uppercase tracking-widest font-sans">Scan to verify tax compliance</span>
                    </div>

                    {/* Receipt Footer Message */}
                    {settings.receipt_footer_note && (
                      <div className="text-center text-[10px] text-zinc-500 border-t border-dashed border-zinc-300 pt-2 pb-1 italic">
                        {settings.receipt_footer_note}
                      </div>
                    )}

                    <div className="text-center text-[8px] text-zinc-400 mt-2">
                      SYSTEM POWERED BY MULLA POS
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
                    <Printer className="w-3.5 h-3.5 text-primary" />
                    How to test physical printing:
                  </p>
                  <p>When you trigger printing from the POS terminal, the backend formats raw ESC/POS commands based on the width (80mm vs 58mm) and transmits them to your thermal printer via the chosen connection interface.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
