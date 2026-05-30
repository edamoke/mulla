"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Crown, 
  MapPin, 
  Compass, 
  Layers, 
  ArrowRight, 
  Anchor, 
  Moon, 
  Waves,
  Heart
} from "lucide-react";

export default function AboutPage() {
  const pillars = [
    {
      number: "01",
      title: "The Atelier",
      subtitle: "RETAIL & COUTURE",
      description: "A meticulously curated gallery of high-fashion resort wear, artisanal jewelry, and tailored apparel. Each piece is hand-selected to embrace the breezy, sun-kissed sophistication of the East African coast.",
      icon: Crown,
      link: "/shop",
      cta: "Explore Atelier"
    },
    {
      number: "02",
      title: "The Sanctuaries",
      subtitle: "LUXURY RESIDENCES",
      description: "Breathtaking beachfront villas and curated apartments nestled in the historic coastal enclave of Malindi, Kenya. Merging traditional Swahili craftsmanship with modern architectural grandeur.",
      icon: Waves,
      link: "/apartments",
      cta: "Reserve a Stay"
    },
    {
      number: "03",
      title: "Bespoke Concierge",
      subtitle: "TAILORED HOSPITALITY",
      description: "From private yacht charters across the turquoise Indian Ocean to dining experiences curated by master chefs, we define personalized hospitality. Complemented by our AI-powered virtual butler.",
      icon: Compass,
      link: "/shop", // or general explore
      cta: "Discover More"
    }
  ];

  const values = [
    {
      icon: Anchor,
      title: "Heritage Rooted",
      desc: "Inspired by the century-old Swahili maritime trade routes, bringing global luxury to the beautiful shores of Kenya."
    },
    {
      icon: Sparkles,
      title: "Curation Over Mass",
      desc: "We reject the ordinary. Every fabric, ornament, and suite layout is handpicked for its unique story and aesthetic depth."
    },
    {
      icon: Moon,
      title: "Mystique & Elegance",
      desc: "The gentle tropical breeze, the shifting shadows of palm leaves, and golden Malindi sand translated into timeless designs."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#faf8f5] text-[#2c2724] overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center text-center px-4 pt-20">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Elegant geometric abstract overlay and background gradient to emulate high class feel */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-[#faf8f5] z-10" />
          <div className="absolute inset-0 bg-[#1e1915]/30 z-10 mix-blend-overlay" />
          <Image
            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1800"
            alt="Scenic beachfront in Malindi representing Mulla aesthetic"
            layout="fill"
            objectFit="cover"
            priority
            className="scale-105 animate-subtle-zoom transition-transform duration-[10000ms]"
          />
        </div>
        
        <div className="relative z-20 max-w-4xl mx-auto px-4 mt-8">
          <span className="text-xs uppercase tracking-[0.3em] text-white/90 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full inline-block mb-6 font-semibold animate-fade-in">
            Introducing Mulla
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-light text-white tracking-tight mb-6 leading-[1.1]">
            Where Coastline Charm Meets <br />
            <span className="italic font-normal font-serif text-[#ebd3b9]">Sovereign Elegance</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/90 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
            Mulla is a sanctuary of refined lifestyle. We bridge the rich culture of Malindi, Kenya with high-fashion retail, bespoke short-term stays, and unforgettable coastal experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-[#ebd3b9] hover:bg-[#ebd3b9]/90 text-[#2c2724] font-medium tracking-wide rounded-none px-8 py-6 text-sm">
              <Link href="/shop">Explore the Collections</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#2c2724] font-medium tracking-wide rounded-none px-8 py-6 text-sm bg-transparent">
              <Link href="/apartments">The Residences</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Philosophy Statement */}
      <section className="py-24 bg-white border-y border-[#ebd3b9]/20 relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none hidden xl:block">
          <span className="font-serif text-[12rem] italic select-none">Mulla</span>
        </div>
        <div className="container max-w-5xl mx-auto px-6 text-center relative z-10">
          <Compass className="w-10 h-10 text-[#ebd3b9] mx-auto mb-6 stroke-[1.2]" />
          <h2 className="text-sm uppercase tracking-[0.25em] text-[#8c827a] mb-6 font-semibold">The Core Philosophy</h2>
          <p className="text-2xl sm:text-3xl md:text-4xl font-serif font-light text-[#4a413a] leading-relaxed max-w-4xl mx-auto italic">
            &ldquo;We do not merely sell garments or lease properties; we curate moments of exquisite pause. Mulla is a state of mind, inspired by the gentle tide and crafted for the global connoisseur.&rdquo;
          </p>
          <div className="w-20 h-[1px] bg-[#ebd3b9] mx-auto mt-10" />
        </div>
      </section>

      {/* The Three Pillars Section */}
      <section className="py-24 md:py-32 bg-[#faf8f5]">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs uppercase tracking-[0.2em] text-[#ebd3b9] font-semibold">Our Universe</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-[#2c2724] mt-2">
              The Three Pillars of Mulla
            </h2>
            <p className="text-muted-foreground mt-4 font-light">
              We seamlessly weave retail, coastal residences, and personalized hospitality into one comprehensive luxury gateway.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-white border border-[#ebd3b9]/20 p-8 md:p-10 flex flex-col justify-between hover:shadow-[0_20px_50px_rgba(235,211,185,0.2)] transition-all duration-500 hover:-translate-y-2 group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-10">
                      <span className="font-serif text-5xl text-[#ebd3b9]/50 font-extralight group-hover:text-[#ebd3b9] transition-colors">
                        {pillar.number}
                      </span>
                      <div className="p-3 bg-[#faf8f5] text-[#4a413a] rounded-none group-hover:bg-[#ebd3b9] group-hover:text-[#2c2724] transition-colors duration-300">
                        <Icon className="w-6 h-6 stroke-[1.2]" />
                      </div>
                    </div>
                    <span className="text-xs tracking-[0.2em] text-[#8c827a] block mb-2 font-mono">
                      {pillar.subtitle}
                    </span>
                    <h3 className="text-2xl font-serif text-[#2c2724] mb-4">
                      {pillar.title}
                    </h3>
                    <p className="text-[#635a54] text-sm leading-relaxed font-light mb-8">
                      {pillar.description}
                    </p>
                  </div>
                  <Link 
                    href={pillar.link} 
                    className="inline-flex items-center text-xs tracking-wider uppercase font-medium text-[#2c2724] border-b border-[#ebd3b9] pb-1 w-fit group-hover:border-[#2c2724] transition-colors"
                  >
                    {pillar.cta}
                    <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dynamic Brand Story / Swahili Blend */}
      <section className="py-24 bg-white border-t border-[#ebd3b9]/10">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 relative h-[500px] sm:h-[600px] w-full border border-[#ebd3b9]/30 p-4 bg-[#faf8f5]">
              <div className="relative w-full h-full">
                <Image
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200"
                  alt="High-end resort villa view representing Mulla properties"
                  layout="fill"
                  objectFit="cover"
                  className="grayscale hover:grayscale-0 transition-all duration-[2000ms]"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 w-44 h-44 border-4 border-white bg-[#ebd3b9]/95 flex flex-col justify-center items-center text-center p-4 shadow-xl hidden sm:flex">
                <Anchor className="w-8 h-8 text-white mb-2 stroke-[1.2]" />
                <span className="font-serif text-sm font-medium text-white">Malindi Heritage</span>
                <span className="text-[10px] tracking-[0.1em] text-white/80">EST. 2024</span>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-8 pl-0 lg:pl-10">
              <span className="text-xs uppercase tracking-[0.2em] text-[#ebd3b9] font-semibold">Our Journey</span>
              <h2 className="text-3xl sm:text-5xl font-serif font-light text-[#2c2724] leading-tight">
                From the Historic Shorelines of <br />
                <span className="italic">Malindi, Kenya</span>
              </h2>
              <p className="text-[#635a54] text-lg font-light leading-relaxed">
                Mulla was founded to create an exquisite canvas of hospitality and retail on the East African coast. Malindi, with its deep-rooted history, Swahili archways, and trade winds, serves as our continuous inspiration.
              </p>
              <p className="text-[#635a54] leading-relaxed font-light">
                We believe that modern travelers and collectors yearn for authenticity. Our residences are designed with local coral stone, high timber beams, and artisanal decor sourced directly from local Swahili carvers. Meanwhile, our boutique atelier features contemporary silhouettes made from organic local cottons, linen, and precious metals.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#ebd3b9]/30">
                <div>
                  <h4 className="font-serif text-3xl text-[#2c2724]">100%</h4>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Locally Crafted Decor</p>
                </div>
                <div>
                  <h4 className="font-serif text-3xl text-[#2c2724]">12+</h4>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Exclusive Residences</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Values & Pillars */}
      <section className="py-24 bg-[#fbfaf8] border-t border-[#ebd3b9]/20">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h3 className="text-2xl sm:text-3xl font-serif font-light text-[#2c2724]">Our Living Creed</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border border-[#ebd3b9] flex items-center justify-center mx-auto text-[#ebd3b9]">
                    <Icon className="w-5 h-5 stroke-[1.2]" />
                  </div>
                  <h4 className="font-serif text-xl text-[#2c2724]">{v.title}</h4>
                  <p className="text-sm text-[#635a54] leading-relaxed font-light max-w-xs mx-auto">
                    {v.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Experience CTA Banner */}
      <section className="relative py-24 md:py-32 bg-[#2c2724] text-[#faf8f5] overflow-hidden">
        <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1800"
            alt="Mulla sands"
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8">
          <Compass className="w-12 h-12 text-[#ebd3b9] mx-auto animate-spin-slow stroke-[1.2]" />
          <h2 className="text-3xl sm:text-5xl font-serif font-light tracking-tight">
            Embrace the <span className="italic text-[#ebd3b9]">Mulla Lifestyle</span> Today
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
            Whether you are choosing a piece of coastal elegance to adorn your home, purchasing luxury apparel, or reserving your next sanctuary in Malindi, Mulla is here to transform your expectations.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button asChild size="lg" className="bg-[#ebd3b9] hover:bg-[#ebd3b9]/90 text-[#2c2724] rounded-none px-8 py-6 text-sm">
              <Link href="/shop">Browse the Shop</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 text-white hover:bg-white hover:text-[#2c2724] rounded-none px-8 py-6 text-sm bg-transparent">
              <Link href="/apartments">Explore Apartments</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Heart-crafted Footer Attribution */}
      <footer className="py-8 bg-white border-t border-[#ebd3b9]/20 text-center">
        <p className="text-xs text-[#8c827a] flex items-center justify-center gap-1 font-mono">
          Made with <Heart className="w-3 h-3 text-[#ebd3b9] fill-[#ebd3b9]" /> in Malindi, Kenya &copy; {new Date().getFullYear()} Mulla Enterprise
        </p>
      </footer>
    </div>
  );
}
