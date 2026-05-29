import { createAdminClient as createClient } from '@/lib/supabase/server'
import type { Apartment, ApartmentBooking } from '@/lib/types'

export async function getApartments(options?: {
  featured?: boolean
  limit?: number
}): Promise<Apartment[]> {
  const supabase = await createClient()

  let query = supabase
    .from('apartments')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (options?.featured) {
    query = query.eq('is_featured', true)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching apartments:', error)
    return []
  }

  return data as Apartment[]
}

export async function getApartmentBySlug(slug: string): Promise<Apartment | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('apartments')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching apartment:', error)
    return null
  }

  return data as Apartment
}

export async function getApartmentBookings(
  apartmentId: string, 
  startDate?: string, 
  endDate?: string
): Promise<ApartmentBooking[]> {
  const supabase = await createClient()

  let query = supabase
    .from('apartment_bookings')
    .select('*')
    .eq('apartment_id', apartmentId)
    .in('status', ['pending', 'confirmed', 'checked_in'])

  if (startDate && endDate) {
    // Get bookings that overlap with the date range
    query = query
      .or(`check_in_date.lte.${endDate},check_out_date.gte.${startDate}`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching bookings:', error)
    return []
  }

  return data as ApartmentBooking[]
}

export async function checkAvailability(
  apartmentId: string,
  checkIn: string,
  checkOut: string
): Promise<boolean> {
  const bookings = await getApartmentBookings(apartmentId, checkIn, checkOut)
  
  // Check for any overlapping bookings
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)

  const hasConflict = bookings.some(booking => {
    const bookingCheckIn = new Date(booking.check_in_date)
    const bookingCheckOut = new Date(booking.check_out_date)
    
    // Check if dates overlap
    return checkInDate < bookingCheckOut && checkOutDate > bookingCheckIn
  })

  return !hasConflict
}

export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function calculateBookingTotal(
  apartment: Apartment,
  nights: number
): {
  accommodationTotal: number
  cleaningFee: number
  serviceFee: number
  total: number
} {
  let accommodationTotal = 0

  // Apply weekly/monthly rates if applicable
  if (nights >= 30 && apartment.price_per_month) {
    const months = Math.floor(nights / 30)
    const remainingDays = nights % 30
    accommodationTotal = (months * apartment.price_per_month) + (remainingDays * apartment.price_per_night)
  } else if (nights >= 7 && apartment.price_per_week) {
    const weeks = Math.floor(nights / 7)
    const remainingDays = nights % 7
    accommodationTotal = (weeks * apartment.price_per_week) + (remainingDays * apartment.price_per_night)
  } else {
    accommodationTotal = nights * apartment.price_per_night
  }

  const cleaningFee = apartment.cleaning_fee || 0
  const serviceFee = Math.round(accommodationTotal * 0.05) // 5% service fee
  const total = accommodationTotal + cleaningFee + serviceFee

  return {
    accommodationTotal,
    cleaningFee,
    serviceFee,
    total
  }
}
