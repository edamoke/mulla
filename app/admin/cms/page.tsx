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
import { AdminSidebar } from "@/components/admin/sidebar"

export default function AdminCMSPage() {
  const router = useRouter()
  const { user, isAdmin, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"branding" | "home" | "shop" | "apartments">("branding")
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


  // Branding change helper
  const handleBrandingChange = (key: keyof typeof cmsData.branding, value: string) => {
    setCmsData(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        [key]: value
      }
    }))
  }

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
  const handleAddBadge = () => {
    setCmsData(prev => ({
      ...prev,
      home: {
        ...prev.home,
        trust_badges: [
          ...prev.home.trust_badges,
          { icon: "", title: "", description: "" } // Default new badge
        ]
      }
    }))
  }

  const handleDeleteBadge = (index: number) => {
    setCmsData(prev => ({
      ...prev,
      home: {
        ...prev.home,
        trust_badges: prev.home.trust_badges.filter((_, i) => i !== index)
      }
    }))
  }

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

  // Product Grid change helper
  const handleProductGridChange = (key: 'badge' | 'title' | 'description', value: string) => {
    setCmsData(prev => ({
      ...prev,
      home: {
        ...prev.home,
        product_grid: {
          ...prev.home.product_grid,
          [key]: value
        }
      }
    }))
  }

  // Feature Section change helper
  const handleFeatureSectionChange = (key: string, value: any) => {
    setCmsData(prev => ({
      ...prev,
      home: {
        ...prev.home,
        feature_section: {
          ...prev.home.feature_section,
          [key]: value
        }
      }
    }))
  }

  // Why Feature Change helper
  const handleAddWhyFeature = () => {
    setCmsData(prev => ({
      ...prev,
      home: {
        ...prev.home,
        feature_section: {
          ...prev.home.feature_section,
          why_features: [
            ...prev.home.feature_section.why_features,
            { icon: "", title: "", description: "" } // Default new feature
          ]
        }
      }
    }))
  }

  const handleDeleteWhyFeature = (index: number) => {
    setCmsData(prev => ({
      ...prev,
      home: {
        ...prev.home,
        feature_section: {
          ...prev.home.feature_section,
          why_features: prev.home.feature_section.why_features.filter((_, i) => i !== index)
        }
      }
    }))
  }

  const handleWhyFeatureChange = (index: number, key: 'icon' | 'title' | 'description', value: string) => {
    setCmsData(prev => {
      const updatedFeatures = [...prev.home.feature_section.why_features]
      updatedFeatures[index] = {
        ...updatedFeatures[index],
        [key]: value
      }
      return {
        ...prev,
        home: {
          ...prev.home,
          feature_section: {
            ...prev.home.feature_section,
            why_features: updatedFeatures
          }
        }
      }
    })
  }

  // Testimonials section change helper
  const handleTestimonialSectionChange = (key: 'badge' | 'title', value: string) => {
    setCmsData(prev => ({
      ...prev,
      home: {
        ...prev.home,
        testimonials: {
          ...prev.home.testimonials,
          [key]: value
        }
      }
    }))
  }

  // Testimonial Item change helper
  const handleAddTestimonial = () => {
    setCmsData(prev => ({
      ...prev,
      home: {
        ...prev.home,
        testimonials: {
          ...prev.home.testimonials,
          items: [
            ...prev.home.testimonials.items,
            { id: Date.now(), name: "", location: "", rating: 5, text: "", product: "" } // Default new testimonial
          ]
        }
      }
    }))
  }

  const handleDeleteTestimonial = (index: number) => {
    setCmsData(prev => ({
      ...prev,
      home: {
        ...prev.home,
        testimonials: {
          ...prev.home.testimonials,
          items: prev.home.testimonials.items.filter((_, i) => i !== index)
        }
      }
    }))
  }

  const handleTestimonialItemChange = (index: number, key: string, value: any) => {
    setCmsData(prev => {
      const updatedItems = [...prev.home.testimonials.items]
      updatedItems[index] = {
        ...updatedItems[index],
        [key]: value
      }
      return {
        ...prev,
        home: {
          ...prev.home,
          testimonials: {
            ...prev.home.testimonials,
            items: updatedItems
          }
        }
      }
    })
  }

  // Newsletter change helper
  const handleNewsletterChange = (key: 'title' | 'description' | 'disclaimer', value: string) => {
    setCmsData(prev => ({
      ...prev,
      home: {
        ...prev.home,
        newsletter: {
          ...prev.home.newsletter,
          [key]: value
        }
      }
    }))
  }

  // Footer change helper
  const handleFooterChange = (key: 'description', value: string) => {
    setCmsData(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        [key]: value
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
      <AdminSidebar />

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
              onClick={() => setActiveTab("branding")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === "branding"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Site Branding
            </button>
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

          {activeTab === "branding" && (
            <Card>
              <CardHeader>
                <CardTitle>Site Branding Settings</CardTitle>
                <CardDescription>
                  Configure your website's main logo, favicon/site icon, and display options.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="branding-logo-text">Logo Text</Label>
                    <Input
                      id="branding-logo-text"
                      value={cmsData.branding?.logo_text || ""}
                      onChange={(e) => handleBrandingChange('logo_text', e.target.value)}
                      placeholder="e.g. Mulla"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branding-logo-type">Logo Type</Label>
                    <select
                      id="branding-logo-type"
                      title="Logo Type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={cmsData.branding?.logo_type || "text"}
                      onChange={(e) => handleBrandingChange('logo_type', e.target.value)}
                    >
                      <option value="text">Text Logo</option>
                      <option value="image">Image Logo</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="branding-logo-image">Logo Image URL / Path</Label>
                    <Input
                      id="branding-logo-image"
                      value={cmsData.branding?.logo_image || ""}
                      onChange={(e) => handleBrandingChange('logo_image', e.target.value)}
                      placeholder="e.g. /placeholder-logo.png"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branding-site-icon">Site Icon (Favicon) URL / Path</Label>
                    <Input
                      id="branding-site-icon"
                      value={cmsData.branding?.site_icon || ""}
                      onChange={(e) => handleBrandingChange('site_icon', e.target.value)}
                      placeholder="e.g. /icon.svg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                      onChange={(e) => handleHeroChange("video_url", e.target.value)}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleHeroChange("video_url", "")}
                      >
                        Clear Video
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleHeroChange(
                            "video_url",
                            DEFAULT_CMS.home.hero.video_url
                          )
                        }
                      >
                        Restore Default
                      </Button>
                    </div>
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
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleDeleteBadge(idx)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleAddBadge} className="w-full">
                    Add New Trust Badge
                  </Button>
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
                      onChange={(e) => handleCTAChange("bg_image", e.target.value)}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCTAChange("bg_image", "")}
                      >
                        Clear Image
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleCTAChange(
                            "bg_image",
                            DEFAULT_CMS.home.cta_banner.bg_image
                          )
                        }
                      >
                        Restore Default
                      </Button>
                    </div>
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

              {/* Product Grid Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Curated Collections Section</CardTitle>
                  <CardDescription>
                    The curated collections product grid headers on the homepage.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prod-badge">Category Badge</Label>
                      <Input
                        id="prod-badge"
                        value={cmsData.home.product_grid?.badge || ""}
                        onChange={(e) => handleProductGridChange('badge', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prod-title">Section Title</Label>
                      <Input
                        id="prod-title"
                        value={cmsData.home.product_grid?.title || ""}
                        onChange={(e) => handleProductGridChange('title', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prod-desc">Section Description</Label>
                    <Textarea
                      id="prod-desc"
                      rows={2}
                      value={cmsData.home.product_grid?.description || ""}
                      onChange={(e) => handleProductGridChange('description', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Feature Section (Bento Grid & Why Mulla) */}
              <Card>
                <CardHeader>
                  <CardTitle>Bento & Feature Section</CardTitle>
                  <CardDescription>
                    Customize the bento layout items and the 'Why Mulla' section.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Bento Left Block */}
                  <div className="p-4 border rounded-xl space-y-3 bg-muted/10">
                    <h4 className="font-semibold text-sm">Bento Left Card (Large Video block)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Overlay Title Part 1 (bold)</Label>
                        <Input
                          value={cmsData.home.feature_section?.bento_left_title_1 || ""}
                          onChange={(e) => handleFeatureSectionChange('bento_left_title_1', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Overlay Title Part 2</Label>
                        <Input
                          value={cmsData.home.feature_section?.bento_left_title_2 || ""}
                          onChange={(e) => handleFeatureSectionChange('bento_left_title_2', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Overlay Description</Label>
                      <Input
                        value={cmsData.home.feature_section?.bento_left_desc || ""}
                        onChange={(e) => handleFeatureSectionChange('bento_left_desc', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Video URL</Label>
                      <Input
                        value={cmsData.home.feature_section?.bento_left_video || ""}
                        onChange={(e) => handleFeatureSectionChange("bento_left_video", e.target.value)}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFeatureSectionChange("bento_left_video", "")}
                        >
                          Clear Video
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleFeatureSectionChange(
                              "bento_left_video",
                              DEFAULT_CMS.home.feature_section.bento_left_video
                            )
                          }
                        >
                          Restore Default
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Bento Top Right Block */}
                  <div className="p-4 border rounded-xl space-y-3 bg-muted/10">
                    <h4 className="font-semibold text-sm">Bento Top Right Card (Luxury Lifestyle)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Card Title</Label>
                        <Input
                          value={cmsData.home.feature_section?.bento_right_top_title || ""}
                          onChange={(e) => handleFeatureSectionChange('bento_right_top_title', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Card Subtitle</Label>
                        <Input
                          value={cmsData.home.feature_section?.bento_right_top_subtitle || ""}
                          onChange={(e) => handleFeatureSectionChange('bento_right_top_subtitle', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Background Image URL</Label>
                      <Input
                        value={cmsData.home.feature_section?.bento_right_top_bg || ""}
                        onChange={(e) => handleFeatureSectionChange("bento_right_top_bg", e.target.value)}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFeatureSectionChange("bento_right_top_bg", "")}
                        >
                          Clear Image
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleFeatureSectionChange(
                              "bento_right_top_bg",
                              DEFAULT_CMS.home.feature_section.bento_right_top_bg
                            )
                          }
                        >
                          Restore Default
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Bullet #1</Label>
                        <Input
                          value={cmsData.home.feature_section?.bento_right_top_bullet1 || ""}
                          onChange={(e) => handleFeatureSectionChange('bento_right_top_bullet1', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Bullet #2</Label>
                        <Input
                          value={cmsData.home.feature_section?.bento_right_top_bullet2 || ""}
                          onChange={(e) => handleFeatureSectionChange('bento_right_top_bullet2', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Bullet #3</Label>
                        <Input
                          value={cmsData.home.feature_section?.bento_right_top_bullet3 || ""}
                          onChange={(e) => handleFeatureSectionChange('bento_right_top_bullet3', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bento Bottom Right Block */}
                  <div className="p-4 border rounded-xl space-y-3 bg-muted/10">
                    <h4 className="font-semibold text-sm">Bento Bottom Right Card (Authentic Guaranteed)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={cmsData.home.feature_section?.bento_right_bottom_title || ""}
                          onChange={(e) => handleFeatureSectionChange('bento_right_bottom_title', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Subtitle</Label>
                        <Input
                          value={cmsData.home.feature_section?.bento_right_bottom_subtitle || ""}
                          onChange={(e) => handleFeatureSectionChange('bento_right_bottom_subtitle', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Video URL</Label>
                      <Input
                        value={cmsData.home.feature_section?.bento_right_bottom_video || ""}
                        onChange={(e) => handleFeatureSectionChange("bento_right_bottom_video", e.target.value)}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFeatureSectionChange("bento_right_bottom_video", "")}
                        >
                          Clear Video
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleFeatureSectionChange(
                              "bento_right_bottom_video",
                              DEFAULT_CMS.home.feature_section.bento_right_bottom_video
                            )
                          }
                        >
                          Restore Default
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Why Mulla Details */}
                  <div className="p-4 border rounded-xl space-y-3 bg-muted/10">
                    <h4 className="font-semibold text-sm">Why Mulla ("Style that speaks") Headers</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Section Badge</Label>
                        <Input
                          value={cmsData.home.feature_section?.why_badge || ""}
                          onChange={(e) => handleFeatureSectionChange('why_badge', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Section Title</Label>
                        <Input
                          value={cmsData.home.feature_section?.why_title || ""}
                          onChange={(e) => handleFeatureSectionChange('why_title', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Section Description</Label>
                      <Textarea
                        rows={2}
                        value={cmsData.home.feature_section?.why_description || ""}
                        onChange={(e) => handleFeatureSectionChange('why_description', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Showcase Video URL</Label>
                      <Input
                        value={cmsData.home.feature_section?.why_video || ""}
                        onChange={(e) => handleFeatureSectionChange("why_video", e.target.value)}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFeatureSectionChange("why_video", "")}
                        >
                          Clear Video
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleFeatureSectionChange(
                              "why_video",
                              DEFAULT_CMS.home.feature_section.why_video
                            )
                          }
                        >
                          Restore Default
                        </Button>
                      </div>
                    </div>

                    {/* Features cards list */}
                    <div className="pt-4 space-y-3">
                      <h5 className="font-semibold text-xs uppercase tracking-wider">Features Sub-Cards (Why Mulla Grid)</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(cmsData.home.feature_section?.why_features || []).map((feat, idx) => (
                          <div key={idx} className="p-3 border rounded-lg bg-card space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold">Feature #{idx + 1}</span>
                              <span className="text-xs font-mono text-muted-foreground bg-stone-100 px-1.5 py-0.5 rounded">Icon: {feat.icon}</span>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Title</Label>
                              <Input
                                className="h-8 text-sm"
                                value={feat.title || ""}
                                onChange={(e) => handleWhyFeatureChange(idx, "title", e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Description</Label>
                              <Input
                                className="h-8 text-sm"
                                value={feat.description || ""}
                                onChange={(e) => handleWhyFeatureChange(idx, "description", e.target.value)}
                              />
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                              <Button variant="outline" size="sm" onClick={() => handleDeleteWhyFeature(idx)}>
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button onClick={handleAddWhyFeature} className="w-full mt-4">
                        Add New Why Feature
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonials (Client Stories) */}
              <Card>
                <CardHeader>
                  <CardTitle>Client Stories (Testimonials)</CardTitle>
                  <CardDescription>
                    Edit section headers and individual customer testimonial cards.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="test-badge">Section Badge</Label>
                      <Input
                        id="test-badge"
                        value={cmsData.home.testimonials?.badge || ""}
                        onChange={(e) => handleTestimonialSectionChange('badge', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="test-title">Section Title</Label>
                      <Input
                        id="test-title"
                        value={cmsData.home.testimonials?.title || ""}
                        onChange={(e) => handleTestimonialSectionChange('title', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="pt-4 space-y-4 border-t">
                    <h4 className="font-semibold text-sm">Testimonials Cards List</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(cmsData.home.testimonials?.items || []).map((item, idx) => (
                        <div key={idx} className="p-4 border rounded-xl bg-muted/10 space-y-2">
                          <div className="flex justify-between items-center border-b pb-1">
                            <span className="font-bold text-xs">Card #{idx + 1}</span>
                            <span className="text-xs bg-stone-100 px-1.5 py-0.5 rounded text-muted-foreground font-mono">Product: {item.product}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Name</Label>
                              <Input
                                className="h-8 text-xs"
                                value={item.name || ""}
                                onChange={(e) => handleTestimonialItemChange(idx, "name", e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Location</Label>
                              <Input
                                className="h-8 text-xs"
                                value={item.location || ""}
                                onChange={(e) => handleTestimonialItemChange(idx, "location", e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1 col-span-2">
                              <Label className="text-xs">Product Tag</Label>
                              <Input
                                className="h-8 text-xs"
                                value={item.product || ""}
                                onChange={(e) => handleTestimonialItemChange(idx, "product", e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Review Comment Text</Label>
                            <Textarea
                              className="text-xs"
                              rows={2}
                              value={item.text || ""}
                              onChange={(e) => handleTestimonialItemChange(idx, "text", e.target.value)}
                            />
                          </div>
                          <div className="flex justify-end gap-2 mt-2">
                            <Button variant="outline" size="sm" onClick={() => handleDeleteTestimonial(idx)}>
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button onClick={handleAddTestimonial} className="w-full mt-4">
                      Add New Testimonial
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Newsletter ("Join the experience")</CardTitle>
                  <CardDescription>
                    The email signup call-to-action block at the bottom of the homepage.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="news-title">CTA Title</Label>
                      <Input
                        id="news-title"
                        value={cmsData.home.newsletter?.title || ""}
                        onChange={(e) => handleNewsletterChange('title', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="news-disclaimer">Disclaimer Notice</Label>
                      <Input
                        id="news-disclaimer"
                        value={cmsData.home.newsletter?.disclaimer || ""}
                        onChange={(e) => handleNewsletterChange('disclaimer', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="news-desc">CTA Description / Subtitle</Label>
                    <Textarea
                      id="news-desc"
                      rows={2}
                      value={cmsData.home.newsletter?.description || ""}
                      onChange={(e) => handleNewsletterChange('description', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Footer Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Footer Information</CardTitle>
                  <CardDescription>
                    The general boutique descriptive info in the website's footer.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="foot-desc">Footer Brand Description</Label>
                    <Textarea
                      id="foot-desc"
                      rows={3}
                      value={cmsData.footer?.description || ""}
                      onChange={(e) => handleFooterChange('description', e.target.value)}
                    />
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
