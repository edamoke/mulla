"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Crown, Gem, Globe } from "lucide-react"
import { CMSCTABanner } from "@/lib/cms-store"

interface CTABannerProps {
  cms?: CMSCTABanner
}

export function CTABanner({ cms }: CTABannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)

  const title = cms?.title ?? "Luxury Living"
  const subtitle = cms?.subtitle ?? "Coastal Style"
  const bgImage = cms?.bg_image ?? "/images/bf965cf4-e728-4e72-ab1b-16b1cd8f1822.png"
  const bullet1 = cms?.bullet1 ?? "Premium Collections"
  const bullet2 = cms?.bullet2 ?? "Authentic Luxury Items"
  const bullet3 = cms?.bullet3 ?? "Globally Sourced"

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (bannerRef.current) {
      observer.observe(bannerRef.current)
    }

    return () => {
      if (bannerRef.current) {
        observer.unobserve(bannerRef.current)
      }
    }
  }, [])

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div 
          ref={bannerRef}
          className={`rounded-3xl p-12 md:p-16 flex flex-col justify-center relative overflow-hidden min-h-[400px] transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          {/* Background Image */}
          <Image
            src={bgImage}
            alt="Natural ingredients"
            fill
            className="object-cover"
          />
          
          <div className="relative z-10 text-left max-w-2xl">
            <h3 className="text-4xl md:text-5xl text-white mb-4 lg:text-5xl">
              {title}
            </h3>
            <h3 className="text-3xl md:text-4xl lg:text-5xl text-white/70 mb-8">
              {subtitle}
            </h3>
            
            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-3 text-white/90">
                <Crown className="w-5 h-5 flex-shrink-0" strokeWidth={1} />
                <span className="text-base">{bullet1}</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <Gem className="w-5 h-5 flex-shrink-0" strokeWidth={1} />
                <span className="text-base">{bullet2}</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <Globe className="w-5 h-5 flex-shrink-0" strokeWidth={1} />
                <span className="text-base">{bullet3}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
