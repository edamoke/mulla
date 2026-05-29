'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Home, Calendar, DollarSign, AlertCircle, 
  CheckCircle, Clock, Plus, User, Phone, Filter
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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

interface Apartment {
  id: string
  name: string
  unit_number: string | null
}

export default function RentCollectionPage() {
  const [payments, setPayments] = useState<RentPayment[]>([])
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddPayment, setShowAddPayment] = useState(false)
  const [showRecordPayment, setShowRecordPayment] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<RentPayment | null>(null)
  
  const [paymentForm, setPaymentForm] = useState({
    apartment_id: '',
    tenant_name: '',
    period_start: new Date().toISOString().split('T')[0],
    period_end: '',
    rent_amount: '',
    utilities_amount: '0',
    other_charges: '0',
    due_date: ''
  })

  const [recordForm, setRecordForm] = useState({
    amount_paid: '',
    payment_method: 'mpesa',
    payment_reference: ''
  })

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)

    const { data: paymentsData } = await supabase
      .from('rent_payments')
      .select('*, apartment:apartments(name, unit_number)')
      .order('due_date', { ascending: false })

    if (paymentsData) setPayments(paymentsData as RentPayment[])

    const { data: apartmentsData } = await supabase
      .from('apartments')
      .select('id, name, unit_number')
      .eq('is_available', false) // Only occupied apartments
      .order('name')

    if (apartmentsData) setApartments(apartmentsData)

    setIsLoading(false)
  }

  const handleAddPayment = async () => {
    if (!paymentForm.apartment_id || !paymentForm.tenant_name || !paymentForm.rent_amount) return

    const rentAmount = parseFloat(paymentForm.rent_amount)
    const utilitiesAmount = parseFloat(paymentForm.utilities_amount) || 0
    const otherCharges = parseFloat(paymentForm.other_charges) || 0
    const totalDue = rentAmount + utilitiesAmount + otherCharges

    const { error } = await supabase
      .from('rent_payments')
      .insert({
        payment_number: `RENT-${Date.now()}`,
        apartment_id: paymentForm.apartment_id,
        tenant_name: paymentForm.tenant_name,
        period_start: paymentForm.period_start,
        period_end: paymentForm.period_end,
        rent_amount: rentAmount,
        utilities_amount: utilitiesAmount,
        other_charges: otherCharges,
        total_due: totalDue,
        balance: totalDue,
        due_date: paymentForm.due_date,
        status: 'pending'
      })

    if (!error) {
      setShowAddPayment(false)
      setPaymentForm({
        apartment_id: '',
        tenant_name: '',
        period_start: new Date().toISOString().split('T')[0],
        period_end: '',
        rent_amount: '',
        utilities_amount: '0',
        other_charges: '0',
        due_date: ''
      })
      fetchData()
    }
  }

  const handleRecordPayment = async () => {
    if (!selectedPayment || !recordForm.amount_paid) return

    const amountPaid = parseFloat(recordForm.amount_paid)
    const newTotalPaid = (selectedPayment.amount_paid || 0) + amountPaid
    const newBalance = selectedPayment.total_due - newTotalPaid
    const newStatus = newBalance <= 0 ? 'paid' : newBalance < selectedPayment.total_due ? 'partial' : 'pending'

    const { error } = await supabase
      .from('rent_payments')
      .update({
        amount_paid: newTotalPaid,
        balance: Math.max(0, newBalance),
        payment_method: recordForm.payment_method,
        payment_date: new Date().toISOString().split('T')[0],
        status: newStatus
      })
      .eq('id', selectedPayment.id)

    if (!error) {
      setShowRecordPayment(false)
      setSelectedPayment(null)
      setRecordForm({
        amount_paid: '',
        payment_method: 'mpesa',
        payment_reference: ''
      })
      fetchData()
    }
  }

  const checkOverdue = async () => {
    const today = new Date().toISOString().split('T')[0]
    
    const { error } = await supabase
      .from('rent_payments')
      .update({ status: 'overdue' })
      .eq('status', 'pending')
      .lt('due_date', today)

    if (!error) fetchData()
  }

  useEffect(() => {
    checkOverdue()
  }, [])

  const filteredPayments = payments.filter(p => 
    statusFilter === 'all' || p.status === statusFilter
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700'
      case 'partial': return 'bg-blue-100 text-blue-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'overdue': return 'bg-red-100 text-red-700'
      case 'waived': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Stats
  const totalDue = payments.filter(p => ['pending', 'partial', 'overdue'].includes(p.status))
    .reduce((sum, p) => sum + p.balance, 0)
  const totalCollected = payments.reduce((sum, p) => sum + (p.amount_paid || 0), 0)
  const overdueCount = payments.filter(p => p.status === 'overdue').length
  const pendingCount = payments.filter(p => p.status === 'pending').length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 hover:bg-accent rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold">Rent Collection</h1>
                <p className="text-sm text-muted-foreground">Track and manage rent payments</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddPayment(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Rent Record
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collected</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCollected)}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalDue)}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all', 'pending', 'partial', 'paid', 'overdue'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                statusFilter === status 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-accent hover:bg-accent/80'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Payments Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-accent/50">
              <tr>
                <th className="text-left p-4 font-medium">Property</th>
                <th className="text-left p-4 font-medium">Tenant</th>
                <th className="text-left p-4 font-medium">Period</th>
                <th className="text-right p-4 font-medium">Amount Due</th>
                <th className="text-right p-4 font-medium">Paid</th>
                <th className="text-right p-4 font-medium">Balance</th>
                <th className="text-left p-4 font-medium">Due Date</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPayments.map(payment => (
                <tr key={payment.id} className="hover:bg-accent/30">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        {payment.apartment?.name || 'N/A'}
                        {payment.apartment?.unit_number && ` - ${payment.apartment.unit_number}`}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">{payment.tenant_name}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(payment.period_start).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })} - 
                    {new Date(payment.period_end).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="p-4 text-right font-medium">{formatCurrency(payment.total_due)}</td>
                  <td className="p-4 text-right text-green-600">{formatCurrency(payment.amount_paid || 0)}</td>
                  <td className="p-4 text-right font-semibold text-red-600">
                    {formatCurrency(payment.balance || payment.total_due)}
                  </td>
                  <td className="p-4">
                    {new Date(payment.due_date).toLocaleDateString('en-KE')}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {payment.status !== 'paid' && (
                      <button
                        onClick={() => {
                          setSelectedPayment(payment)
                          setShowRecordPayment(true)
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                      >
                        Record Payment
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPayments.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No rent records found
            </div>
          )}
        </div>
      </div>

      {/* Add Rent Record Modal */}
      {showAddPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card rounded-2xl w-full max-w-md p-6 my-8">
            <h2 className="text-xl font-semibold mb-6">Add Rent Record</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Property *</label>
                <select
                  value={paymentForm.apartment_id}
                  onChange={(e) => setPaymentForm({...paymentForm, apartment_id: e.target.value})}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                >
                  <option value="">Select property</option>
                  {apartments.map(apt => (
                    <option key={apt.id} value={apt.id}>
                      {apt.name} {apt.unit_number && `- ${apt.unit_number}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tenant Name *</label>
                <input
                  type="text"
                  value={paymentForm.tenant_name}
                  onChange={(e) => setPaymentForm({...paymentForm, tenant_name: e.target.value})}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Period Start</label>
                  <input
                    type="date"
                    value={paymentForm.period_start}
                    onChange={(e) => setPaymentForm({...paymentForm, period_start: e.target.value})}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Period End</label>
                  <input
                    type="date"
                    value={paymentForm.period_end}
                    onChange={(e) => setPaymentForm({...paymentForm, period_end: e.target.value})}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Rent Amount (KES) *</label>
                <input
                  type="number"
                  value={paymentForm.rent_amount}
                  onChange={(e) => setPaymentForm({...paymentForm, rent_amount: e.target.value})}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Utilities</label>
                  <input
                    type="number"
                    value={paymentForm.utilities_amount}
                    onChange={(e) => setPaymentForm({...paymentForm, utilities_amount: e.target.value})}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Other Charges</label>
                  <input
                    type="number"
                    value={paymentForm.other_charges}
                    onChange={(e) => setPaymentForm({...paymentForm, other_charges: e.target.value})}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Due Date *</label>
                <input
                  type="date"
                  value={paymentForm.due_date}
                  onChange={(e) => setPaymentForm({...paymentForm, due_date: e.target.value})}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddPayment(false)}
                className="flex-1 py-3 bg-accent rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPayment}
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
              >
                Add Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showRecordPayment && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Record Payment</h2>
            <p className="text-muted-foreground mb-2">{selectedPayment.apartment?.name}</p>
            <p className="text-sm text-muted-foreground mb-4">Tenant: {selectedPayment.tenant_name}</p>
            
            <div className="bg-background rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Total Due</span>
                <span className="font-semibold">{formatCurrency(selectedPayment.total_due)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Already Paid</span>
                <span className="text-green-600">{formatCurrency(selectedPayment.amount_paid || 0)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="font-medium">Balance</span>
                <span className="font-bold text-red-600">
                  {formatCurrency(selectedPayment.balance || selectedPayment.total_due)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount Received</label>
                <input
                  type="number"
                  value={recordForm.amount_paid}
                  onChange={(e) => setRecordForm({...recordForm, amount_paid: e.target.value})}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select
                  value={recordForm.payment_method}
                  onChange={(e) => setRecordForm({...recordForm, payment_method: e.target.value})}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                >
                  <option value="mpesa">M-Pesa</option>
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reference (optional)</label>
                <input
                  type="text"
                  value={recordForm.payment_reference}
                  onChange={(e) => setRecordForm({...recordForm, payment_reference: e.target.value})}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                  placeholder="Transaction ID"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRecordPayment(false)
                  setSelectedPayment(null)
                }}
                className="flex-1 py-3 bg-accent rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
