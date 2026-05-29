import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { ProductGrid } from "@/components/shop/product-grid"
import { getProducts, getCategories } from "@/lib/api/products"
import { getCMSData } from "@/lib/cms-store"

export default async function ShopPage() {
  const [productsData, categories] = await Promise.all([
    getProducts({ limit: 50 }),
    getCategories()
  ])
  const cms = getCMSData()

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-sm tracking-[0.3em] uppercase text-primary mb-4 block">
              Our Collection
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 text-balance">
              {cms.shop.header.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              {cms.shop.header.subtitle}
            </p>
          </div>

          <ProductGrid 
            initialProducts={productsData.data} 
            categories={categories}
          />
        </div>
      </div>

      <Footer />
    </main>
  )
}
