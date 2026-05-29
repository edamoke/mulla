"use client"

import { useState } from "react"
import { Minus, Plus, ChevronDown, Check } from "lucide-react"
import { useCart } from "@/components/boty/cart-context"
import type { Product } from "@/lib/types"

interface ProductFormProps {
  product: Product
}

type AccordionSection = "details" | "care" | "materials" | "delivery"

export function ProductForm({ product }: ProductFormProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "")
  const [quantity, setQuantity] = useState(1)
  const [openAccordion, setOpenAccordion] = useState<AccordionSection | null>("details")
  const [isAdded, setIsAdded] = useState(false)
  const { addItem, setIsOpen } = useCart()

  const toggleAccordion = (section: AccordionSection) => {
    setOpenAccordion(openAccordion === section ? null : section)
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.thumbnail_url || '/placeholder.svg',
      quantity,
      size: selectedSize || undefined,
    })
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const handleBuyNow = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.thumbnail_url || '/placeholder.svg',
      quantity,
      size: selectedSize || undefined,
    })
    setIsOpen(true)
  }

  const accordionItems: { key: AccordionSection; title: string; content: string }[] = [
    { 
      key: "details", 
      title: "Details", 
      content: product.description || "Premium quality product from our curated collection." 
    },
    { 
      key: "care", 
      title: "Care & Styling", 
      content: "Handle with care. Store in a cool, dry place. See product tags for specific care instructions." 
    },
    { 
      key: "materials", 
      title: "Materials", 
      content: product.materials || "Premium materials sourced from trusted suppliers." 
    },
    { 
      key: "delivery", 
      title: "Delivery & Returns", 
      content: "Free delivery within Malindi. Express shipping available for Mombasa and Nairobi. Returns accepted within 14 days if item is unworn with tags attached." 
    }
  ]

  return (
    <>
      {/* Size Selector */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground mb-3 block">Size</label>
          <div className="flex flex-wrap gap-3">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`px-6 py-3 rounded-full text-sm boty-transition boty-shadow ${
                  selectedSize === size
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-card/80"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      <div className="mb-8">
        <label className="text-sm font-medium text-foreground mb-3 block">Quantity</label>
        <div className="inline-flex items-center gap-4 bg-card rounded-full px-2 py-2 boty-shadow">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-medium text-foreground">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            disabled={product.track_inventory && quantity >= product.stock_quantity}
            className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition disabled:opacity-50"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {product.track_inventory && product.stock_quantity <= product.low_stock_threshold && (
          <p className="text-sm text-destructive mt-2">
            Only {product.stock_quantity} left in stock
          </p>
        )}
      </div>

      {/* Add to Cart Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.track_inventory && product.stock_quantity === 0}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm tracking-wide boty-transition boty-shadow disabled:opacity-50 ${
            isAdded
              ? "bg-primary/80 text-primary-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4" />
              Added to Cart
            </>
          ) : product.track_inventory && product.stock_quantity === 0 ? (
            "Out of Stock"
          ) : (
            "Add to Cart"
          )}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={product.track_inventory && product.stock_quantity === 0}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-transparent border border-foreground/20 text-foreground px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-foreground/5 disabled:opacity-50"
        >
          Buy Now
        </button>
      </div>

      {/* Accordion */}
      <div className="border-t border-border/50">
        {accordionItems.map((item) => (
          <div key={item.key} className="border-b border-border/50">
            <button
              type="button"
              onClick={() => toggleAccordion(item.key)}
              className="w-full flex items-center justify-between py-5 text-left"
            >
              <span className="font-medium text-foreground">{item.title}</span>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground boty-transition ${
                  openAccordion === item.key ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`overflow-hidden boty-transition ${
                openAccordion === item.key ? "max-h-96 pb-5" : "max-h-0"
              }`}
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
