'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, Search, Plus, Minus, Trash2, User, CreditCard, 
  Smartphone, Banknote, X, Check, Receipt
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'

interface CartItem {
  product: Product
  quantity: number
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<{id: string, name: string}[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa' | 'card'>('cash')
  const [amountPaid, setAmountPaid] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [discount, setDiscount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (!error && data) {
      setProducts(data)
    }
    setIsLoading(false)
  }

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true)
      .order('sort_order')

    if (!error && data) {
      setCategories(data)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (product: Product) => {
    setCart(current => {
      const existing = current.find(item => item.product.id === product.id)
      if (existing) {
        return current.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...current, { product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart(current =>
      current
        .map(item =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter(item => item.quantity > 0)
    )
  }

  const removeFromCart = (productId: string) => {
    setCart(current => current.filter(item => item.product.id !== productId))
  }

  const clearCart = () => {
    setCart([])
    setDiscount(0)
    setCustomerName('')
    setCustomerPhone('')
  }

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const discountAmount = subtotal * (discount / 100)
  const total = subtotal - discountAmount
  const change = paymentMethod === 'cash' ? Math.max(0, parseFloat(amountPaid || '0') - total) : 0

  const processPayment = async () => {
    if (cart.length === 0) return
    
    setIsProcessing(true)

    try {
      // Create POS transaction
      const { data: transaction, error: txError } = await supabase
        .from('pos_transactions')
        .insert({
          transaction_number: `POS-${Date.now()}`,
          customer_name: customerName || null,
          customer_phone: customerPhone || null,
          transaction_type: 'sale',
          payment_method: paymentMethod,
          subtotal,
          discount_amount: discountAmount,
          total,
          amount_paid: paymentMethod === 'cash' ? parseFloat(amountPaid) : total,
          change_given: change,
          status: 'completed'
        })
        .select()
        .single()

      if (txError) throw txError

      // Add transaction items
      const items = cart.map(item => ({
        transaction_id: transaction.id,
        product_id: item.product.id,
        product_name: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('pos_transaction_items')
        .insert(items)

      if (itemsError) throw itemsError

      // Update inventory
      for (const item of cart) {
        await supabase
          .from('products')
          .update({ 
            stock_quantity: (item.product.stock_quantity || 0) - item.quantity 
          })
          .eq('id', item.product.id)

        await supabase
          .from('inventory_transactions')
          .insert({
            product_id: item.product.id,
            transaction_type: 'sale',
            quantity: -item.quantity,
            reference_type: 'pos_transaction',
            reference_id: transaction.id
          })
      }

      setLastTransaction({
        ...transaction,
        items: cart,
        change
      })
      setShowPayment(false)
      clearCart()
      setAmountPaid('')
      fetchProducts() // Refresh stock levels

    } catch (error) {
      console.error('Payment error:', error)
      alert('Failed to process payment')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Left Panel - Products */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 hover:bg-accent rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold">Point of Sale</h1>
                <p className="text-sm text-muted-foreground">Mulla Boutique</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-KE', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Search and Categories */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products or scan barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                !selectedCategory 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-accent hover:bg-accent/80'
              }`}
            >
              All Products
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-accent hover:bg-accent/80'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={(product.stock_quantity || 0) <= 0}
                  className={`bg-card border border-border rounded-xl p-3 text-left hover:border-primary transition-colors ${
                    (product.stock_quantity || 0) <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="aspect-square bg-accent rounded-lg mb-3 overflow-hidden relative">
                    {product.thumbnail_url && (
                      <Image
                        src={product.thumbnail_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                    {(product.stock_quantity || 0) <= 0 && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <span className="text-sm font-medium text-destructive">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                  <p className="text-primary font-semibold mt-1">{formatCurrency(product.price)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Stock: {product.stock_quantity || 0}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-96 bg-card border-l border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Current Sale</h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-sm text-destructive hover:text-destructive/80"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Receipt className="w-12 h-12 mb-4" />
              <p>No items in cart</p>
              <p className="text-sm">Click products to add them</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.product.id} className="bg-background rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-accent rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.thumbnail_url && (
                        <Image
                          src={item.product.thumbnail_url}
                          alt={item.product.name}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-1">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground">{formatCurrency(item.product.price)}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-8 h-8 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-8 h-8 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary */}
        <div className="border-t border-border p-4 space-y-4">
          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
            />
          </div>

          {/* Discount */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Discount:</span>
            <input
              type="number"
              min="0"
              max="100"
              value={discount}
              onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-20 px-3 py-1 bg-background border border-border rounded-lg text-sm text-center"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>

          {/* Totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({discount}%)</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Pay Button */}
          <button
            onClick={() => setShowPayment(true)}
            disabled={cart.length === 0}
            className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Charge {formatCurrency(total)}
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Payment</h2>
              <button
                onClick={() => setShowPayment(false)}
                className="p-2 hover:bg-accent rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-4xl font-bold text-primary">{formatCurrency(total)}</p>
            </div>

            {/* Payment Methods */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  paymentMethod === 'cash'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Banknote className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Cash</span>
              </button>
              <button
                onClick={() => setPaymentMethod('mpesa')}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  paymentMethod === 'mpesa'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Smartphone className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">M-Pesa</span>
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  paymentMethod === 'card'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <CreditCard className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Card</span>
              </button>
            </div>

            {/* Cash Input */}
            {paymentMethod === 'cash' && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Amount Received</label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-lg font-semibold text-center"
                />
                {parseFloat(amountPaid) >= total && (
                  <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Change</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(parseFloat(amountPaid) - total)}
                    </p>
                  </div>
                )}
                {/* Quick amounts */}
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[1000, 2000, 5000, 10000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setAmountPaid(amount.toString())}
                      className="py-2 bg-accent rounded-lg text-sm font-medium hover:bg-accent/80"
                    >
                      {amount.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* M-Pesa Info */}
            {paymentMethod === 'mpesa' && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Customer will receive STK push to:
                </p>
                <p className="font-semibold">{customerPhone || 'No phone number'}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  (Mock payment - will auto-complete)
                </p>
              </div>
            )}

            {/* Complete Payment */}
            <button
              onClick={processPayment}
              disabled={isProcessing || (paymentMethod === 'cash' && parseFloat(amountPaid) < total)}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Complete Sale
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {lastTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl w-full max-w-md p-6 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-4">
              Transaction #{lastTransaction.transaction_number}
            </p>
            <div className="bg-background rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">{formatCurrency(lastTransaction.total)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-semibold">{formatCurrency(lastTransaction.amount_paid)}</span>
              </div>
              {lastTransaction.change > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Change</span>
                  <span className="font-semibold">{formatCurrency(lastTransaction.change)}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setLastTransaction(null)}
                className="flex-1 py-3 bg-accent rounded-lg font-medium hover:bg-accent/80"
              >
                New Sale
              </button>
              <button
                onClick={() => {
                  // Print receipt logic would go here
                  setLastTransaction(null)
                }}
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
