import Image from "next/image"
import Link from "next/link"
import { Bed, Bath, Users, MapPin, Star } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { getApartments } from "@/lib/api/apartments"
import type { Apartment } from "@/lib/types"
import { getCMSData } from "@/lib/cms-store"

export default async function ApartmentsPage() {
  const apartments = await getApartments()
  const cms = getCMSData()

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-sm tracking-[0.3em] uppercase text-primary mb-4 block">
              Mulla Apartments
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 text-balance">
              {cms.apartments.header.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              {cms.apartments.header.subtitle}
            </p>
          </div>

          {/* Apartments Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {apartments.map((apartment) => (
              <ApartmentCard key={apartment.id} apartment={apartment} />
            ))}
          </div>

          {apartments.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No apartments available at the moment.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}

function ApartmentCard({ apartment }: { apartment: Apartment }) {
  return (
    <Link
      href={`/apartments/${apartment.slug}`}
      className="group"
    >
      <div className="bg-card rounded-3xl overflow-hidden boty-shadow boty-transition group-hover:scale-[1.02]">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          <Image
            src={apartment.thumbnail_url || "/placeholder.svg"}
            alt={apartment.name}
            fill
            className="object-cover boty-transition group-hover:scale-105"
          />
          {apartment.is_featured && (
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs tracking-wide bg-primary/10 text-primary">
              Featured
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-serif text-2xl text-foreground mb-1">{apartment.name}</h3>
              <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                <MapPin className="w-4 h-4" />
                <span>{apartment.location}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-semibold uppercase tracking-wider">
                  Fully Furnished
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-semibold uppercase tracking-wider">
                  Short & Long Term
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <Star className="w-4 h-4 fill-primary" />
              <span className="text-sm font-medium">4.9</span>
            </div>
          </div>

          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {apartment.short_description}
          </p>

          {/* Features */}
          <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{apartment.bedrooms} {apartment.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{apartment.bathrooms} {apartment.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>Up to {apartment.max_guests}</span>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-foreground">
                KES {apartment.price_per_night.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">/ night (Short-term)</span>
            </div>
            {apartment.price_per_month && (
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  KES {apartment.price_per_month.toLocaleString()}
                </span>
                <span className="text-[11px] text-muted-foreground">/ month (Long-term lease)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
