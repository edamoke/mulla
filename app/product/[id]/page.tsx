import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, Crown, Heart, Award, ShieldCheck, Star } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { ProductForm } from "@/components/shop/product-form"
import { getProductBySlug, getRelatedProducts } from "@/lib/api/products"
import type { Product } from "@/lib/types"

const benefits = [
  { icon: Crown, label: "Premium Quality" },
  { icon: Heart, label: "Curated Selection" },
  { icon: ShieldCheck, label: "Authenticity Guaranteed" },
  { icon: Award, label: "Expert Approved" }
]

export default async function ProductPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProductBySlug(id)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.id, product.category_id, 4)

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground boty-transition mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Shop
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Product Image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-card boty-shadow">
              <Image
                src={product.thumbnail_url || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {/* Badge */}
              {product.badge && (
                <span
                  className={`absolute top-6 left-6 px-4 py-2 rounded-full text-sm tracking-wide capitalize ${
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
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              {/* Header */}
              <div className="mb-8">
                <span className="text-sm tracking-[0.3em] uppercase text-primary mb-2 block">
                  {product.category?.name || 'Mulla Collection'}
                </span>
                <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-3">
                  {product.name}
                </h1>
                {product.short_description && (
                  <p className="text-lg text-muted-foreground italic mb-4">
                    {product.short_description}
                  </p>
                )}
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">(0 reviews)</span>
                </div>

                {product.description && (
                  <p className="text-foreground/80 leading-relaxed">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-8">
                <span className="text-3xl font-medium text-foreground">
                  KES {product.price.toLocaleString()}
                </span>
                {product.compare_at_price && (
                  <span className="text-xl text-muted-foreground line-through">
                    KES {product.compare_at_price.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Product Form (Client Component) */}
              <ProductForm product={product} />

              {/* Benefits */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
                {benefits.map((benefit) => (
                  <div
                    key={benefit.label}
                    className="flex flex-col items-center gap-2 p-4 rounded-md"
                  >
                    <benefit.icon className="w-5 h-5 text-primary" />
                    <span className="text-xs text-muted-foreground text-center">{benefit.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-24">
              <h2 className="font-serif text-3xl text-foreground mb-8">You May Also Like</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((related) => (
                  <RelatedProductCard key={related.id} product={related} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}

function RelatedProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group"
    >
      <div className="bg-card rounded-2xl overflow-hidden boty-shadow boty-transition group-hover:scale-[1.02]">
        <div className="relative aspect-square bg-muted overflow-hidden">
          <Image
            src={product.thumbnail_url || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover boty-transition group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="font-serif text-lg text-foreground mb-1">{product.name}</h3>
          <span className="text-foreground font-medium">
            KES {product.price.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  )
}
