"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, Smartphone, CreditCard, Building2, Truck, Check, Loader2 } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useCart } from "@/components/boty/cart-context"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type PaymentMethod = 'mpesa' | 'card' | 'bank_transfer' | 'cash_on_delivery'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const { user, profile } = useAuth()
  
  const [step, setStep] = useState<'details' | 'payment' | 'processing' | 'success'>('details')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || '',
    address: profile?.address_line1 || '',
    city: profile?.city || 'Malindi',
    mpesaPhone: profile?.phone || '',
  })

  const shippingCost = total >= 10000 ? 0 : 500
  const orderTotal = total + shippingCost

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('payment')
  }

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStep('processing')

    try {
      // Create the order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            product_id: item.id,
            product_name: item.name,
            product_image: item.image,
            quantity: item.quantity,
            unit_price: item.price,
            size: item.size,
          })),
          subtotal: total,
          shipping_cost: shippingCost,
          total: orderTotal,
          payment_method: paymentMethod,
          customer_name: `${formData.firstName} ${formData.lastName}`,
          customer_email: formData.email,
          customer_phone: formData.phone,
          shipping_address: {
            line1: formData.address,
            city: formData.city,
            country: 'Kenya'
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      // Simulate M-Pesa STK push delay
      if (paymentMethod === 'mpesa') {
        await new Promise(resolve => setTimeout(resolve, 3000))
      }

      setOrderNumber(data.order_number)
      clearCart()
      setStep('success')
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to process order. Please try again.')
      setStep('payment')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0 && step !== 'success') {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="pt-28 pb-20">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h1 className="font-serif text-3xl text-foreground mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">Add some items to checkout</p>
            <Button asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          {/* Back Link */}
          {step !== 'success' && step !== 'processing' && (
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground boty-transition mb-8"
            >
              <ChevronLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          )}

          {/* Progress Steps */}
          {step !== 'success' && step !== 'processing' && (
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className={`flex items-center gap-2 ${step === 'details' ? 'text-foreground' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step === 'details' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  1
                </div>
                <span className="hidden sm:block text-sm">Details</span>
              </div>
              <div className="w-12 h-px bg-border" />
              <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-foreground' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  2
                </div>
                <span className="hidden sm:block text-sm">Payment</span>
              </div>
            </div>
          )}

          {/* Processing State */}
          {step === 'processing' && (
            <div className="max-w-md mx-auto text-center py-20">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <h2 className="font-serif text-2xl text-foreground mb-3">Processing Your Order</h2>
              {paymentMethod === 'mpesa' && (
                <p className="text-muted-foreground">
                  Please check your phone for the M-Pesa payment prompt and enter your PIN to complete the payment.
                </p>
              )}
            </div>
          )}

          {/* Success State */}
          {step === 'success' && (
            <div className="max-w-md mx-auto text-center py-20">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-serif text-2xl text-foreground mb-3">Order Confirmed!</h2>
              <p className="text-muted-foreground mb-2">
                Thank you for your order. Your order number is:
              </p>
              <p className="text-xl font-medium text-foreground mb-6">{orderNumber}</p>
              <p className="text-sm text-muted-foreground mb-8">
                We&apos;ve sent a confirmation email to {formData.email}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
                {user && (
                  <Button variant="outline" asChild>
                    <Link href="/account/orders">View Orders</Link>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Main Content */}
          {(step === 'details' || step === 'payment') && (
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Form Section */}
              <div className="lg:col-span-2">
                {step === 'details' && (
                  <form onSubmit={handleSubmitDetails} className="space-y-6">
                    <div className="bg-card rounded-2xl p-6 boty-shadow">
                      <h2 className="font-serif text-xl text-foreground mb-6">Contact Information</h2>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            className="h-12 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            className="h-12 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="h-12 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+254 7XX XXX XXX"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="h-12 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-card rounded-2xl p-6 boty-shadow">
                      <h2 className="font-serif text-xl text-foreground mb-6">Shipping Address</h2>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                            className="h-12 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="h-12 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-12 rounded-xl text-base">
                      Continue to Payment
                    </Button>
                  </form>
                )}

                {step === 'payment' && (
                  <form onSubmit={handleSubmitPayment} className="space-y-6">
                    <div className="bg-card rounded-2xl p-6 boty-shadow">
                      <h2 className="font-serif text-xl text-foreground mb-6">Payment Method</h2>
                      
                      <div className="space-y-3">
                        <PaymentOption
                          id="mpesa"
                          label="M-Pesa"
                          description="Pay with M-Pesa mobile money"
                          icon={Smartphone}
                          selected={paymentMethod === 'mpesa'}
                          onSelect={() => setPaymentMethod('mpesa')}
                        />
                        <PaymentOption
                          id="card"
                          label="Credit/Debit Card"
                          description="Pay with Visa or Mastercard"
                          icon={CreditCard}
                          selected={paymentMethod === 'card'}
                          onSelect={() => setPaymentMethod('card')}
                          disabled
                        />
                        <PaymentOption
                          id="bank_transfer"
                          label="Bank Transfer"
                          description="Pay via bank transfer"
                          icon={Building2}
                          selected={paymentMethod === 'bank_transfer'}
                          onSelect={() => setPaymentMethod('bank_transfer')}
                          disabled
                        />
                        <PaymentOption
                          id="cash_on_delivery"
                          label="Cash on Delivery"
                          description="Pay when you receive your order"
                          icon={Truck}
                          selected={paymentMethod === 'cash_on_delivery'}
                          onSelect={() => setPaymentMethod('cash_on_delivery')}
                        />
                      </div>
                    </div>

                    {paymentMethod === 'mpesa' && (
                      <div className="bg-card rounded-2xl p-6 boty-shadow">
                        <h3 className="font-medium text-foreground mb-4">M-Pesa Payment</h3>
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
                          <p className="text-xs text-muted-foreground">
                            You will receive an STK push to enter your M-Pesa PIN
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setStep('details')}
                        className="flex-1 h-12 rounded-xl"
                      >
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 h-12 rounded-xl text-base"
                      >
                        {isSubmitting ? 'Processing...' : `Pay KES ${orderTotal.toLocaleString()}`}
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl p-6 boty-shadow sticky top-28">
                  <h2 className="font-serif text-xl text-foreground mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={`${item.id}-${item.size}`} className="flex gap-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-foreground truncate">{item.name}</h3>
                          {item.size && <p className="text-xs text-muted-foreground">Size: {item.size}</p>}
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          KES {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">KES {total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-foreground">
                        {shippingCost === 0 ? 'Free' : `KES ${shippingCost.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-medium pt-3 border-t border-border">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">KES {orderTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  {total < 10000 && (
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      Spend KES {(10000 - total).toLocaleString()} more for free shipping
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}

function PaymentOption({
  id,
  label,
  description,
  icon: Icon,
  selected,
  onSelect,
  disabled = false
}: {
  id: string
  label: string
  description: string
  icon: React.ElementType
  selected: boolean
  onSelect: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left boty-transition ${
        selected
          ? 'border-primary bg-primary/5'
          : disabled
          ? 'border-border bg-muted/50 opacity-50 cursor-not-allowed'
          : 'border-border hover:border-primary/50'
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {disabled && (
        <span className="text-xs text-muted-foreground">Coming soon</span>
      )}
      {selected && !disabled && (
        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
    </button>
  )
}
