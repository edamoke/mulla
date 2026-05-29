import { Header } from "@/components/boty/header"
import { Hero } from "@/components/boty/hero"
import { TrustBadges } from "@/components/boty/trust-badges"
import { FeatureSection } from "@/components/boty/feature-section"
import { ProductGrid } from "@/components/boty/product-grid"
import { Testimonials } from "@/components/boty/testimonials"
import { CTABanner } from "@/components/boty/cta-banner"
import { Newsletter } from "@/components/boty/newsletter"
import { Footer } from "@/components/boty/footer"
import { getCMSData } from "@/lib/cms-store"

export default function HomePage() {
  const cms = getCMSData()

  return (
    <main>
      <Header />
      <Hero cms={cms.home.hero} />
      <TrustBadges cms={cms.home.trust_badges} />
      <ProductGrid />
      <FeatureSection />
      <Testimonials />
      <CTABanner cms={cms.home.cta_banner} />
      <Newsletter />
      <Footer />
    </main>
  )
}
