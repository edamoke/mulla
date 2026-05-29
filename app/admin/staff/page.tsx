'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Users, Plus, Edit, Trash2, Phone, Mail, 
  Calendar, DollarSign, UserCheck, UserX
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface StaffMember {
  id: string
  user_id: string | null
  employee_id: string | null
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  role: string
  department: string | null
  hire_date: string | null
  salary: number | null
  commission_rate: number | null
  is_active: boolean
  created_at: string
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [filter, setFilter] = useState<string>('all')
  
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'sales',
    department: '',
    salary: '',
    commission_rate: ''
  })

  const supabase = createClient()

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setStaff(data)
    }
    setIsLoading(false)
  }

  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name) return

    const staffData = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email || null,
      phone: form.phone || null,
      role: form.role,
      department: form.department || null,
      salary: form.salary ? parseFloat(form.salary) : null,
      commission_rate: form.commission_rate ? parseFloat(form.commission_rate) : null,
      employee_id: editingStaff?.employee_id || `EMP-${Date.now().toString(36).toUpperCase()}`
    }

    if (editingStaff) {
      const { error } = await supabase
        .from('staff')
        .update(staffData)
        .eq('id', editingStaff.id)

      if (!error) {
        setEditingStaff(null)
        fetchStaff()
      }
    } else {
      const { error } = await supabase
        .from('staff')
        .insert(staffData)

      if (!error) {
        setShowAddStaff(false)
        resetForm()
        fetchStaff()
      }
    }
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('staff')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (!error) fetchStaff()
  }

  const deleteStaff = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return

    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id)

    if (!error) fetchStaff()
  }

  const resetForm = () => {
    setForm({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: 'sales',
      department: '',
      salary: '',
      commission_rate: ''
    })
  }

  const openEditModal = (staffMember: StaffMember) => {
    setForm({
      first_name: staffMember.first_name,
      last_name: staffMember.last_name,
      email: staffMember.email || '',
      phone: staffMember.phone || '',
      role: staffMember.role,
      department: staffMember.department || '',
      salary: staffMember.salary?.toString() || '',
      commission_rate: staffMember.commission_rate?.toString() || ''
    })
    setEditingStaff(staffMember)
  }

  const filteredStaff = staff.filter(s => 
    filter === 'all' || s.role === filter
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700'
      case 'manager': return 'bg-blue-100 text-blue-700'
      case 'sales': return 'bg-green-100 text-green-700'
      case 'cleaner': return 'bg-orange-100 text-orange-700'
      case 'maintenance': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Stats
  const totalStaff = staff.length
  const activeStaff = staff.filter(s => s.is_active).length
  const totalSalaries = staff.filter(s => s.is_active).reduce((sum, s) => sum + (s.salary || 0), 0)

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
                <h1 className="text-xl font-semibold">Staff Management</h1>
                <p className="text-sm text-muted-foreground">Manage employees and roles</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm()
                setShowAddStaff(true)
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Staff
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{totalStaff}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{activeStaff}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Payroll</p>
                <p className="text-2xl font-bold">{formatCurrency(totalSalaries)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Role Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all', 'admin', 'manager', 'sales', 'cleaner', 'maintenance'].map(role => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors capitalize ${
                filter === role 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-accent hover:bg-accent/80'
              }`}
            >
              {role === 'all' ? 'All Roles' : role}
            </button>
          ))}
        </div>

        {/* Staff Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-accent/50">
              <tr>
                <th className="text-left p-4 font-medium">Employee</th>
                <th className="text-left p-4 font-medium">Role</th>
                <th className="text-left p-4 font-medium">Contact</th>
                <th className="text-left p-4 font-medium">Department</th>
                <th className="text-right p-4 font-medium">Salary</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStaff.map(member => (
                <tr key={member.id} className="hover:bg-accent/30">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{member.first_name} {member.last_name}</p>
                      <p className="text-sm text-muted-foreground">{member.employee_id}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRoleColor(member.role)}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      {member.email && (
                        <p className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {member.email}
                        </p>
                      )}
                      {member.phone && (
                        <p className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {member.phone}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {member.department || '-'}
                  </td>
                  <td className="p-4 text-right font-medium">
                    {member.salary ? formatCurrency(member.salary) : '-'}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleStatus(member.id, member.is_active)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {member.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(member)}
                        className="p-2 hover:bg-accent rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteStaff(member.id)}
                        className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStaff.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No staff members found
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Staff Modal */}
      {(showAddStaff || editingStaff) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card rounded-2xl w-full max-w-md p-6 my-8">
            <h2 className="text-xl font-semibold mb-6">
              {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name *</label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => setForm({...form, first_name: e.target.value})}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => setForm({...form, last_name: e.target.value})}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({...form, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({...form, role: e.target.value})}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                  >
                    <option value="sales">Sales</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="cleaner">Cleaner</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Department</label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm({...form, department: e.target.value})}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Salary (KES)</label>
                  <input
                    type="number"
                    value={form.salary}
                    onChange={(e) => setForm({...form, salary: e.target.value})}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Commission %</label>
                  <input
                    type="number"
                    value={form.commission_rate}
                    onChange={(e) => setForm({...form, commission_rate: e.target.value})}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddStaff(false)
                  setEditingStaff(null)
                  resetForm()
                }}
                className="flex-1 py-3 bg-accent rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
              >
                {editingStaff ? 'Save Changes' : 'Add Staff'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
