"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { getCMSData } from "@/lib/cms-store"
import { Sparkles, Crown, MapPin, Compass, ArrowRight, Sun, Anchor, Waves } from "lucide-react"

export default function AboutPage() {
  const cms = getCMSData()

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] text-[#2C2C2C]">
      <Header />

      <main className="flex-1 pt-24">
        {/* Creative Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32 bg-gradient-to-b from-[#F5F2EB] to-[#FAF9F6]">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#D4AF37] blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#C2A383] blur-3xl" />
          </div>

          <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-[rgba(212,175,55,0.3)] text-xs font-medium tracking-widest uppercase text-[#A18218] mb-6 animate-fade-in">
              <Sun className="w-3.5 h-3.5 text-[#D4AF37] animate-spin-slow" />
              {cms.about?.badge || "The Spirit of the Swahili Coast"}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-serif font-light tracking-tight text-[#1F1F1F] mb-6 leading-[1.15]">
              {cms.about?.title_normal || "Where Coastal Serenity"} <br />
              <span className="font-italic italic text-[#A18218]">{cms.about?.title_italic || "Meets Modern Luxury"}</span>
            </h1>
            
            <p className="text-lg md:text-xl font-light text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10">
              {cms.about?.description || "Mulla is more than a destination; it is an sensory art form. Born under the warm golden sun of Malindi, we curate slow-living luxury through refined fashion, handcrafted home decor, and breathtaking coastal sanctuaries."}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-[#1F1F1F] hover:bg-[#3D3D3D] text-white rounded-full px-8 py-6 text-sm tracking-wider uppercase transition-all duration-300">
                <Link href="/shop">Explore Collections</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-[#1F1F1F] text-[#1F1F1F] hover:bg-[#1F1F1F]/5 rounded-full px-8 py-6 text-sm tracking-wider uppercase transition-all duration-300">
                <Link href="/apartments">Discover Apartments</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Narrative Chapter Section */}
        <section className="py-20 lg:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              {/* Left Column: Storytelling Visual */}
              <div className="lg:col-span-5 space-y-6">
                <div className="relative h-[480px] w-full rounded-2xl overflow-hidden shadow-2xl group">
                  <Image
                    src="/images/hero-model.jpg"
                    alt="Aesthetic Coastal Living"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-w-768px) 100vw, 50vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white p-4 backdrop-blur-sm bg-black/20 rounded-xl border border-white/10">
                    <p className="text-xs font-semibold tracking-widest uppercase mb-1">Malindi, Kenya</p>
                    <p className="font-serif italic text-lg">"The ocean stirs the heart, inspires the imagination, and brings eternal joy to the soul."</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Creative Narrative */}
              <div className="lg:col-span-7 space-y-8">
                <div className="space-y-4">
                  <span className="text-sm font-semibold tracking-widest uppercase text-[#A18218] block">
                    {cms.about?.story_badge || "Our Story"}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-serif tracking-tight text-[#1F1F1F]">
                    {cms.about?.story_title || "Crafting a Lifestyle of Elegance and Light"}
                  </h2>
                </div>

                <div className="space-y-6 text-muted-foreground font-light leading-relaxed text-base md:text-lg">
                  <p>
                    {cms.about?.story_p1 || "Mulla emerged from an obsession with the coastal breeze, the texture of hand-spun linen, and the unique warmth of East African hospitality. We envisioned a brand that bridges the rich heritage of Swahili craftsmanship with minimalist modernism."}
                  </p>
                  <p>
                    {cms.about?.story_p2 || "Whether it's the meticulous tailoring of our linen wear, the curated selection of artisan-made home decor that breathes air and light into your home, or our collection of exclusive coastal sanctuaries overlooking the azure blue waters of the Indian Ocean—every Mulla design holds a whisper of the sea."}
                  </p>
                  <p className="border-l-2 border-[#A18218] pl-6 italic font-serif text-[#1F1F1F] text-lg">
                    "{cms.about?.story_quote || "We do not build environments; we curate emotions. Mulla is a love letter to slow, deliberate, beautiful living."}"
                  </p>
                </div>

                <div className="pt-4 flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-3xl md:text-4xl font-serif text-[#1F1F1F]">100%</p>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Artisan-Sourced</p>
                  </div>
                  <div className="w-[1px] h-10 bg-border/80" />
                  <div className="text-center">
                    <p className="text-3xl md:text-4xl font-serif text-[#1F1F1F]">Malindi</p>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Our Sanctuary</p>
                  </div>
                  <div className="w-[1px] h-10 bg-border/80" />
                  <div className="text-center">
                    <p className="text-3xl md:text-4xl font-serif text-[#1F1F1F]">Organic</p>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Linen & Materials</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Three Pillars of Mulla */}
        <section className="py-20 lg:py-28 bg-[#F4F1EA]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="text-sm font-semibold tracking-widest uppercase text-[#A18218]">The Triad of Slow Luxury</span>
              <h2 className="text-3xl md:text-4xl font-serif tracking-tight text-[#1F1F1F]">Explore the Worlds of Mulla</h2>
              <p className="text-muted-foreground font-light">Each pillar is carefully designed to transport you to a place of aesthetic harmony and coastal comfort.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Pillar 1: Mulla Atelier */}
              <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-[#E9E5DC]">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src="/images/bento-skin-model.jpg"
                    alt="Mulla Atelier Slow Fashion"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300" />
                  <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] tracking-widest uppercase font-semibold text-[#1F1F1F]">
                    Atelier
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1 justify-between">
                  <div className="space-y-4">
                    <h3 className="text-xl font-serif text-[#1F1F1F]">Mulla Atelier</h3>
                    <p className="text-sm text-muted-foreground font-light leading-relaxed">
                      Ethereal, breathable resort wear handcrafted using premium organic linen, earthy colors, and relaxed tailoring. Designed for sunset dinners and ocean breezes.
                    </p>
                  </div>
                  <div className="pt-6">
                    <Link href="/shop" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A18218] hover:text-[#1F1F1F] transition-colors group/link">
                      Shop Slow Fashion
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Pillar 2: La Maison Mulla */}
              <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-[#E9E5DC]">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src="/images/natural-leaf.jpg"
                    alt="La Maison Mulla Decor"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300" />
                  <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] tracking-widest uppercase font-semibold text-[#1F1F1F]">
                    Maison
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1 justify-between">
                  <div className="space-y-4">
                    <h3 className="text-xl font-serif text-[#1F1F1F]">La Maison Mulla</h3>
                    <p className="text-sm text-muted-foreground font-light leading-relaxed">
                      Sustainably sourced, artisan-made home accessories, statement ceramics, and tactile textiles that bring the quiet tranquility of nature directly into your living spaces.
                    </p>
                  </div>
                  <div className="pt-6">
                    <Link href="/shop" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A18218] hover:text-[#1F1F1F] transition-colors group/link">
                      Browse Decor
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Pillar 3: Mulla Havens */}
              <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-[#E9E5DC]">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src="/images/skincare-ritual.jpg"
                    alt="Mulla Havens Luxury Rentals"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300" />
                  <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] tracking-widest uppercase font-semibold text-[#1F1F1F]">
                    Havens
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1 justify-between">
                  <div className="space-y-4">
                    <h3 className="text-xl font-serif text-[#1F1F1F]">Mulla Havens</h3>
                    <p className="text-sm text-muted-foreground font-light leading-relaxed">
                      Exquisite coastal villas and ocean-facing boutique apartments in Malindi, offering a retreat where every detail is tailored to pamper your mind, body, and soul.
                    </p>
                  </div>
                  <div className="pt-6">
                    <Link href="/apartments" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A18218] hover:text-[#1F1F1F] transition-colors group/link">
                      Reserve Your Escape
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Artistic Ethos & Philosophy */}
        <section className="py-20 lg:py-28 relative overflow-hidden bg-white">
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="text-sm font-semibold tracking-widest uppercase text-[#A18218]">Our Philosophy</span>
                <h2 className="text-3xl md:text-4xl font-serif text-[#1F1F1F] tracking-tight">The Art of Mindful Luxury</h2>
                <p className="text-muted-foreground font-light leading-relaxed">
                  We believe true luxury is not loud or ostentatious. It is quiet. It is found in the soft touch of organic fabric against sun-kissed skin, the hand-molded asymmetry of a clay vase, and the peaceful sound of waves breaking on white sands.
                </p>
                
                <div className="space-y-4 pt-4">
                  <div className="flex gap-4 items-start">
                    <div className="p-2 rounded-full bg-[#FAF9F6] text-[#A18218] mt-0.5">
                      <Anchor className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif text-[#1F1F1F] text-lg">Swahili Craftsmanship</h4>
                      <p className="text-sm text-muted-foreground font-light mt-1">We partner directly with coastal woodworkers, weavers, and ceramicists to preserve ancient heritage and empower local communities.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <div className="p-2 rounded-full bg-[#FAF9F6] text-[#A18218] mt-0.5">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif text-[#1F1F1F] text-lg">Eco-Conscious Curation</h4>
                      <p className="text-sm text-muted-foreground font-light mt-1">Every material is selected mindfully—from organic, biodegradable fabrics to lead-free artisanal glazes, honoring our earth and ocean.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="p-2 rounded-full bg-[#FAF9F6] text-[#A18218] mt-0.5">
                      <Waves className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif text-[#1F1F1F] text-lg">Curated Coastal Peace</h4>
                      <p className="text-sm text-muted-foreground font-light mt-1">Our apartments are designed using principles of biophilic design to elevate peace of mind, creativity, and sensory relaxation.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Cards/Bento Layout */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-8 rounded-2xl bg-[#F4F1EA] flex flex-col justify-between h-48 hover:translate-y-[-4px] transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-[#A18218]" />
                  <div>
                    <p className="font-serif text-lg text-[#1F1F1F]">Impeccable Taste</p>
                    <p className="text-xs text-muted-foreground font-light mt-1">Curated with precision</p>
                  </div>
                </div>
                <div className="p-8 rounded-2xl bg-[#E9E5DC] flex flex-col justify-between h-48 translate-y-6 hover:translate-y-[2px] transition-transform duration-300">
                  <Crown className="w-8 h-8 text-[#A18218]" />
                  <div>
                    <p className="font-serif text-lg text-[#1F1F1F]">Exclusive Access</p>
                    <p className="text-xs text-muted-foreground font-light mt-1">Limited runs & stays</p>
                  </div>
                </div>
                <div className="p-8 rounded-2xl bg-[#E2DDD3] flex flex-col justify-between h-48 hover:translate-y-[-4px] transition-transform duration-300">
                  <MapPin className="w-8 h-8 text-[#A18218]" />
                  <div>
                    <p className="font-serif text-lg text-[#1F1F1F]">Oceanfront Views</p>
                    <p className="text-xs text-muted-foreground font-light mt-1">Golden beach sands</p>
                  </div>
                </div>
                <div className="p-8 rounded-2xl bg-[#F5F2EB] flex flex-col justify-between h-48 translate-y-6 hover:translate-y-[2px] transition-transform duration-300">
                  <Sun className="w-8 h-8 text-[#A18218]" />
                  <div>
                    <p className="font-serif text-lg text-[#1F1F1F]">Infinite Sun</p>
                    <p className="text-xs text-muted-foreground font-light mt-1">Coastal Malindi rays</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Invitation to Experience Mulla */}
        <section className="py-24 bg-gradient-to-t from-[#F5F2EB] to-[#FAF9F6] border-t border-[#E9E5DC]">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-serif tracking-tight text-[#1F1F1F]">Join the Mulla Lifestyle</h2>
            <p className="text-muted-foreground font-light leading-relaxed text-lg max-w-2xl mx-auto">
              Subscribe to receive exclusive access to capsule collection releases, interior design inspiration, and special seasonal rates for our Malindi getaways.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-6 py-4 rounded-full border border-border bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#A18218]"
              />
              <Button className="w-full sm:w-auto bg-[#1F1F1F] hover:bg-[#3D3D3D] text-white rounded-full px-8 py-4 text-sm tracking-wider uppercase whitespace-nowrap transition-all duration-300">
                Subscribe
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer cms={cms.footer} />
    </div>
  )
}
