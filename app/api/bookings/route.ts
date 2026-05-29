import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  // Get current user (optional - guest booking allowed)
  const { data: { user } } = await supabase.auth.getUser()

  try {
    const body = await request.json()
    const {
      apartment_id,
      check_in_date,
      check_out_date,
      nights,
      guests,
      accommodation_total,
      cleaning_fee,
      service_fee,
      total,
      payment_method,
      guest_name,
      guest_email,
      guest_phone,
      special_requests
    } = body

    // Validate required fields
    if (!apartment_id || !check_in_date || !check_out_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check availability
    const { data: existingBookings } = await supabase
      .from('apartment_bookings')
      .select('id')
      .eq('apartment_id', apartment_id)
      .in('status', ['pending', 'confirmed', 'checked_in'])
      .or(`and(check_in_date.lt.${check_out_date},check_out_date.gt.${check_in_date})`)

    if (existingBookings && existingBookings.length > 0) {
      return NextResponse.json(
        { error: 'Selected dates are not available' },
        { status: 400 }
      )
    }

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('apartment_bookings')
      .insert({
        apartment_id,
        user_id: user?.id || null,
        check_in_date,
        check_out_date,
        nights,
        guests: guests || 1,
        status: 'pending',
        payment_status: payment_method === 'cash_on_delivery' ? 'pending' : 'pending',
        payment_method: payment_method || 'mpesa',
        accommodation_total,
        cleaning_fee: cleaning_fee || 0,
        service_fee: service_fee || 0,
        tax_amount: 0,
        discount_amount: 0,
        total,
        currency: 'KES',
        guest_name,
        guest_email,
        guest_phone,
        special_requests
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Booking creation error:', bookingError)
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    // Simulate payment success for M-Pesa and COD
    if (payment_method === 'mpesa' || payment_method === 'cash_on_delivery') {
      const newPaymentStatus = payment_method === 'cash_on_delivery' ? 'pending' : 'paid'

      await supabase
        .from('apartment_bookings')
        .update({ 
          payment_status: newPaymentStatus,
          status: 'confirmed',
          payment_reference: `MOCK-${Date.now()}`
        })
        .eq('id', booking.id)
    }

    return NextResponse.json({
      success: true,
      booking_id: booking.id,
      booking_number: booking.booking_number
    })
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json(
      { error: 'An error occurred during booking' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const bookingId = searchParams.get('id')
  const apartmentId = searchParams.get('apartment_id')
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // If checking availability (no auth required)
  if (apartmentId && startDate && endDate) {
    const { data: bookings } = await supabase
      .from('apartment_bookings')
      .select('check_in_date, check_out_date')
      .eq('apartment_id', apartmentId)
      .in('status', ['pending', 'confirmed', 'checked_in'])

    // Get all booked dates
    const bookedDates: string[] = []
    bookings?.forEach(booking => {
      const start = new Date(booking.check_in_date)
      const end = new Date(booking.check_out_date)
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        bookedDates.push(d.toISOString().split('T')[0])
      }
    })

    return NextResponse.json({ booked_dates: bookedDates })
  }

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  if (bookingId) {
    // Get specific booking
    const { data, error } = await supabase
      .from('apartment_bookings')
      .select('*, apartment:apartments(*)')
      .eq('id', bookingId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data })
  }

  // Get all user bookings
  const { data, error } = await supabase
    .from('apartment_bookings')
    .select('*, apartment:apartments(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ data })
}
