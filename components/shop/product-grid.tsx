"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, SlidersHorizontal, X } from "lucide-react"
import type { Product, Category } from "@/lib/types"
import { useCart } from "@/components/boty/cart-context"

interface ProductGridProps {
  initialProducts: Product[]
  categories: Category[]
  selectedCategory?: string
}

export function ProductGrid({ initialProducts, categories, selectedCategory: initialCategory }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "all")
  const [showFilters, setShowFilters] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [products, setProducts] = useState(initialProducts)
  const [isLoading, setIsLoading] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  const categoryOptions = [
    { slug: "all", name: "All" },
    ...categories.map(c => ({ slug: c.slug, name: c.name }))
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (gridRef.current) {
      observer.observe(gridRef.current)
    }

    return () => {
      if (gridRef.current) {
        observer.unobserve(gridRef.current)
      }
    }
  }, [])

  // Fetch products when category changes
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      setIsVisible(false)
      
      try {
        const url = selectedCategory === "all" 
          ? '/api/products' 
          : `/api/products?category=${selectedCategory}`
        const res = await fetch(url)
        const data = await res.json()
        setProducts(data.data || [])
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setIsLoading(false)
        setTimeout(() => setIsVisible(true), 50)
      }
    }

    // Only fetch if category changed from initial
    if (selectedCategory !== initialCategory) {
      fetchProducts()
    } else {
      setTimeout(() => setIsVisible(true), 50)
    }
  }, [selectedCategory, initialCategory])

  return (
    <>
      {/* Filter Bar */}
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-border/50">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden inline-flex items-center gap-2 text-sm text-foreground"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>

        {/* Desktop Categories */}
        <div className="hidden lg:flex items-center gap-2">
          {categoryOptions.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => setSelectedCategory(category.slug)}
              className={`px-4 py-2 rounded-full text-sm capitalize boty-transition bg-popover ${
                selectedCategory === category.slug
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground/70 hover:text-foreground boty-shadow"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <span className="text-sm text-muted-foreground">
          {products.length} {products.length === 1 ? "product" : "products"}
        </span>
      </div>

      {/* Mobile Filters */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl text-foreground">Filters</h2>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="p-2 text-foreground/70 hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {categoryOptions.map((category) => (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category.slug)
                    setShowFilters(false)
                  }}
                  className={`w-full px-6 py-4 rounded-2xl text-left capitalize boty-transition ${
                    selectedCategory === category.slug
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground boty-shadow"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card rounded-3xl overflow-hidden boty-shadow animate-pulse">
              <div className="aspect-square bg-muted" />
              <div className="p-6 space-y-3">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-5 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Grid */}
      {!isLoading && (
        <div 
          ref={gridRef}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {products.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No products found in this category.</p>
            </div>
          ) : (
            products.map((product, index) => (
              <ProductCard 
                key={product.id}
                product={product}
                index={index}
                isVisible={isVisible}
              />
            ))
          )}
        </div>
      )}
    </>
  )
}

function ProductCard({ 
  product, 
  index, 
  isVisible 
}: { 
  product: Product
  index: number
  isVisible: boolean
}) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.thumbnail_url || '/placeholder.svg',
      quantity: 1,
      size: product.sizes?.[0] || undefined,
    })
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className={`group transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="bg-card rounded-3xl overflow-hidden boty-shadow boty-transition group-hover:scale-[1.02]">
        {/* Image */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {/* Skeleton */}
          <div 
            className={`absolute inset-0 bg-gradient-to-br from-muted via-muted/50 to-muted animate-pulse transition-opacity duration-500 ${
              imageLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />
          
          <Image
            src={product.thumbnail_url || "/placeholder.svg"}
            alt={product.name}
            fill
            className={`object-cover boty-transition group-hover:scale-105 transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {/* Badge */}
          {product.badge && (
            <span
              className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs tracking-wide capitalize ${
                product.badge === "sale"
                  ? "bg-destructive/10 text-destructive"
                  : product.badge === "new"
                  ? "bg-primary/10 text-primary"
                  : "bg-accent text-accent-foreground"
              }`}
            >
              {product.badge}
            </span>
          )}
          {/* Quick add button */}
          <button
            type="button"
            className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 boty-transition boty-shadow"
            onClick={handleAddToCart}
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Info */}
        <div className="p-6">
          <h3 className="font-serif text-xl text-foreground mb-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">{product.short_description}</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-foreground">KES {product.price.toLocaleString()}</span>
            {product.compare_at_price && (
              <span className="text-sm text-muted-foreground line-through">
                KES {product.compare_at_price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
