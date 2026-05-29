'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, DollarSign, TrendingUp, TrendingDown, Receipt, 
  Plus, FileText, Download, Calendar, PieChart
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Expense {
  id: string
  expense_number: string
  category: string
  amount: number
  vendor: string | null
  description: string | null
  expense_date: string
  status: string
}

interface Account {
  id: string
  account_code: string
  account_name: string
  account_type: string
}

export default function AccountingPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'accounts'>('overview')
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('month')
  
  // Expense form
  const [expenseForm, setExpenseForm] = useState({
    category: '',
    amount: '',
    vendor: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash'
  })

  // Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
    orderCount: 0,
    avgOrderValue: 0
  })

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const getDateFilter = () => {
    const now = new Date()
    switch (dateRange) {
      case 'today':
        return now.toISOString().split('T')[0]
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7))
        return weekAgo.toISOString().split('T')[0]
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
        return monthAgo.toISOString().split('T')[0]
      case 'year':
        const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1))
        return yearAgo.toISOString().split('T')[0]
    }
  }

  const fetchData = async () => {
    setIsLoading(true)
    const dateFilter = getDateFilter()

    // Fetch expenses
    const { data: expensesData } = await supabase
      .from('expenses')
      .select('*')
      .gte('expense_date', dateFilter)
      .order('expense_date', { ascending: false })

    if (expensesData) setExpenses(expensesData)

    // Fetch accounts
    const { data: accountsData } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .eq('is_active', true)
      .order('account_code')

    if (accountsData) setAccounts(accountsData)

    // Fetch revenue from orders
    const { data: ordersData } = await supabase
      .from('orders')
      .select('total')
      .eq('payment_status', 'paid')
      .gte('created_at', dateFilter)

    // Fetch POS revenue
    const { data: posData } = await supabase
      .from('pos_transactions')
      .select('total')
      .eq('status', 'completed')
      .gte('created_at', dateFilter)

    // Fetch apartment revenue
    const { data: bookingsData } = await supabase
      .from('apartment_bookings')
      .select('total')
      .eq('payment_status', 'paid')
      .gte('created_at', dateFilter)

    // Fetch rent payments
    const { data: rentData } = await supabase
      .from('rent_payments')
      .select('amount_paid')
      .eq('status', 'paid')
      .gte('created_at', dateFilter)

    // Fetch cleaning revenue
    const { data: cleaningData } = await supabase
      .from('cleaning_bookings')
      .select('total')
      .eq('payment_status', 'paid')
      .gte('created_at', dateFilter)

    const orderRevenue = ordersData?.reduce((sum, o) => sum + (o.total || 0), 0) || 0
    const posRevenue = posData?.reduce((sum, p) => sum + (p.total || 0), 0) || 0
    const bookingRevenue = bookingsData?.reduce((sum, b) => sum + (b.total || 0), 0) || 0
    const rentRevenue = rentData?.reduce((sum, r) => sum + (r.amount_paid || 0), 0) || 0
    const cleaningRevenue = cleaningData?.reduce((sum, c) => sum + (c.total || 0), 0) || 0
    
    const totalRevenue = orderRevenue + posRevenue + bookingRevenue + rentRevenue + cleaningRevenue
    const totalExpenses = expensesData?.reduce((sum, e) => sum + e.amount, 0) || 0
    const orderCount = (ordersData?.length || 0) + (posData?.length || 0)

    setStats({
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      orderCount,
      avgOrderValue: orderCount > 0 ? totalRevenue / orderCount : 0
    })

    setIsLoading(false)
  }

  const handleAddExpense = async () => {
    if (!expenseForm.category || !expenseForm.amount) return

    const { error } = await supabase
      .from('expenses')
      .insert({
        expense_number: `EXP-${Date.now()}`,
        category: expenseForm.category,
        amount: parseFloat(expenseForm.amount),
        vendor: expenseForm.vendor || null,
        description: expenseForm.description || null,
        expense_date: expenseForm.expense_date,
        payment_method: expenseForm.payment_method,
        status: 'approved'
      })

    if (!error) {
      setShowAddExpense(false)
      setExpenseForm({
        category: '',
        amount: '',
        vendor: '',
        description: '',
        expense_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash'
      })
      fetchData()
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const expenseCategories = [
    'Salaries & Wages',
    'Rent',
    'Utilities',
    'Marketing',
    'Supplies',
    'Transport',
    'Inventory Purchase',
    'Equipment',
    'Maintenance',
    'Taxes',
    'Insurance',
    'Other'
  ]

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
                <h1 className="text-xl font-semibold">Accounting</h1>
                <p className="text-sm text-muted-foreground">Financial overview and expense tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="px-4 py-2 bg-accent rounded-lg text-sm"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </select>
              <button
                onClick={() => setShowAddExpense(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['overview', 'expenses', 'accounts'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                activeTab === tab 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-accent hover:bg-accent/80'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalExpenses)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${stats.netIncome >= 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-red-100 dark:bg-red-900/30'} rounded-lg flex items-center justify-center`}>
                    <DollarSign className={`w-5 h-5 ${stats.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Net Income</p>
                    <p className={`text-2xl font-bold ${stats.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatCurrency(stats.netIncome)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Transactions</p>
                    <p className="text-2xl font-bold">{stats.orderCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Expenses */}
            <div className="bg-card border border-border rounded-xl">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold">Recent Expenses</h2>
                <button 
                  onClick={() => setActiveTab('expenses')}
                  className="text-sm text-primary hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="divide-y divide-border">
                {expenses.slice(0, 5).map(expense => (
                  <div key={expense.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{expense.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {expense.vendor || expense.description || 'No description'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">-{formatCurrency(expense.amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(expense.expense_date).toLocaleDateString('en-KE')}
                      </p>
                    </div>
                  </div>
                ))}
                {expenses.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No expenses recorded yet
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'expenses' && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-accent/50">
                <tr>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Category</th>
                  <th className="text-left p-4 font-medium">Vendor</th>
                  <th className="text-left p-4 font-medium">Description</th>
                  <th className="text-right p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-accent/30">
                    <td className="p-4">
                      {new Date(expense.expense_date).toLocaleDateString('en-KE')}
                    </td>
                    <td className="p-4">{expense.category}</td>
                    <td className="p-4 text-muted-foreground">{expense.vendor || '-'}</td>
                    <td className="p-4 text-muted-foreground">{expense.description || '-'}</td>
                    <td className="p-4 text-right font-semibold text-red-600">
                      -{formatCurrency(expense.amount)}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {expense.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="grid gap-4">
            {['asset', 'liability', 'equity', 'revenue', 'expense'].map(type => (
              <div key={type} className="bg-card border border-border rounded-xl">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold capitalize">{type} Accounts</h3>
                </div>
                <div className="divide-y divide-border">
                  {accounts
                    .filter(a => a.account_type === type)
                    .map(account => (
                      <div key={account.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{account.account_name}</p>
                          <p className="text-sm text-muted-foreground">{account.account_code}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-6">Add Expense</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                >
                  <option value="">Select category</option>
                  {expenseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Amount (KES)</label>
                <input
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Vendor/Payee</label>
                <input
                  type="text"
                  value={expenseForm.vendor}
                  onChange={(e) => setExpenseForm({...expenseForm, vendor: e.target.value})}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                  placeholder="Enter vendor name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={expenseForm.expense_date}
                  onChange={(e) => setExpenseForm({...expenseForm, expense_date: e.target.value})}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                  rows={2}
                  placeholder="Add notes..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddExpense(false)}
                className="flex-1 py-3 bg-accent rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
              >
                Save Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
