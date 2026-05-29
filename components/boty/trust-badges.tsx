"use client"

import { useEffect, useRef, useState } from "react"
import { Crown, Truck, Sparkles, ShieldCheck } from "lucide-react"
import { CMSBadge } from "@/lib/cms-store"

const iconMap: Record<string, any> = {
  Crown,
  Truck,
  Sparkles,
  ShieldCheck,
}

const defaultBadges = [
  {
    icon: "Crown",
    title: "Premium Quality",
    description: "Handpicked luxury items"
  },
  {
    icon: "Truck",
    title: "Global Imports",
    description: "Sourced from the finest"
  },
  {
    icon: "Sparkles",
    title: "Exclusive Collections",
    description: "Unique curated pieces"
  },
  {
    icon: "ShieldCheck",
    title: "Authenticity Guaranteed",
    description: "100% genuine products"
  }
]

interface TrustBadgesProps {
  cms?: CMSBadge[]
}

export function TrustBadges({ cms }: TrustBadgesProps) {
  const activeBadges = cms && cms.length > 0 ? cms : defaultBadges
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div 
          ref={sectionRef}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {activeBadges.map((badge, index) => {
            const BadgeIcon = iconMap[badge.icon] ?? Sparkles
            return (
              <div
                key={badge.title}
                className={`bg-background p-6 lg:p-8 text-center rounded-xl border border-stone-200 transition-all duration-700 ease-out border-none ${
                  isVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <BadgeIcon className="text-primary mb-4 mx-auto size-12" strokeWidth={1} />
                <h3 className="font-serif text-foreground mb-2 text-2xl">{badge.title}</h3>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
