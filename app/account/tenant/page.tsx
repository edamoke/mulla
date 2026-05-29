"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, Home, Calendar, DollarSign, AlertCircle, 
  CheckCircle, Clock, CreditCard, Download, FileText, Smartphone 
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { Button } from "@/components/ui/button"

interface RentPayment {
  id: string
  payment_number: string
  apartment: { name: string, unit_number: string | null } | null
  tenant_name: string
  period_start: string
  period_end: string
  rent_amount: number
  utilities_amount: number
  other_charges: number
  late_fee: number
  discount: number
  total_due: number
  amount_paid: number
  balance: number
  due_date: string
  status: string
  payment_method: string | null
  payment_date: string | null
  created_at: string
}

export default function TenantPortalPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  const [payments, setPayments] = useState<RentPayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPayModal, setShowPayModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<RentPayment | null>(null)
  const [payAmount, setPayAmount] = useState("")
  const [payPhone, setPayPhone] = useState("")
  const [isPaying, setIsPaying] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/account/tenant")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && profile) {
      fetchTenantData()
    }
  }, [user, profile])

  const fetchTenantData = async () => {
    setIsLoading(true)
    const fullName = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim()
    
    const { data, error } = await supabase
      .from("rent_payments")
      .select("*, apartment:apartments(name, unit_number)")
      .eq("tenant_name", fullName)
      .order("due_date", { ascending: false })

    if (!error && data) {
      setPayments(data as RentPayment[])
    }
    setIsLoading(false)
  }

  const handlePayRent = async () => {
    if (!selectedPayment || !payAmount) return
    setIsPaying(true)

    const amount = parseFloat(payAmount)
    const newTotalPaid = (selectedPayment.amount_paid || 0) + amount
    const newBalance = selectedPayment.total_due - newTotalPaid
    const newStatus = newBalance <= 0 ? "paid" : newBalance < selectedPayment.total_due ? "partial" : "pending"

    // Simulate STK push trigger/processing delay
    await new Promise(resolve => setTimeout(resolve, 3000))

    const { error } = await supabase
      .from("rent_payments")
      .update({
        amount_paid: newTotalPaid,
        balance: Math.max(0, newBalance),
        payment_method: "mpesa",
        payment_date: new Date().toISOString().split("T")[0],
        status: newStatus
      })
      .eq("id", selectedPayment.id)

    setIsPaying(false)
    if (!error) {
      setPaymentSuccess(true)
      setTimeout(() => {
        setShowPayModal(false)
        setPaymentSuccess(false)
        setSelectedPayment(null)
        setPayAmount("")
        fetchTenantData()
      }, 2000)
    } else {
      alert("Payment failed. Please try again.")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold uppercase">Paid</span>
      case "partial":
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold uppercase">Partial</span>
      case "pending":
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold uppercase">Pending</span>
      case "overdue":
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold uppercase">Overdue</span>
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold uppercase">{status}</span>
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/account" className="p-2 hover:bg-muted rounded-lg boty-transition">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
            <div>
              <h1 className="font-serif text-3xl text-foreground">Tenant Portal</h1>
              <p className="text-muted-foreground">Manage your lease, view statements, and pay rent</p>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="bg-card border border-border/50 rounded-2xl p-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-xl font-serif text-foreground mb-2">No Active Leases found</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                We couldn't find any active tenant lease agreements associated with your profile name ({profile?.first_name} {profile?.last_name}). Contact administration if this is an error.
              </p>
              <Button onClick={() => router.push("/apartments")}>
                Explore Apartments
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Active Lease Overview card */}
              {payments.map((payment, idx) => {
                if (idx > 0) return null // Only show active/latest lease card on top
                return (
                  <div key={payment.id} className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border/50 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          <Home className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h2 className="font-serif text-xl text-foreground font-semibold">
                            {payment.apartment?.name || "Your Leased Residence"}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {payment.apartment?.unit_number ? `Unit Number: ${payment.apartment.unit_number}` : "Leased Apartment"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm text-muted-foreground">Current Status</span>
                        <div className="mt-1">{getStatusBadge(payment.status)}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="bg-muted/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Calendar className="w-4 h-4" />
                          <span>Lease Period</span>
                        </div>
                        <p className="font-medium text-foreground">
                          {new Date(payment.period_start).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })} - 
                          {new Date(payment.period_end).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>

                      <div className="bg-muted/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <DollarSign className="w-4 h-4" />
                          <span>Monthly Base Rent</span>
                        </div>
                        <p className="font-bold text-foreground text-lg">
                          {formatCurrency(payment.rent_amount)}
                        </p>
                      </div>

                      <div className="bg-muted/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>Outstanding Balance</span>
                        </div>
                        <p className={`font-bold text-lg ${payment.balance > 0 ? "text-red-600 animate-pulse" : "text-green-600"}`}>
                          {formatCurrency(payment.balance)}
                        </p>
                      </div>
                    </div>

                    {payment.balance > 0 && (
                      <div className="mt-6 pt-6 border-t border-border/50 flex justify-end">
                        <Button 
                          onClick={() => {
                            setSelectedPayment(payment)
                            setPayAmount(payment.balance.toString())
                            setPayPhone(profile?.phone || "")
                            setShowPayModal(true)
                          }}
                          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 boty-transition font-medium shadow-md"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay Rent / Balance
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Payment & Invoice Ledger History */}
              <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border/50">
                  <h2 className="font-serif text-xl font-semibold text-foreground">Rent Payment Ledger & Statements</h2>
                  <p className="text-sm text-muted-foreground">Historical records of invoices and rent receipts</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr className="border-b border-border/50 text-left">
                        <th className="p-4 text-xs font-semibold text-muted-foreground uppercase">Reference ID</th>
                        <th className="p-4 text-xs font-semibold text-muted-foreground uppercase">Billing Period</th>
                        <th className="p-4 text-xs font-semibold text-muted-foreground uppercase text-right">Rent</th>
                        <th className="p-4 text-xs font-semibold text-muted-foreground uppercase text-right">Utilities</th>
                        <th className="p-4 text-xs font-semibold text-muted-foreground uppercase text-right">Total Due</th>
                        <th className="p-4 text-xs font-semibold text-muted-foreground uppercase text-right">Amount Paid</th>
                        <th className="p-4 text-xs font-semibold text-muted-foreground uppercase text-right">Balance</th>
                        <th className="p-4 text-xs font-semibold text-muted-foreground uppercase">Due Date</th>
                        <th className="p-4 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {payments.map(payment => (
                        <tr key={payment.id} className="hover:bg-muted/10 text-sm">
                          <td className="p-4 font-mono font-medium text-foreground">{payment.payment_number}</td>
                          <td className="p-4 text-muted-foreground">
                            {new Date(payment.period_start).toLocaleDateString("en-KE", { month: "short", day: "numeric" })} - 
                            {new Date(payment.period_end).toLocaleDateString("en-KE", { month: "short", day: "numeric" })}
                          </td>
                          <td className="p-4 text-right text-foreground">{formatCurrency(payment.rent_amount)}</td>
                          <td className="p-4 text-right text-muted-foreground">{formatCurrency(payment.utilities_amount)}</td>
                          <td className="p-4 text-right font-medium text-foreground">{formatCurrency(payment.total_due)}</td>
                          <td className="p-4 text-right text-green-600">{formatCurrency(payment.amount_paid || 0)}</td>
                          <td className="p-4 text-right font-semibold text-red-600">{formatCurrency(payment.balance)}</td>
                          <td className="p-4 text-muted-foreground">{new Date(payment.due_date).toLocaleDateString("en-KE")}</td>
                          <td className="p-4">{getStatusBadge(payment.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Pay Rent Modal */}
      {showPayModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border/50 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Pay Rent Balance</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Securely make payments using M-Pesa STK push.
            </p>

            {paymentSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">M-Pesa Payment Successful</h3>
                <p className="text-sm text-muted-foreground">Your rent statement and balance have been updated.</p>
              </div>
            ) : isPaying ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <Smartphone className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Processing Payment...</h3>
                <p className="text-sm text-muted-foreground">
                  A push request has been sent to <span className="font-semibold text-foreground">{payPhone}</span>. Please enter your M-Pesa PIN on your phone.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Due Amount</span>
                    <span className="font-semibold text-foreground">{formatCurrency(selectedPayment.total_due)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Paid Amount</span>
                    <span className="font-semibold text-green-600">{formatCurrency(selectedPayment.amount_paid || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-border/50 pt-2 font-medium">
                    <span className="text-foreground">Balance Owed</span>
                    <span className="text-red-600">{formatCurrency(selectedPayment.balance)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Phone Number (M-Pesa) *</label>
                  <input
                    type="tel"
                    value={payPhone}
                    onChange={(e) => setPayPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                    placeholder="e.g. 0711223344"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Payment Amount (KES) *</label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                    placeholder="Enter amount to pay"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPayModal(false)
                      setSelectedPayment(null)
                    }}
                    className="flex-1 rounded-xl h-12"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePayRent}
                    className="flex-1 rounded-xl h-12"
                    disabled={!payPhone || !payAmount}
                  >
                    Request STK Push
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
