import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, Bed, Bath, Users, Maximize, MapPin, Check } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { BookingForm } from "@/components/apartments/booking-form"
import { getApartmentBySlug } from "@/lib/api/apartments"

export default async function ApartmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const apartment = await getApartmentBySlug(slug)

  if (!apartment) {
    notFound()
  }

  const amenities = (apartment.amenities as string[]) || []

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/apartments"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 boty-transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Apartments
          </Link>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column - Images & Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Main Image */}
              <div className="aspect-[16/10] relative rounded-2xl overflow-hidden bg-muted">
                <Image
                  src={apartment.thumbnail_url || "/images/products/jars-wooden-lid.png"}
                  alt={apartment.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Apartment Info */}
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4" />
                  {apartment.location}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                    Fully Furnished
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
                    Short & Long-term stay
                  </span>
                </div>
                <h1 className="font-serif text-4xl text-foreground mb-4">
                  {apartment.name}
                </h1>

                {apartment.price_per_month && (
                  <div className="bg-muted/40 border border-border rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">Short-term pricing</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-foreground">KES {apartment.price_per_night.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">/ night</span>
                      </div>
                    </div>
                    <div className="hidden sm:block h-8 w-[1px] bg-border" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">Long-term rate</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-emerald-700">KES {apartment.price_per_month.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">/ month (30+ nights)</span>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-lg text-muted-foreground leading-relaxed">
                  {apartment.description}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <Bed className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                  <p className="font-medium text-foreground">
                    {apartment.bedrooms === 0 ? "Studio" : apartment.bedrooms}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <Bath className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                  <p className="font-medium text-foreground">{apartment.bathrooms}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <Users className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Max Guests</p>
                  <p className="font-medium text-foreground">{apartment.max_guests}</p>
                </div>
                {apartment.area_sqm && (
                  <div className="bg-muted/50 rounded-xl p-4 text-center">
                    <Maximize className="w-5 h-5 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Area</p>
                    <p className="font-medium text-foreground">{apartment.area_sqm} sqm</p>
                  </div>
                )}
              </div>

              {/* Amenities */}
              {amenities.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl text-foreground mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* House Rules */}
              <div>
                <h2 className="font-serif text-2xl text-foreground mb-4">House Rules</h2>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Check-in: {apartment.check_in_time}</p>
                  <p>Check-out: {apartment.check_out_time}</p>
                  <p>Minimum stay: {apartment.minimum_nights} night(s)</p>
                  <p>Maximum stay: {apartment.maximum_nights} nights</p>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-32">
                <Suspense fallback={<div className="h-96 bg-muted/50 rounded-2xl animate-pulse" />}>
                  <BookingForm apartment={apartment} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
