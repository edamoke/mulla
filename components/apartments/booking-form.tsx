"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, Minus, Plus, Users, Smartphone, Truck, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import type { Apartment } from "@/lib/types"

interface BookingFormProps {
  apartment: Apartment
}

type PaymentMethod = 'mpesa' | 'cash_on_delivery'

export function BookingForm({ apartment }: BookingFormProps) {
  const router = useRouter()
  const { user, profile } = useAuth()
  
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(1)
  const [step, setStep] = useState<'dates' | 'details' | 'processing' | 'success'>('dates')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingNumber, setBookingNumber] = useState<string | null>(null)
  const [bookedDates, setBookedDates] = useState<string[]>([])

  // Form state
  const [formData, setFormData] = useState({
    guestName: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : '',
    guestEmail: profile?.email || user?.email || '',
    guestPhone: profile?.phone || '',
    mpesaPhone: profile?.phone || '',
    specialRequests: ''
  })

  // Fetch booked dates
  useEffect(() => {
    const fetchBookedDates = async () => {
      const today = new Date().toISOString().split('T')[0]
      const threeMonthsLater = new Date()
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3)
      
      const res = await fetch(
        `/api/bookings?apartment_id=${apartment.id}&start_date=${today}&end_date=${threeMonthsLater.toISOString().split('T')[0]}`
      )
      const data = await res.json()
      setBookedDates(data.booked_dates || [])
    }
    fetchBookedDates()
  }, [apartment.id])

  // Calculate pricing with robust seasonal pricing engine
  const calculatePricing = () => {
    if (!checkIn || !checkOut) return null
    
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    if (nights < 1) return null

    // Determine seasonal adjustments based on check-in month
    const checkInMonth = start.getMonth() // 0-indexed (0=Jan, 11=Dec)
    let seasonalFactor = 1.00
    let seasonalName = "Regular Season Rate"
    
    // High season peak coastal months: Dec, Jan, Jun, Jul, Aug
    if ([11, 0, 5, 6, 7].includes(checkInMonth)) {
      seasonalFactor = 1.25
      seasonalName = "High Season Premium (+25%)"
    } 
    // Low season rainy coastal months: Feb, May, Nov
    else if ([1, 4, 10].includes(checkInMonth)) {
      seasonalFactor = 0.85
      seasonalName = "Low Season Discount (-15%)"
    } else {
      seasonalName = "Regular Shoulder Season"
    }

    const baseNightlyRate = apartment.price_per_night
    const adjustedNightlyRate = Math.round(baseNightlyRate * seasonalFactor)

    let accommodationTotal = 0
    if (nights >= 30 && apartment.price_per_month) {
      const months = Math.floor(nights / 30)
      const remainingDays = nights % 30
      accommodationTotal = (months * apartment.price_per_month * seasonalFactor) + (remainingDays * adjustedNightlyRate)
    } else if (nights >= 7 && apartment.price_per_week) {
      const weeks = Math.floor(nights / 7)
      const remainingDays = nights % 7
      accommodationTotal = (weeks * apartment.price_per_week * seasonalFactor) + (remainingDays * adjustedNightlyRate)
    } else {
      accommodationTotal = nights * adjustedNightlyRate
    }

    accommodationTotal = Math.round(accommodationTotal)
    const cleaningFee = apartment.cleaning_fee || 0
    const serviceFee = Math.round(accommodationTotal * 0.05)
    const total = accommodationTotal + cleaningFee + serviceFee

    return { 
      nights, 
      accommodationTotal, 
      cleaningFee, 
      serviceFee, 
      total,
      seasonalFactor,
      seasonalName,
      baseNightlyRate,
      adjustedNightlyRate
    }
  }

  const pricing = calculatePricing()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleContinueToDetails = () => {
    if (!pricing) return
    if (pricing.nights < apartment.minimum_nights) {
      alert(`Minimum stay is ${apartment.minimum_nights} nights`)
      return
    }
    if (pricing.nights > apartment.maximum_nights) {
      alert(`Maximum stay is ${apartment.maximum_nights} nights`)
      return
    }
    setStep('details')
  }

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pricing) return
    
    setIsSubmitting(true)
    setStep('processing')

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apartment_id: apartment.id,
          check_in_date: checkIn,
          check_out_date: checkOut,
          nights: pricing.nights,
          guests,
          accommodation_total: pricing.accommodationTotal,
          cleaning_fee: pricing.cleaningFee,
          service_fee: pricing.serviceFee,
          total: pricing.total,
          payment_method: paymentMethod,
          guest_name: formData.guestName,
          guest_email: formData.guestEmail,
          guest_phone: formData.guestPhone,
          special_requests: formData.specialRequests
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking')
      }

      // Simulate M-Pesa delay
      if (paymentMethod === 'mpesa') {
        await new Promise(resolve => setTimeout(resolve, 3000))
      }

      setBookingNumber(data.booking_number)
      setStep('success')
    } catch (error) {
      console.error('Booking error:', error)
      alert('Failed to create booking. Please try again.')
      setStep('details')
    } finally {
      setIsSubmitting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  // Processing state
  if (step === 'processing') {
    return (
      <div className="bg-card rounded-2xl p-6 boty-shadow text-center py-12">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <h3 className="font-serif text-xl text-foreground mb-2">Processing Your Booking</h3>
        {paymentMethod === 'mpesa' && (
          <p className="text-muted-foreground text-sm">
            Please check your phone for the M-Pesa payment prompt
          </p>
        )}
      </div>
    )
  }

  // Success state
  if (step === 'success') {
    return (
      <div className="bg-card rounded-2xl p-6 boty-shadow text-center py-12">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-serif text-xl text-foreground mb-2">Booking Confirmed!</h3>
        <p className="text-muted-foreground mb-2">Your booking number is:</p>
        <p className="text-lg font-medium text-foreground mb-4">{bookingNumber}</p>
        <p className="text-sm text-muted-foreground mb-6">
          Confirmation sent to {formData.guestEmail}
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={() => router.push('/apartments')}>
            Browse More Apartments
          </Button>
          {user && (
            <Button variant="outline" onClick={() => router.push('/account/bookings')}>
              View My Bookings
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Dates selection step
  if (step === 'dates') {
    return (
      <div className="bg-card rounded-2xl p-6 boty-shadow">
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-2xl font-medium text-foreground">
            KES {apartment.price_per_night.toLocaleString()}
          </span>
          <span className="text-muted-foreground">/ night</span>
        </div>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="checkIn" className="text-sm">Check-in</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="checkIn"
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={today}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOut" className="text-sm">Check-out</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="checkOut"
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || today}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Guests</Label>
            <div className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{guests} {guests === 1 ? 'guest' : 'guests'}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  aria-label="Decrease guest count"
                  className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setGuests(Math.min(apartment.max_guests, guests + 1))}
                  aria-label="Increase guest count"
                  className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Maximum {apartment.max_guests} guests</p>
          </div>
        </div>

        {pricing && (
          <div className="border-t border-border pt-4 mb-6 space-y-2 animate-in fade-in duration-200">
            {pricing.seasonalFactor !== 1.0 && (
              <div className="bg-primary/5 rounded-lg px-3 py-1.5 flex items-center justify-between text-xs text-primary font-medium mb-3">
                <span>{pricing.seasonalName}</span>
                <span>Adjusted Rate</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex flex-col">
                <span>KES {pricing.adjustedNightlyRate.toLocaleString()} x {pricing.nights} nights</span>
                {pricing.seasonalFactor !== 1.0 && (
                  <span className="text-[10px] text-muted-foreground/70 line-through">
                    Originally KES {pricing.baseNightlyRate.toLocaleString()} / night
                  </span>
                )}
              </span>
              <span className="text-foreground">KES {pricing.accommodationTotal.toLocaleString()}</span>
            </div>
            {pricing.cleaningFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cleaning fee</span>
                <span className="text-foreground">KES {pricing.cleaningFee.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service fee</span>
              <span className="text-foreground">KES {pricing.serviceFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t border-border">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">KES {pricing.total.toLocaleString()}</span>
            </div>
          </div>
        )}

        <Button 
          onClick={handleContinueToDetails}
          disabled={!pricing}
          className="w-full h-12 rounded-xl"
        >
          {pricing ? 'Continue' : 'Select dates'}
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Min. {apartment.minimum_nights} nights • Max. {apartment.maximum_nights} nights
        </p>
      </div>
    )
  }

  // Details step
  return (
    <div className="bg-card rounded-2xl p-6 boty-shadow">
      <h3 className="font-serif text-xl text-foreground mb-6">Complete Your Booking</h3>

      <form onSubmit={handleSubmitBooking} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="guestName">Full Name</Label>
          <Input
            id="guestName"
            name="guestName"
            value={formData.guestName}
            onChange={handleInputChange}
            required
            className="h-12 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="guestEmail">Email</Label>
          <Input
            id="guestEmail"
            name="guestEmail"
            type="email"
            value={formData.guestEmail}
            onChange={handleInputChange}
            required
            className="h-12 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="guestPhone">Phone</Label>
          <Input
            id="guestPhone"
            name="guestPhone"
            type="tel"
            placeholder="+254 7XX XXX XXX"
            value={formData.guestPhone}
            onChange={handleInputChange}
            required
            className="h-12 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
          <Textarea
            id="specialRequests"
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleInputChange}
            placeholder="Early check-in, late checkout, etc."
            className="rounded-xl resize-none"
            rows={3}
          />
        </div>

        <div className="space-y-3 pt-4">
          <Label className="text-sm font-medium">Payment Method</Label>
          <button
            type="button"
            onClick={() => setPaymentMethod('mpesa')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left boty-transition ${
              paymentMethod === 'mpesa' ? 'border-primary bg-primary/5' : 'border-border'
            }`}
          >
            <Smartphone className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">M-Pesa</p>
              <p className="text-xs text-muted-foreground">Pay with M-Pesa mobile money</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('cash_on_delivery')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left boty-transition ${
              paymentMethod === 'cash_on_delivery' ? 'border-primary bg-primary/5' : 'border-border'
            }`}
          >
            <Truck className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Pay at Check-in</p>
              <p className="text-xs text-muted-foreground">Pay when you arrive</p>
            </div>
          </button>
        </div>

        {paymentMethod === 'mpesa' && (
          <div className="space-y-2">
            <Label htmlFor="mpesaPhone">M-Pesa Phone Number</Label>
            <Input
              id="mpesaPhone"
              name="mpesaPhone"
              type="tel"
              placeholder="07XX XXX XXX"
              value={formData.mpesaPhone}
              onChange={handleInputChange}
              required
              className="h-12 rounded-xl"
            />
          </div>
        )}

        {pricing && (
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{pricing.nights} nights</span>
              <span className="text-foreground">KES {pricing.accommodationTotal.toLocaleString()}</span>
            </div>
            {pricing.cleaningFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cleaning fee</span>
                <span className="text-foreground">KES {pricing.cleaningFee.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service fee</span>
              <span className="text-foreground">KES {pricing.serviceFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t border-border">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">KES {pricing.total.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setStep('dates')}
            className="flex-1 h-12 rounded-xl"
          >
            Back
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="flex-1 h-12 rounded-xl"
          >
            {isSubmitting ? 'Processing...' : 'Confirm Booking'}
          </Button>
        </div>
      </form>
    </div>
  )
}
