"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Calendar,
  Users,
  Settings,
  Home,
  Plus,
  Search,
  Edit,
  Trash2,
  CreditCard,
  Boxes,
  Calculator,
  Sparkles,
  Receipt,
  UserCircle,
  Bed,
  Bath,
  Maximize,
} from "lucide-react"

interface Apartment {
  id: string
  title: string
  name?: string
  slug: string
  description: string
  address: string
  city: string
  bedrooms: number
  bathrooms: number
  area_sqm: number
  price_per_month: number
  deposit_amount: number
  price_per_night?: number
  price_per_week?: number
  cleaning_fee?: number
  status: string
  amenities: string[]
  images: string[]
  is_featured: boolean
  created_at: string
}

export default function AdminApartmentsPage() {
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null)
  
  const supabase = createClient()


  useEffect(() => {
    fetchApartments()
  }, [])

  const fetchApartments = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("apartments")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setApartments(data)
    }
    setIsLoading(false)
  }

  const handleSaveApartment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const apartmentData = {
      title: formData.get("title") as string,
      name: formData.get("title") as string,
      slug: (formData.get("title") as string).toLowerCase().replace(/\s+/g, "-"),
      description: formData.get("description") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      bedrooms: parseInt(formData.get("bedrooms") as string),
      bathrooms: parseInt(formData.get("bathrooms") as string),
      area_sqm: parseFloat(formData.get("area_sqm") as string),
      price_per_month: parseFloat(formData.get("price_per_month") as string),
      deposit_amount: parseFloat(formData.get("deposit_amount") as string),
      price_per_night: parseFloat(formData.get("price_per_night") as string) || null,
      price_per_week: parseFloat(formData.get("price_per_week") as string) || null,
      cleaning_fee: parseFloat(formData.get("cleaning_fee") as string) || null,
      status: formData.get("status") as string,
      is_featured: formData.get("is_featured") === "true",
    }

    if (editingApartment) {
      await supabase
        .from("apartments")
        .update(apartmentData)
        .eq("id", editingApartment.id)
    } else {
      await supabase.from("apartments").insert([apartmentData])
    }

    setIsDialogOpen(false)
    setEditingApartment(null)
    fetchApartments()
  }

  const handleDeleteApartment = async (id: string) => {
    if (confirm("Are you sure you want to delete this apartment?")) {
      await supabase.from("apartments").delete().eq("id", id)
      fetchApartments()
    }
  }

  const filteredApartments = apartments.filter((apt) => {
    const titleText = (apt.title || apt.name || "").toLowerCase()
    const addressText = (apt.address || "").toLowerCase()
    const cityText = (apt.city || "").toLowerCase()
    const query = searchQuery.toLowerCase()

    const matchesSearch =
      titleText.includes(query) ||
      addressText.includes(query) ||
      cityText.includes(query)
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "occupied":
        return "bg-blue-100 text-blue-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="lg:ml-64 flex-1 overflow-auto">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6">
          <h1 className="text-xl font-semibold">Apartment Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingApartment(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Apartment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingApartment ? "Edit Apartment" : "Add New Apartment"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveApartment} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      defaultValue={editingApartment?.title}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      defaultValue={editingApartment?.city}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={editingApartment?.address}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    className="w-full rounded-md border px-3 py-2 text-sm min-h-[100px]"
                    defaultValue={editingApartment?.description}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      name="bedrooms"
                      type="number"
                      min="0"
                      defaultValue={editingApartment?.bedrooms || 1}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      name="bathrooms"
                      type="number"
                      min="0"
                      defaultValue={editingApartment?.bathrooms || 1}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area_sqm">Area (sqm)</Label>
                    <Input
                      id="area_sqm"
                      name="area_sqm"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={editingApartment?.area_sqm}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Short-Term Stay Options</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="price_per_night">Price Per Night (KES)</Label>
                      <Input
                        id="price_per_night"
                        name="price_per_night"
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={editingApartment?.price_per_night}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price_per_week">Price Per Week (KES)</Label>
                      <Input
                        id="price_per_week"
                        name="price_per_week"
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={editingApartment?.price_per_week}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cleaning_fee">Cleaning Fee (KES)</Label>
                      <Input
                        id="cleaning_fee"
                        name="cleaning_fee"
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={editingApartment?.cleaning_fee}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Long-Term Stay Options</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="price_per_month">Monthly Rent (KES)</Label>
                      <Input
                        id="price_per_month"
                        name="price_per_month"
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={editingApartment?.price_per_month}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deposit_amount">Deposit (KES)</Label>
                      <Input
                        id="deposit_amount"
                        name="deposit_amount"
                        type="number"
                        min="0"
                        step="0.01"
                        defaultValue={editingApartment?.deposit_amount}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      name="status"
                      defaultValue={editingApartment?.status || "available"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="occupied">Occupied</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="is_featured">Featured</Label>
                    <Select
                      name="is_featured"
                      defaultValue={editingApartment?.is_featured ? "true" : "false"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Featured?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingApartment ? "Update" : "Create"} Apartment
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Home className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Units</p>
                    <p className="text-2xl font-semibold">{apartments.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-100 p-2">
                    <Home className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available</p>
                    <p className="text-2xl font-semibold">
                      {apartments.filter((a) => a.status === "available").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Home className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Occupied</p>
                    <p className="text-2xl font-semibold">
                      {apartments.filter((a) => a.status === "occupied").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-yellow-100 p-2">
                    <Home className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Maintenance</p>
                    <p className="text-2xl font-semibold">
                      {apartments.filter((a) => a.status === "maintenance").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search apartments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Apartments Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Apartments</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : filteredApartments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No apartments found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Rent/Month</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApartments.map((apt) => (
                        <TableRow key={apt.id}>
                          <TableCell>
                            <div className="font-medium">{apt.title}</div>
                            {apt.is_featured && (
                              <Badge variant="secondary" className="mt-1">
                                Featured
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{apt.address}</div>
                            <div className="text-xs text-muted-foreground">
                              {apt.city}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Bed className="h-3 w-3" /> {apt.bedrooms}
                              </span>
                              <span className="flex items-center gap-1">
                                <Bath className="h-3 w-3" /> {apt.bathrooms}
                              </span>
                              <span className="flex items-center gap-1">
                                <Maximize className="h-3 w-3" /> {apt.area_sqm}m²
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              KES {apt.price_per_month?.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(apt.status)}>
                              {apt.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingApartment(apt)
                                  setIsDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteApartment(apt.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
