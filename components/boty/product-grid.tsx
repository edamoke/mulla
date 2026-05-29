"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useCart } from "./cart-context"
import { CMSProductGrid } from "@/lib/cms-store"

type Category = "fashion" | "furniture" | "decor"

interface ProductGridProps {
  cms?: CMSProductGrid
}

const products = [
  // Fashion
  {
    id: "silk-kaftan",
    name: "Silk Kaftan",
    description: "Handcrafted luxury beach wear",
    price: 180,
    originalPrice: null,
    image: "/images/products/serum-bottles-1.png",
    badge: "Bestseller",
    category: "fashion" as Category
  },
  {
    id: "linen-shirt",
    name: "Italian Linen Shirt",
    description: "Premium coastal elegance",
    price: 120,
    originalPrice: null,
    image: "/images/products/eye-serum-bottles.png",
    badge: null,
    category: "fashion" as Category
  },
  {
    id: "gold-necklace",
    name: "Gold Pendant Necklace",
    description: "18k gold artisan crafted",
    price: 450,
    originalPrice: null,
    image: "/images/products/amber-dropper-bottles.png",
    badge: "New",
    category: "fashion" as Category
  },
  {
    id: "designer-handbag",
    name: "Designer Handbag",
    description: "Imported Italian leather",
    price: 380,
    originalPrice: 450,
    image: "/images/products/spray-bottles.png",
    badge: "Sale",
    category: "fashion" as Category
  },
  // Furniture
  {
    id: "rattan-chair",
    name: "Rattan Lounge Chair",
    description: "Handwoven coastal comfort",
    price: 650,
    originalPrice: null,
    image: "/images/products/cream-jars-colored.png",
    badge: null,
    category: "furniture" as Category
  },
  {
    id: "teak-coffee-table",
    name: "Teak Coffee Table",
    description: "Solid wood craftsmanship",
    price: 480,
    originalPrice: 580,
    image: "/images/products/tube-bottles.png",
    badge: "Sale",
    category: "furniture" as Category
  },
  {
    id: "velvet-sofa",
    name: "Velvet Sofa",
    description: "Imported European luxury",
    price: 2200,
    originalPrice: null,
    image: "/images/products/jars-wooden-lid.png",
    badge: "Bestseller",
    category: "furniture" as Category
  },
  {
    id: "marble-dining-table",
    name: "Marble Dining Table",
    description: "Italian Carrara marble",
    price: 3500,
    originalPrice: null,
    image: "/images/products/pump-bottles-lavender.png",
    badge: null,
    category: "furniture" as Category
  },
  // Decor
  {
    id: "ceramic-vase",
    name: "Artisan Ceramic Vase",
    description: "Handcrafted decorative piece",
    price: 180,
    originalPrice: null,
    image: "/images/products/amber-dropper-bottles.png",
    badge: "New",
    category: "decor" as Category
  },
  {
    id: "wall-art",
    name: "Abstract Wall Art",
    description: "Contemporary coastal canvas",
    price: 320,
    originalPrice: null,
    image: "/images/products/serum-bottles-1.png",
    badge: null,
    category: "decor" as Category
  },
  {
    id: "brass-lamp",
    name: "Brass Table Lamp",
    description: "Vintage-inspired lighting",
    price: 240,
    originalPrice: null,
    image: "/images/products/spray-bottles.png",
    badge: null,
    category: "decor" as Category
  },
  {
    id: "crystal-chandelier",
    name: "Crystal Chandelier",
    description: "European elegance",
    price: 1800,
    originalPrice: null,
    image: "/images/products/pump-bottles-cream.png",
    badge: "Bestseller",
    category: "decor" as Category
  }
]

const categories = [
  { value: "fashion" as Category, label: "Fashion" },
  { value: "furniture" as Category, label: "Furniture" },
  { value: "decor" as Category, label: "Decor" }
]

export function ProductGrid({ cms }: ProductGridProps) {
  const badge = cms?.badge ?? "Our Collection"
  const title = cms?.title ?? "Curated collections"
  const description = cms?.description ?? "Thoughtfully selected pieces for your luxury coastal lifestyle"

  const [selectedCategory, setSelectedCategory] = useState<Category>("fashion")
  const [isVisible, setIsVisible] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const { addItem } = useCart()
  
  const filteredProducts = products.filter(product => product.category === selectedCategory)

  const handleCategoryChange = (category: Category) => {
    if (category !== selectedCategory) {
      setIsTransitioning(true)
      setTimeout(() => {
        setSelectedCategory(category)
        setTimeout(() => {
          setIsTransitioning(false)
        }, 50)
      }, 300)
    }
  }

  // Preload all product images on mount
  useEffect(() => {
    products.forEach((product) => {
      const img = new window.Image()
      img.src = product.image
    })
  }, [])

  useEffect(() => {
    const gridObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (gridRef.current) {
      gridObserver.observe(gridRef.current)
    }

    if (headerRef.current) {
      headerObserver.observe(headerRef.current)
    }

    return () => {
      if (gridRef.current) {
        gridObserver.unobserve(gridRef.current)
      }
      if (headerRef.current) {
        headerObserver.unobserve(headerRef.current)
      }
    }
  }, [])

  return (
    <section className="py-24 bg-card">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <span className={`text-sm tracking-[0.3em] uppercase text-primary mb-4 block ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.2s', animationFillMode: 'forwards' } : {}}>
            {badge}
          </span>
          <h2 className={`font-serif leading-tight text-foreground mb-4 text-balance text-7xl ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.4s', animationFillMode: 'forwards' } : {}}>
            {title}
          </h2>
          <p className={`text-lg text-muted-foreground max-w-md mx-auto ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.6s', animationFillMode: 'forwards' } : {}}>
            {description}
          </p>
        </div>

        {/* Segmented Control */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-background rounded-full p-1 gap-1 relative">
            {/* Animated background slide */}
            <div
              className="absolute top-1 bottom-1 bg-foreground rounded-full transition-all duration-300 ease-out shadow-sm"
              style={{
                left: selectedCategory === 'fashion' ? '4px' : selectedCategory === 'furniture' ? 'calc(33.333% + 2px)' : 'calc(66.666%)',
                width: 'calc(33.333% - 4px)'
              }}
            />
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => handleCategoryChange(category.value)}
                className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.value
                    ? "text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div 
          ref={gridRef}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {filteredProducts.map((product, index) => (
            <Link
              key={`${selectedCategory}-${product.id}`}
              href={`/product/${product.id}`}
              className={`group transition-all duration-500 ease-out ${
                isVisible && !isTransitioning ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              style={{ transitionDelay: isTransitioning ? '0ms' : `${index * 80}ms` }}
            >
              <div className="bg-background rounded-3xl overflow-hidden boty-shadow boty-transition group-hover:scale-[1.02]">
                {/* Image */}
                <div className="relative aspect-square bg-muted overflow-hidden">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover boty-transition group-hover:scale-105"
                  />
                  {/* Badge */}
                  {product.badge && (
                    <span
                      className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs tracking-wide bg-white text-black ${
                        product.badge === "Sale"
                          ? "bg-destructive/10 text-destructive"
                          : product.badge === "New"
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
                    className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 boty-transition boty-shadow"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      addItem({
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        price: product.price,
                        image: product.image
                      })
                    }}
                    aria-label="Add to cart"
                  >
                    <ShoppingBag className="w-4 h-4 text-foreground" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-serif text-lg text-foreground mb-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">KES {product.price.toLocaleString()}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        KES {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 bg-transparent border border-foreground/20 text-foreground px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-foreground/5"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  )
}
