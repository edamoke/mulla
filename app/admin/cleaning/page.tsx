"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Clock,
  CheckCircle,
  PlayCircle,
  StopCircle,
  ClipboardList,
  Building,
  User,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import { AdminSidebar } from "@/components/admin/sidebar"

interface Apartment {
  id: string
  name: string
  unit_number: string
}

interface Staff {
  id: string
  first_name: string
  last_name: string
  role: string
}

interface CleaningLog {
  id: string
  log_number: string
  apartment_id: string
  cleaner_id: string
  cleaning_type: string
  clock_in: string
  clock_out: string | null
  duration_minutes: number | null
  status: string
  tasks_completed: string[] | null
  issues_found: string | null
  notes: string | null
  created_at: string
  apartments?: Apartment
  staff?: Staff
}

interface CleaningChecklist {
  id: string
  name: string
  cleaning_type: string
  tasks: { task: string; area: string }[]
}


// Default cleaning tasks if no checklist exists
const defaultTasks = [
  { task: "Vacuum all floors", area: "General" },
  { task: "Mop hard floors", area: "General" },
  { task: "Dust all surfaces", area: "General" },
  { task: "Clean mirrors and glass", area: "General" },
  { task: "Empty trash bins", area: "General" },
  { task: "Clean and sanitize toilet", area: "Bathroom" },
  { task: "Clean shower/bathtub", area: "Bathroom" },
  { task: "Clean bathroom sink", area: "Bathroom" },
  { task: "Wipe kitchen counters", area: "Kitchen" },
  { task: "Clean stovetop", area: "Kitchen" },
  { task: "Wipe appliance exteriors", area: "Kitchen" },
  { task: "Make beds", area: "Bedroom" },
]

export default function CleaningManagementPage() {
  const [logs, setLogs] = useState<CleaningLog[]>([])
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [cleaners, setCleaners] = useState<Staff[]>([])
  const [checklists, setChecklists] = useState<CleaningChecklist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isClockInDialogOpen, setIsClockInDialogOpen] = useState(false)
  const [isClockOutDialogOpen, setIsClockOutDialogOpen] = useState(false)
  const [activeLog, setActiveLog] = useState<CleaningLog | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [elapsedTime, setElapsedTime] = useState<number>(0)

  // Clock-in form state
  const [clockInForm, setClockInForm] = useState({
    apartment_id: "",
    cleaner_id: "",
    cleaning_type: "regular",
    notes: "",
  })

  // Clock-out form state
  const [clockOutForm, setClockOutForm] = useState({
    tasks_completed: [] as string[],
    issues_found: "",
    notes: "",
  })

  const supabase = createClient()

  // Timer for active session
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeLog) {
      interval = setInterval(() => {
        const elapsed = Math.round((Date.now() - new Date(activeLog.clock_in).getTime()) / 60000)
        setElapsedTime(elapsed)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [activeLog])

  useEffect(() => {
    fetchData()
  }, [filterStatus, filterDate])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch apartments
      const { data: apartmentsData } = await supabase
        .from("apartments")
        .select("id, name, unit_number")
        .eq("is_active", true)
        .order("name")

      // Fetch cleaners (staff with cleaner or maintenance role)
      const { data: staffData } = await supabase
        .from("staff")
        .select("id, first_name, last_name, role")
        .in("role", ["cleaner", "maintenance", "admin", "manager"])
        .eq("is_active", true)
        .order("first_name")

      // Fetch checklists
      const { data: checklistsData } = await supabase
        .from("cleaning_checklists")
        .select("*")
        .eq("is_active", true)

      // Build logs query
      let logsQuery = supabase
        .from("cleaning_logs")
        .select(`
          *,
          apartments:apartment_id (id, name, unit_number),
          staff:cleaner_id (id, first_name, last_name, role)
        `)
        .order("clock_in", { ascending: false })

      if (filterStatus !== "all") {
        logsQuery = logsQuery.eq("status", filterStatus)
      }

      if (filterDate) {
        const startOfDay = new Date(filterDate)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(filterDate)
        endOfDay.setHours(23, 59, 59, 999)
        logsQuery = logsQuery
          .gte("clock_in", startOfDay.toISOString())
          .lte("clock_in", endOfDay.toISOString())
      }

      const { data: logsData } = await logsQuery.limit(50)

      // Check for active (in_progress) log
      const { data: activeData } = await supabase
        .from("cleaning_logs")
        .select(`
          *,
          apartments:apartment_id (id, name, unit_number),
          staff:cleaner_id (id, first_name, last_name, role)
        `)
        .eq("status", "in_progress")
        .limit(1)
        .maybeSingle()

      setApartments(apartmentsData || [])
      setCleaners(staffData || [])
      setChecklists(checklistsData || [])
      setLogs(logsData || [])
      setActiveLog(activeData || null)
      
      if (activeData) {
        const elapsed = Math.round((Date.now() - new Date(activeData.clock_in).getTime()) / 60000)
        setElapsedTime(elapsed)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClockIn = async () => {
    if (!clockInForm.apartment_id || !clockInForm.cleaner_id) {
      alert("Please select an apartment and cleaner")
      return
    }

    try {
      const logNumber = `CLN-${Date.now()}`
      const { data, error } = await supabase
        .from("cleaning_logs")
        .insert({
          log_number: logNumber,
          apartment_id: clockInForm.apartment_id,
          cleaner_id: clockInForm.cleaner_id,
          cleaning_type: clockInForm.cleaning_type,
          clock_in: new Date().toISOString(),
          status: "in_progress",
          notes: clockInForm.notes || null,
        })
        .select(`
          *,
          apartments:apartment_id (id, name, unit_number),
          staff:cleaner_id (id, first_name, last_name, role)
        `)
        .single()

      if (error) throw error

      setActiveLog(data)
      setElapsedTime(0)
      setIsClockInDialogOpen(false)
      setClockInForm({
        apartment_id: "",
        cleaner_id: "",
        cleaning_type: "regular",
        notes: "",
      })
      fetchData()
    } catch (error) {
      console.error("Error clocking in:", error)
      alert("Failed to clock in. Please try again.")
    }
  }

  const handleClockOut = async () => {
    if (!activeLog) return

    try {
      const clockOut = new Date()
      const clockIn = new Date(activeLog.clock_in)
      const durationMinutes = Math.round((clockOut.getTime() - clockIn.getTime()) / 60000)

      const { error } = await supabase
        .from("cleaning_logs")
        .update({
          clock_out: clockOut.toISOString(),
          duration_minutes: durationMinutes,
          status: "completed",
          tasks_completed: clockOutForm.tasks_completed.length > 0 ? clockOutForm.tasks_completed : null,
          issues_found: clockOutForm.issues_found || null,
          notes: clockOutForm.notes || activeLog.notes,
        })
        .eq("id", activeLog.id)

      if (error) throw error

      setActiveLog(null)
      setElapsedTime(0)
      setIsClockOutDialogOpen(false)
      setClockOutForm({
        tasks_completed: [],
        issues_found: "",
        notes: "",
      })
      fetchData()
    } catch (error) {
      console.error("Error clocking out:", error)
      alert("Failed to clock out. Please try again.")
    }
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes && minutes !== 0) return "-"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      incomplete: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return styles[status] || "bg-gray-100 text-gray-800"
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      regular: "Regular",
      deep: "Deep Clean",
      turnover: "Turnover",
      inspection: "Inspection",
      emergency: "Emergency",
    }
    return labels[type] || type
  }

  const currentChecklist = checklists.find(
    (c) => c.cleaning_type === (activeLog?.cleaning_type || clockInForm.cleaning_type)
  )
  const tasksToShow = currentChecklist?.tasks || defaultTasks

  // Stats
  const todayLogs = logs.filter((l) => {
    const logDate = new Date(l.clock_in).toDateString()
    const today = new Date().toDateString()
    return logDate === today
  })
  const completedToday = todayLogs.filter((l) => l.status === "completed").length
  const inProgressCount = logs.filter((l) => l.status === "in_progress").length
  const totalMinutesToday = todayLogs
    .filter((l) => l.duration_minutes)
    .reduce((sum, l) => sum + (l.duration_minutes || 0), 0)
  const avgDuration = completedToday > 0 ? totalMinutesToday / completedToday : 0

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="lg:ml-64 flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-serif font-semibold">Cleaning Management</h1>
                <p className="text-muted-foreground">Staff time logs for apartment cleaning</p>
              </div>
              <div className="flex gap-3">
                {activeLog ? (
                  <Dialog open={isClockOutDialogOpen} onOpenChange={setIsClockOutDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="gap-2">
                        <StopCircle className="w-4 h-4" />
                        Clock Out
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Clock Out - Complete Cleaning</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="bg-muted p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Building className="w-4 h-4 text-primary" />
                            <span className="font-medium">
                              {activeLog.apartments?.name} - Unit {activeLog.apartments?.unit_number}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>Started: {formatTime(activeLog.clock_in)} ({formatDuration(elapsedTime)} elapsed)</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Tasks Completed</Label>
                          <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                            {tasksToShow.map((task, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Checkbox
                                  id={`task-${index}`}
                                  checked={clockOutForm.tasks_completed.includes(task.task)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setClockOutForm((prev) => ({
                                        ...prev,
                                        tasks_completed: [...prev.tasks_completed, task.task],
                                      }))
                                    } else {
                                      setClockOutForm((prev) => ({
                                        ...prev,
                                        tasks_completed: prev.tasks_completed.filter((t) => t !== task.task),
                                      }))
                                    }
                                  }}
                                />
                                <label htmlFor={`task-${index}`} className="text-sm flex-1 cursor-pointer">
                                  {task.task}
                                  <span className="text-muted-foreground ml-2">({task.area})</span>
                                </label>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {clockOutForm.tasks_completed.length} of {tasksToShow.length} tasks completed
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="issues">Issues Found (if any)</Label>
                          <Textarea
                            id="issues"
                            placeholder="Report any damages, maintenance needs, or issues..."
                            value={clockOutForm.issues_found}
                            onChange={(e) =>
                              setClockOutForm((prev) => ({ ...prev, issues_found: e.target.value }))
                            }
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="clockout-notes">Additional Notes</Label>
                          <Textarea
                            id="clockout-notes"
                            placeholder="Any additional notes..."
                            value={clockOutForm.notes}
                            onChange={(e) =>
                              setClockOutForm((prev) => ({ ...prev, notes: e.target.value }))
                            }
                            rows={2}
                          />
                        </div>

                        <Button onClick={handleClockOut} className="w-full gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Complete & Clock Out
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Dialog open={isClockInDialogOpen} onOpenChange={setIsClockInDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <PlayCircle className="w-4 h-4" />
                        Clock In
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Clock In - Start Cleaning</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="apartment">Apartment *</Label>
                          <Select
                            value={clockInForm.apartment_id}
                            onValueChange={(value) =>
                              setClockInForm((prev) => ({ ...prev, apartment_id: value }))
                            }
                          >
                            <SelectTrigger id="apartment">
                              <SelectValue placeholder="Select apartment" />
                            </SelectTrigger>
                            <SelectContent>
                              {apartments.map((apt) => (
                                <SelectItem key={apt.id} value={apt.id}>
                                  {apt.name} - Unit {apt.unit_number}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cleaner">Staff Member *</Label>
                          <Select
                            value={clockInForm.cleaner_id}
                            onValueChange={(value) =>
                              setClockInForm((prev) => ({ ...prev, cleaner_id: value }))
                            }
                          >
                            <SelectTrigger id="cleaner">
                              <SelectValue placeholder="Select staff member" />
                            </SelectTrigger>
                            <SelectContent>
                              {cleaners.map((staff) => (
                                <SelectItem key={staff.id} value={staff.id}>
                                  {staff.first_name} {staff.last_name} ({staff.role})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="type">Cleaning Type</Label>
                          <Select
                            value={clockInForm.cleaning_type}
                            onValueChange={(value) =>
                              setClockInForm((prev) => ({ ...prev, cleaning_type: value }))
                            }
                          >
                            <SelectTrigger id="type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="regular">Regular Cleaning</SelectItem>
                              <SelectItem value="deep">Deep Cleaning</SelectItem>
                              <SelectItem value="turnover">Turnover Cleaning</SelectItem>
                              <SelectItem value="inspection">Inspection</SelectItem>
                              <SelectItem value="emergency">Emergency</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="clockin-notes">Notes (optional)</Label>
                          <Textarea
                            id="clockin-notes"
                            placeholder="Any special instructions..."
                            value={clockInForm.notes}
                            onChange={(e) =>
                              setClockInForm((prev) => ({ ...prev, notes: e.target.value }))
                            }
                            rows={2}
                          />
                        </div>

                        <Button onClick={handleClockIn} className="w-full gap-2">
                          <Clock className="w-4 h-4" />
                          Start Clock
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            {/* Active Cleaning Session Banner */}
            {activeLog && (
              <Card className="mb-6 border-blue-200 bg-blue-50">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">
                          Active Cleaning Session
                        </p>
                        <p className="text-sm text-blue-700">
                          {activeLog.staff?.first_name} {activeLog.staff?.last_name} is cleaning{" "}
                          <strong>{activeLog.apartments?.name} - Unit {activeLog.apartments?.unit_number}</strong>
                        </p>
                        <p className="text-xs text-blue-600">
                          Started at {formatTime(activeLog.clock_in)} ({getTypeLabel(activeLog.cleaning_type)})
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-900 font-mono">
                        {formatDuration(elapsedTime)}
                      </div>
                      <p className="text-xs text-blue-600">Elapsed time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{completedToday}</p>
                      <p className="text-sm text-muted-foreground">Completed Today</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <PlayCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{inProgressCount}</p>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{formatDuration(Math.round(avgDuration))}</p>
                      <p className="text-sm text-muted-foreground">Avg Duration</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                      <Building className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{apartments.length}</p>
                      <p className="text-sm text-muted-foreground">Total Apartments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="py-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label>Date:</Label>
                    <Input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="w-auto"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label>Status:</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="incomplete">Incomplete</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" onClick={fetchData} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Cleaning Logs Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Cleaning Time Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No cleaning logs found for the selected date
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Log #</TableHead>
                          <TableHead>Apartment</TableHead>
                          <TableHead>Staff</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Clock In</TableHead>
                          <TableHead>Clock Out</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Issues</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-mono text-sm">{log.log_number}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-muted-foreground" />
                                <span>{log.apartments?.name} - {log.apartments?.unit_number}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span>{log.staff?.first_name} {log.staff?.last_name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{getTypeLabel(log.cleaning_type)}</TableCell>
                            <TableCell>{formatTime(log.clock_in)}</TableCell>
                            <TableCell>{log.clock_out ? formatTime(log.clock_out) : "-"}</TableCell>
                            <TableCell className="font-mono">{formatDuration(log.duration_minutes)}</TableCell>
                            <TableCell>
                              <Badge className={getStatusBadge(log.status)}>
                                {log.status.replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {log.issues_found ? (
                                <div className="flex items-center gap-1 text-amber-600" title={log.issues_found}>
                                  <AlertTriangle className="w-4 h-4" />
                                  <span className="text-xs">Yes</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
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
    </div>
  )
}
