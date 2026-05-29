'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Package, AlertTriangle, Plus, Minus, Search, 
  Filter, Download, Upload, TrendingUp, TrendingDown, History,
  LayoutDashboard, ShoppingCart, Calendar, Users, Settings, Home,
  Receipt, Sparkles, Calculator, UserCircle, FileText, CreditCard, Boxes
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Product {
  id: string
  name: string
  sku: string | null
  stock_quantity: number
  low_stock_threshold: number
  cost_price: number | null
  price: number
  category: { name: string } | null
}

interface InventoryTransaction {
  id: string
  product_id: string
  transaction_type: string
  quantity: number
  unit_cost: number | null
  notes: string | null
  created_at: string
  product: { name: string } | null
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all')
  const [showAdjustment, setShowAdjustment] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove' | 'set'>('add')
  const [adjustmentQty, setAdjustmentQty] = useState('')
  const [adjustmentNotes, setAdjustmentNotes] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  const supabase = createClient()

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin", active: false },
    { icon: CreditCard, label: "POS", href: "/admin/pos", active: false },
    { icon: Package, label: "Products", href: "/admin/products", active: false },
    { icon: Boxes, label: "Inventory", href: "/admin/inventory", active: true },
    { icon: ShoppingCart, label: "Orders", href: "/admin/orders", active: false },
    { icon: Home, label: "Apartments", href: "/admin/apartments", active: false },
    { icon: Calendar, label: "Bookings", href: "/admin/bookings", active: false },
    { icon: Receipt, label: "Rent Collection", href: "/admin/rent", active: false },
    { icon: Sparkles, label: "Cleaning", href: "/admin/cleaning", active: false },
    { icon: Calculator, label: "Accounting", href: "/admin/accounting", active: false },
    { icon: UserCircle, label: "CRM", href: "/admin/crm", active: false },
    { icon: Users, label: "Staff", href: "/admin/staff", active: false },
    { icon: FileText, label: "CMS", href: "/admin/cms", active: false },
    { icon: Settings, label: "Settings", href: "/admin/settings", active: false },
  ]

  useEffect(() => {
    fetchProducts()
    fetchTransactions()
  }, [])

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku, stock_quantity, low_stock_threshold, cost_price, price, category:categories(name)')
      .order('name')

    if (!error && data) {
      setProducts(data as Product[])
    }
    setIsLoading(false)
  }

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .select('*, product:products(name)')
      .order('created_at', { ascending: false })
      .limit(100)

    if (!error && data) {
      setTransactions(data as InventoryTransaction[])
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filter === 'low') {
      return matchesSearch && product.stock_quantity <= product.low_stock_threshold && product.stock_quantity > 0
    }
    if (filter === 'out') {
      return matchesSearch && product.stock_quantity <= 0
    }
    return matchesSearch
  })

  const handleAdjustment = async () => {
    if (!selectedProduct || !adjustmentQty) return

    const qty = parseInt(adjustmentQty)
    let newQty: number
    let changeQty: number

    switch (adjustmentType) {
      case 'add':
        newQty = selectedProduct.stock_quantity + qty
        changeQty = qty
        break
      case 'remove':
        newQty = Math.max(0, selectedProduct.stock_quantity - qty)
        changeQty = -qty
        break
      case 'set':
        newQty = qty
        changeQty = qty - selectedProduct.stock_quantity
        break
      default:
        return
    }

    // Update product stock
    const { error: updateError } = await supabase
      .from('products')
      .update({ stock_quantity: newQty })
      .eq('id', selectedProduct.id)

    if (updateError) {
      alert('Failed to update stock')
      return
    }

    // Record transaction
    await supabase
      .from('inventory_transactions')
      .insert({
        product_id: selectedProduct.id,
        transaction_type: 'adjustment',
        quantity: changeQty,
        notes: adjustmentNotes || `Manual ${adjustmentType}: ${qty} units`
      })

    setShowAdjustment(false)
    setSelectedProduct(null)
    setAdjustmentQty('')
    setAdjustmentNotes('')
    fetchProducts()
    fetchTransactions()
  }

  const totalValue = products.reduce((sum, p) => 
    sum + (p.cost_price || p.price * 0.6) * p.stock_quantity, 0
  )
  const lowStockCount = products.filter(p => p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0).length
  const outOfStockCount = products.filter(p => p.stock_quantity <= 0).length

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border/50 z-50 hidden lg:block">
        <div className="p-6">
          <Link href="/" className="font-serif text-2xl text-foreground font-semibold">
            Mulla
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Admin Dashboard</p>
        </div>
        <nav className="px-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium boty-transition ${
                item.active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 flex-1 overflow-auto">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6">
          <div>
            <h1 className="text-xl font-semibold">Inventory Management</h1>
            <p className="text-xs text-muted-foreground">Track and manage stock levels</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                showHistory ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'
              }`}
            >
              <History className="w-4 h-4" />
              History
            </button>
          </div>
        </header>

        <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold">{outOfStockCount}</p>
              </div>
            </div>
          </div>
        </div>

        {showHistory ? (
          /* Transaction History */
          <div className="bg-card border border-border rounded-xl">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold">Recent Transactions</h2>
            </div>
            <div className="divide-y divide-border">
              {transactions.map(tx => (
                <div key={tx.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{tx.product?.name || 'Unknown Product'}</p>
                    <p className="text-sm text-muted-foreground">
                      {tx.transaction_type.charAt(0).toUpperCase() + tx.transaction_type.slice(1)}
                      {tx.notes && ` - ${tx.notes}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.quantity >= 0 ? '+' : ''}{tx.quantity}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString('en-KE')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:bg-accent'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('low')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'low' ? 'bg-yellow-600 text-white' : 'bg-card border border-border hover:bg-accent'
                  }`}
                >
                  Low Stock
                </button>
                <button
                  onClick={() => setFilter('out')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'out' ? 'bg-red-600 text-white' : 'bg-card border border-border hover:bg-accent'
                  }`}
                >
                  Out of Stock
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-accent/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Product</th>
                    <th className="text-left p-4 font-medium">SKU</th>
                    <th className="text-left p-4 font-medium">Category</th>
                    <th className="text-right p-4 font-medium">Stock</th>
                    <th className="text-right p-4 font-medium">Value</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-accent/30">
                      <td className="p-4">
                        <p className="font-medium">{product.name}</p>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {product.sku || '-'}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {product.category?.name || '-'}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                          product.stock_quantity <= 0 
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : product.stock_quantity <= product.low_stock_threshold
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {formatCurrency((product.cost_price || product.price * 0.6) * product.stock_quantity)}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedProduct(product)
                            setShowAdjustment(true)
                          }}
                          className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Adjustment Modal */}
      {showAdjustment && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Adjust Stock</h2>
            <p className="text-muted-foreground mb-4">{selectedProduct.name}</p>
            <p className="mb-6">Current Stock: <span className="font-semibold">{selectedProduct.stock_quantity}</span></p>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setAdjustmentType('add')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
                  adjustmentType === 'add' ? 'bg-green-600 text-white' : 'bg-accent'
                }`}
              >
                <Plus className="w-4 h-4" /> Add
              </button>
              <button
                onClick={() => setAdjustmentType('remove')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
                  adjustmentType === 'remove' ? 'bg-red-600 text-white' : 'bg-accent'
                }`}
              >
                <Minus className="w-4 h-4" /> Remove
              </button>
              <button
                onClick={() => setAdjustmentType('set')}
                className={`flex-1 py-2 rounded-lg ${
                  adjustmentType === 'set' ? 'bg-blue-600 text-white' : 'bg-accent'
                }`}
              >
                Set
              </button>
            </div>

            <input
              type="number"
              value={adjustmentQty}
              onChange={(e) => setAdjustmentQty(e.target.value)}
              placeholder="Quantity"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg mb-4"
            />

            <textarea
              value={adjustmentNotes}
              onChange={(e) => setAdjustmentNotes(e.target.value)}
              placeholder="Notes (optional)"
              rows={2}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAdjustment(false)
                  setSelectedProduct(null)
                }}
                className="flex-1 py-3 bg-accent rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustment}
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  )
}
