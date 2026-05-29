"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  FileText,
  BadgeAlert,
  HelpCircle,
} from "lucide-react"
import { DEFAULT_CMS, CMSData } from "@/lib/cms-store"
import { useRouter } from "next/navigation"

export default function AdminCMSPage() {
  const router = useRouter()
  const { user, isAdmin, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"home" | "shop" | "apartments">("home")
  const [cmsData, setCmsData] = useState<CMSData>(DEFAULT_CMS)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth/login?redirect=/admin/cms")
      } else if (!isAdmin) {
        router.push("/")
      }
    }
  }, [user, isAdmin, authLoading, router])

  useEffect(() => {
    async function loadCMSData() {
      try {
        const response = await fetch('/api/admin/cms')
        const data = await response.json()
        if (data.success && data.cms) {
          setCmsData(data.cms)
        }
      } catch (error) {
        console.error('Failed to load CMS data:', error)
      }
    }
    loadCMSData()
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cmsData)
      })
      const data = await response.json()
      if (data.success) {
        alert("CMS content saved successfully!")
      } else {
        alert("Failed to save CMS content.")
      }
    } catch (error) {
      console.error('Failed to save CMS settings:', error)
      alert("Failed to save CMS settings.")
    } finally {
      setIsLoading(false)
    }
  }

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
    { icon: FileText, label: "CMS", href: "/admin/cms", active: true },
    { icon: Settings, label: "Settings", href: "/admin/settings", active: false },
  ]

  // Hero change helpers
  const handleHeroChange = (key: keyof typeof cmsData.home.hero, value: string) => {
    setCmsData(prev => ({
      ...prev,
      home: {
        ...prev.home,
        hero: {
          ...prev.home.hero,
          [key]: value
        }
      }
    }))
  }

  // CTA Banner change helpers
  const handleCTAChange = (key: keyof typeof cmsData.home.cta_banner, value: string) => {
    setCmsData(prev => ({
      ...prev,
      home: {
        ...prev.home,
        cta_banner: {
          ...prev.home.cta_banner,
          [key]: value
        }
      }
    }))
  }

  // Trust badge change helper
  const handleBadgeChange = (index: number, key: 'title' | 'description' | 'icon', value: string) => {
    setCmsData(prev => {
      const updatedBadges = [...prev.home.trust_badges]
      updatedBadges[index] = {
        ...updatedBadges[index],
        [key]: value
      }
      return {
        ...prev,
        home: {
          ...prev.home,
          trust_badges: updatedBadges
        }
      }
    })
  }

  // Shop change helper
  const handleShopHeaderChange = (key: 'title' | 'subtitle', value: string) => {
    setCmsData(prev => ({
      ...prev,
      shop: {
        ...prev.shop,
        header: {
          ...prev.shop.header,
          [key]: value
        }
      }
    }))
  }

  // Apartments change helper
  const handleApartmentsHeaderChange = (key: 'title' | 'subtitle', value: string) => {
    setCmsData(prev => ({
      ...prev,
      apartments: {
        ...prev.apartments,
        header: {
          ...prev.apartments.header,
          [key]: value
        }
      }
    }))
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border/50 z-50 hidden lg:block">
        <div className="p-6">
          <Link href="/" className="font-serif text-2xl text-foreground font-semibold">
            Mulla
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Admin Dashboard</p>
        </div>
        <nav className="px-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium boty-transition ${
                item.active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 flex-1 overflow-auto">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">CMS & Content Management</h1>
          </div>
          <Button onClick={handleSave} disabled={isLoading} className="gap-2">
            <Save className="h-4 w-4" />
            {isLoading ? "Saving..." : "Save Content"}
          </Button>
        </header>

        <div className="p-6 space-y-6 max-w-5xl">
          {/* Quick info alert */}
          <div className="flex items-start gap-4 p-4 rounded-xl border border-stone-200 bg-amber-50/40 text-stone-800">
            <HelpCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Dynamic Content Management</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Customize layout elements, headings, subtitles, bullets, badges, and videos across home, shop, and apartments pages. Changes show up instantly on the frontend.
              </p>
            </div>
          </div>

          {/* Page Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("home")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === "home"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Homepage Content
            </button>
            <button
              onClick={() => setActiveTab("shop")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === "shop"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Shop Page Header
            </button>
            <button
              onClick={() => setActiveTab("apartments")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === "apartments"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Apartments Page Header
            </button>
          </div>

          {activeTab === "home" && (
            <div className="space-y-6">
              {/* Hero Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Hero Section</CardTitle>
                  <CardDescription>
                    The main header and video intro banner on the homepage.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hero-subtitle">Subtitle Tagline</Label>
                      <Input
                        id="hero-subtitle"
                        value={cmsData.home.hero.subtitle}
                        onChange={(e) => handleHeroChange('subtitle', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero-btn">Button Text</Label>
                      <Input
                        id="hero-btn"
                        value={cmsData.home.hero.button_text}
                        onChange={(e) => handleHeroChange('button_text', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hero-t1">Title Line 1</Label>
                      <Input
                        id="hero-t1"
                        value={cmsData.home.hero.title_line1}
                        onChange={(e) => handleHeroChange('title_line1', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero-t2">Title Line 2</Label>
                      <Input
                        id="hero-t2"
                        value={cmsData.home.hero.title_line2}
                        onChange={(e) => handleHeroChange('title_line2', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hero-desc">Hero Description</Label>
                    <Textarea
                      id="hero-desc"
                      rows={3}
                      value={cmsData.home.hero.description}
                      onChange={(e) => handleHeroChange('description', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hero-video">Video URL (mp4)</Label>
                    <Input
                      id="hero-video"
                      value={cmsData.home.hero.video_url}
                      onChange={(e) => handleHeroChange('video_url', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <Card>
                <CardHeader>
                  <CardTitle>Trust Badges</CardTitle>
                  <CardDescription>
                    The grid of 4 badges highlighting key value propositions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cmsData.home.trust_badges.map((badge, idx) => (
                      <div key={idx} className="p-4 border rounded-xl space-y-3 bg-muted/20">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-sm">Badge #{idx + 1}</span>
                          <span className="text-xs text-muted-foreground uppercase tracking-widest bg-stone-100 px-2 py-0.5 rounded font-mono">
                            Icon: {badge.icon}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <Label>Badge Title</Label>
                          <Input
                            value={badge.title}
                            onChange={(e) => handleBadgeChange(idx, 'title', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Badge Description</Label>
                          <Input
                            value={badge.description}
                            onChange={(e) => handleBadgeChange(idx, 'description', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* CTA Banner */}
              <Card>
                <CardHeader>
                  <CardTitle>CTA Banner Section</CardTitle>
                  <CardDescription>
                    The large graphical CTA banner displaying coastal style highlights.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cta-t">Banner Header Line 1</Label>
                      <Input
                        id="cta-t"
                        value={cmsData.home.cta_banner.title}
                        onChange={(e) => handleCTAChange('title', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cta-sub">Banner Header Line 2</Label>
                      <Input
                        id="cta-sub"
                        value={cmsData.home.cta_banner.subtitle}
                        onChange={(e) => handleCTAChange('subtitle', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cta-image">Background Image Path/URL</Label>
                    <Input
                      id="cta-image"
                      value={cmsData.home.cta_banner.bg_image}
                      onChange={(e) => handleCTAChange('bg_image', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bullet1">Bullet Item #1</Label>
                      <Input
                        id="bullet1"
                        value={cmsData.home.cta_banner.bullet1}
                        onChange={(e) => handleCTAChange('bullet1', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bullet2">Bullet Item #2</Label>
                      <Input
                        id="bullet2"
                        value={cmsData.home.cta_banner.bullet2}
                        onChange={(e) => handleCTAChange('bullet2', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bullet3">Bullet Item #3</Label>
                      <Input
                        id="bullet3"
                        value={cmsData.home.cta_banner.bullet3}
                        onChange={(e) => handleCTAChange('bullet3', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "shop" && (
            <Card>
              <CardHeader>
                <CardTitle>Shop Page Header</CardTitle>
                <CardDescription>
                  Modify the main title and introduction shown on the Shop landing page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shop-t">Page Header Title</Label>
                  <Input
                    id="shop-t"
                    value={cmsData.shop.header.title}
                    onChange={(e) => handleShopHeaderChange('title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shop-sub">Page Header Subtitle</Label>
                  <Input
                    id="shop-sub"
                    value={cmsData.shop.header.subtitle}
                    onChange={(e) => handleShopHeaderChange('subtitle', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "apartments" && (
            <Card>
              <CardHeader>
                <CardTitle>Apartments Page Header</CardTitle>
                <CardDescription>
                  Modify the main title and introduction shown on the Apartments rental page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apt-t">Page Header Title</Label>
                  <Input
                    id="apt-t"
                    value={cmsData.apartments.header.title}
                    onChange={(e) => handleApartmentsHeaderChange('title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apt-sub">Page Header Subtitle</Label>
                  <Input
                    id="apt-sub"
                    value={cmsData.apartments.header.subtitle}
                    onChange={(e) => handleApartmentsHeaderChange('subtitle', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
