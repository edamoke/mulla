"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Package, Save, Plus } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import type { Category } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAdmin, isLoading: authLoading } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Category creation modal states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const [categoryDescription, setCategoryDescription] = useState("")
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryName.trim()) return

    setIsCreatingCategory(true)
    const supabase = createClient()
    const { data, error } = await supabase.from("categories").insert({
      name: categoryName,
      slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
      description: categoryDescription,
      sort_order: 1,
      is_active: true
    }).select().single()

    setIsCreatingCategory(false)
    if (!error && data) {
      setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setCategoryId(data.id)
      setIsCategoryDialogOpen(false)
      setCategoryName("")
      setCategoryDescription("")
      toast({
        title: "Success",
        description: "Category created and selected successfully!",
      })
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error creating category: " + (error?.message || "Unknown error"),
      })
    }
  }

  // Form states
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [price, setPrice] = useState("")
  const [compareAtPrice, setCompareAtPrice] = useState("")
  const [costPrice, setCostPrice] = useState("")
  const [sku, setSku] = useState("")
  const [barcode, setBarcode] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [sizes, setSizes] = useState("S, M, L, XL")
  const [colors, setColors] = useState("Sand, Coral, Navy")
  const [materials, setMaterials] = useState("")
  const [dimensions, setDimensions] = useState("")
  const [weight, setWeight] = useState("")
  const [stockQuantity, setStockQuantity] = useState("20")
  const [lowStockThreshold, setLowStockThreshold] = useState("5")
  const [trackInventory, setTrackInventory] = useState(true)
  const [allowBackorder, setAllowBackorder] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [badge, setBadge] = useState<"new" | "bestseller" | "sale" | "limited" | "">("new")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [imageUrl1, setImageUrl1] = useState("")
  const [imageUrl2, setImageUrl2] = useState("")

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth/login?redirect=/admin/products/new")
      } else if (!isAdmin) {
        router.push("/")
      }
    }
  }, [user, isAdmin, authLoading, router])

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true })

      if (!error && data) {
        setCategories(data)
        if (data.length > 0) {
          setCategoryId(data[0].id)
        }
      }
    }

    if (user && isAdmin) {
      fetchCategories()
    }
  }, [user, isAdmin])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    const supabase = createClient()

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")

    // Parse comma-separated arrays
    const parsedSizes = sizes
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    const parsedColors = colors
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c.length > 0)

    // Images array
    const imagesArray = [thumbnailUrl || "/placeholder.svg"]
    if (imageUrl1.trim()) imagesArray.push(imageUrl1.trim())
    if (imageUrl2.trim()) imagesArray.push(imageUrl2.trim())

    const productData = {
      name,
      slug,
      description: description || null,
      short_description: shortDescription || null,
      price: parseFloat(price) || 0,
      compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
      cost_price: costPrice ? parseFloat(costPrice) : null,
      sku: sku || null,
      barcode: barcode || null,
      category_id: categoryId || null,
      sizes: parsedSizes,
      colors: parsedColors,
      materials: materials || null,
      dimensions: dimensions || null,
      weight: weight ? parseFloat(weight) : null,
      stock_quantity: parseInt(stockQuantity) || 0,
      low_stock_threshold: parseInt(lowStockThreshold) || 5,
      track_inventory: trackInventory,
      allow_backorder: allowBackorder,
      is_featured: isFeatured,
      is_active: isActive,
      badge: badge || null,
      thumbnail_url: thumbnailUrl || "/placeholder.svg",
      images: imagesArray,
    }

    const { error } = await supabase.from("products").insert(productData)

    setIsSubmitting(false)

    if (!error) {
      toast({
        title: "Success",
        description: "Product created successfully!",
      })
      router.push("/admin/products")
    } else {
      console.error("Error creating product:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create product: " + error.message,
      })
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
    <div className="min-h-screen bg-muted/30 pb-16">
      <div className="max-w-4xl mx-auto px-6 pt-10">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground boty-transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-6">
          <div>
            <h1 className="font-serif text-3xl text-foreground flex items-center gap-2">
              <Package className="w-8 h-8 text-primary" />
              Add New Product
            </h1>
            <p className="text-muted-foreground mt-1">
              Publish a new piece to your coastal boutique collections
            </p>
          </div>
        </div>

        {/* Product Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Information */}
          <div className="bg-card border border-border/50 rounded-xl p-6 md:p-8 space-y-6">
            <h3 className="font-serif text-xl border-b border-border/40 pb-3">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="product-name">Product Name *</Label>
                <Input
                  id="product-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Malindi Linen Maxi Dress"
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="short-desc">Short Description</Label>
                <Input
                  id="short-desc"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="e.g., An elegant linen dress perfect for beachfront sunsets."
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Full Description</Label>
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide full description of materials, fit, care instructions etc."
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="category">Category *</Label>
                  <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-xs text-primary flex items-center gap-1 hover:no-underline"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Category
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Category</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateCategory} className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-category-name">Name</Label>
                          <Input
                            id="new-category-name"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            placeholder="e.g., Furniture"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-category-desc">Description</Label>
                          <Input
                            id="new-category-desc"
                            value={categoryDescription}
                            onChange={(e) => setCategoryDescription(e.target.value)}
                            placeholder="e.g., Premium local furniture"
                          />
                        </div>
                        <DialogFooter className="pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCategoryDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isCreatingCategory}>
                            {isCreatingCategory ? "Creating..." : "Create Category"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                {categories.length === 0 ? (
                  <div className="text-xs text-amber-600 mt-1">
                    No categories found. Click Add Category to create one.
                  </div>
                ) : (
                  <select
                    id="category"
                    aria-label="Product Category"
                    title="Select Category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="text-foreground bg-card">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="badge">Badge</Label>
                <select
                  id="badge"
                  aria-label="Product Badge"
                  title="Select Badge"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value as any)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="" className="text-foreground bg-card">None</option>
                  <option value="new" className="text-foreground bg-card">New</option>
                  <option value="bestseller" className="text-foreground bg-card">Bestseller</option>
                  <option value="sale" className="text-foreground bg-card">Sale</option>
                  <option value="limited" className="text-foreground bg-card">Limited</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Inventory */}
          <div className="bg-card border border-border/50 rounded-xl p-6 md:p-8 space-y-6">
            <h3 className="font-serif text-xl border-b border-border/40 pb-3">Pricing & Inventory</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Retail Price (KES) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g., 4500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="compare-price">Compare-at Price (KES)</Label>
                <Input
                  id="compare-price"
                  type="number"
                  step="0.01"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  placeholder="e.g., 5500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost-price">Cost Price (KES)</Label>
                <Input
                  id="cost-price"
                  type="number"
                  step="0.01"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="e.g., 2000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g., MULL-DRS-LNN-01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Initial Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder="20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="low-stock">Low Stock Warning Threshold</Label>
                <Input
                  id="low-stock"
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  placeholder="5"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="track-inventory"
                  checked={trackInventory}
                  onCheckedChange={(checked) => setTrackInventory(checked === true)}
                />
                <Label htmlFor="track-inventory" className="text-sm font-normal cursor-pointer select-none">
                  Track stock quantity for this product
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allow-backorder"
                  checked={allowBackorder}
                  onCheckedChange={(checked) => setAllowBackorder(checked === true)}
                />
                <Label htmlFor="allow-backorder" className="text-sm font-normal cursor-pointer select-none">
                  Allow customers to purchase when out of stock
                </Label>
              </div>
            </div>
          </div>

          {/* Section 3: Specs & Attributes */}
          <div className="bg-card border border-border/50 rounded-xl p-6 md:p-8 space-y-6">
            <h3 className="font-serif text-xl border-b border-border/40 pb-3">Specs, Sizes & Variants</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sizes">Available Sizes (comma separated)</Label>
                <Input
                  id="sizes"
                  value={sizes}
                  onChange={(e) => setSizes(e.target.value)}
                  placeholder="e.g., S, M, L, XL"
                />
                <p className="text-xs text-muted-foreground">Leave empty if product does not have sizes</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="colors">Available Colors (comma separated)</Label>
                <Input
                  id="colors"
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                  placeholder="e.g., Ocean Blue, Sand Beige, Pearl White"
                />
                <p className="text-xs text-muted-foreground">Leave empty if product does not have colors</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="materials">Materials</Label>
                <Input
                  id="materials"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  placeholder="e.g., 100% Organic Cotton Linen Blend"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensions / Fit Specifications</Label>
                <Input
                  id="dimensions"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="e.g., Semi-relaxed fit, 120cm length"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Imagery */}
          <div className="bg-card border border-border/50 rounded-xl p-6 md:p-8 space-y-6">
            <h3 className="font-serif text-xl border-b border-border/40 pb-3">Product Images</h3>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail / Primary Image URL *</Label>
                <Input
                  id="thumbnail"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="e.g., /images/products/dress-main.jpg"
                />
                <p className="text-xs text-muted-foreground">Can be a local path or a remote URL link</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="img1">Additional Image URL 1</Label>
                  <Input
                    id="img1"
                    value={imageUrl1}
                    onChange={(e) => setImageUrl1(e.target.value)}
                    placeholder="/images/products/dress-detail-1.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="img2">Additional Image URL 2</Label>
                  <Input
                    id="img2"
                    value={imageUrl2}
                    onChange={(e) => setImageUrl2(e.target.value)}
                    placeholder="/images/products/dress-detail-2.jpg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Visibility */}
          <div className="bg-card border border-border/50 rounded-xl p-6 md:p-8 space-y-6">
            <h3 className="font-serif text-xl border-b border-border/40 pb-3">Catalog Visibility</h3>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-active"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked === true)}
                />
                <Label htmlFor="is-active" className="text-sm font-normal cursor-pointer select-none">
                  Publish product to storefront immediately (Active)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-featured"
                  checked={isFeatured}
                  onCheckedChange={(checked) => setIsFeatured(checked === true)}
                />
                <Label htmlFor="is-featured" className="text-sm font-normal cursor-pointer select-none">
                  Display in featured home recommendations
                </Label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 border-t border-border/50 pt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/products")}
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
