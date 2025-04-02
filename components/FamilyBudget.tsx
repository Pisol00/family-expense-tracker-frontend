'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import {
    BarChart3,
    CircleDollarSign,
    CreditCard,
    Home,
    LineChart,
    PieChart,
    PlusCircle,
    Trash2,
    Wallet,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    LayoutDashboard
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type Transaction = {
    id: string
    amount: string
    category: string
    description: string
    date: string
    type?: 'income' | 'expense'
}

type CategoryType = {
    id: string
    name: string
    icon: React.ReactNode
}

const incomeCategories: CategoryType[] = [
    { id: 'salary', name: 'เงินเดือน', icon: <CircleDollarSign className="h-4 w-4" /> },
    { id: 'bonus', name: 'โบนัส', icon: <Wallet className="h-4 w-4" /> },
    { id: 'investment', name: 'เงินลงทุน', icon: <LineChart className="h-4 w-4" /> },
    { id: 'other', name: 'อื่นๆ', icon: <PieChart className="h-4 w-4" /> }
]

const expenseCategories: CategoryType[] = [
    { id: 'food', name: 'อาหาร', icon: <PieChart className="h-4 w-4" /> },
    { id: 'housing', name: 'ที่พักอาศัย', icon: <Home className="h-4 w-4" /> },
    { id: 'utilities', name: 'สาธารณูปโภค', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'transportation', name: 'การเดินทาง', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'education', name: 'การศึกษา', icon: <PieChart className="h-4 w-4" /> },
    { id: 'healthcare', name: 'การดูแลสุขภาพ', icon: <PieChart className="h-4 w-4" /> },
    { id: 'entertainment', name: 'ความบันเทิง', icon: <PieChart className="h-4 w-4" /> },
    { id: 'shopping', name: 'ช้อปปิ้ง', icon: <PieChart className="h-4 w-4" /> },
    { id: 'other', name: 'อื่นๆ', icon: <PieChart className="h-4 w-4" /> }
]

// ฟังก์ชันสำหรับสร้างตารางปฏิทิน
const generateCalendarDays = (year: number, month: number) => {
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const daysInMonth = lastDayOfMonth.getDate()

    // หาวันแรกของเดือนเริ่มต้นที่วันอาทิตย์ (0) ถึงวันเสาร์ (6)
    const firstDayOfWeek = firstDayOfMonth.getDay()

    // สร้างอาเรย์วันที่
    const calendarDays = []

    // เพิ่มวันจากเดือนที่แล้ว
    for (let i = 0; i < firstDayOfWeek; i++) {
        const previousMonthLastDay = new Date(year, month, 0)
        const day = previousMonthLastDay.getDate() - firstDayOfWeek + i + 1
        calendarDays.push({
            date: new Date(year, month - 1, day),
            currentMonth: false,
            formattedDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        })
    }

    // เพิ่มวันในเดือนปัจจุบัน
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push({
            date: new Date(year, month, day),
            currentMonth: true,
            formattedDate: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        })
    }

    // เพิ่มวันจากเดือนถัดไป
    const remainingDays = 42 - calendarDays.length // 6 สัปดาห์ในปฏิทิน (6x7=42)
    for (let day = 1; day <= remainingDays; day++) {
        calendarDays.push({
            date: new Date(year, month + 1, day),
            currentMonth: false,
            formattedDate: `${year}-${String(month + 2).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        })
    }

    return calendarDays
}

type WeekData = {
    key: string
    weekNumber: number
    year: number
    startDate: Date
    endDate: Date
    transactions: Transaction[]
    totalIncome: number
    totalExpense: number
}

type MonthData = {
    key: string
    year: number
    month: number
    monthName: string
    transactions: Transaction[]
    totalIncome: number
    totalExpense: number
}

// ฟังก์ชันรวมจำนวนเงินตามวันที่
const sumAmountByDate = (transactions: Transaction[], date: string) => {
    return transactions
        .filter(transaction => transaction.date === date)
        .reduce((sum, transaction) => sum + parseFloat(transaction.amount || '0'), 0)
}

// ฟังก์ชันจัดกลุ่มข้อมูลตามสัปดาห์
const groupByWeek = (transactions: Transaction[]): WeekData[] => {
    // สร้าง Object เพื่อเก็บข้อมูลแยกตามสัปดาห์
    const weeks: Record<string, WeekData> = {}

    transactions.forEach(transaction => {
        const date = new Date(transaction.date)
        // คำนวณสัปดาห์ (1-53) ของปี
        const weekNumber = getWeekNumber(date)
        const year = date.getFullYear()
        const weekKey = `${year}-W${weekNumber}`

        if (!weeks[weekKey]) {
            const startDate = getFirstDayOfWeek(date)
            const endDate = new Date(new Date(startDate).setDate(startDate.getDate() + 6))

            weeks[weekKey] = {
                key: weekKey,
                weekNumber,
                year,
                startDate,
                endDate,
                transactions: [],
                totalIncome: 0,
                totalExpense: 0
            }
        }

        weeks[weekKey].transactions.push(transaction)

        // คำนวณรายรับและรายจ่ายรวม
        const amount = parseFloat(transaction.amount || '0')
        if (transaction.type === 'income') {
            weeks[weekKey].totalIncome += amount
        } else {
            weeks[weekKey].totalExpense += amount
        }
    })

    // แปลง Object เป็น Array และเรียงตามสัปดาห์
    return Object.values(weeks).sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.weekNumber - a.weekNumber
    })
}

// ฟังก์ชันจัดกลุ่มข้อมูลตามเดือน
const groupByMonth = (transactions: Transaction[]): MonthData[] => {
    // สร้าง Object เพื่อเก็บข้อมูลแยกตามเดือน
    const months: Record<string, MonthData> = {}

    transactions.forEach(transaction => {
        const date = new Date(transaction.date)
        const year = date.getFullYear()
        const month = date.getMonth() // 0-11
        const monthKey = `${year}-${month.toString().padStart(2, '0')}`

        if (!months[monthKey]) {
            months[monthKey] = {
                key: monthKey,
                year,
                month,
                monthName: getMonthName(month),
                transactions: [],
                totalIncome: 0,
                totalExpense: 0
            }
        }

        months[monthKey].transactions.push(transaction)

        // คำนวณรายรับและรายจ่ายรวม
        const amount = parseFloat(transaction.amount || '0')
        if (transaction.type === 'income') {
            months[monthKey].totalIncome += amount
        } else {
            months[monthKey].totalExpense += amount
        }
    })

    // แปลง Object เป็น Array และเรียงตามเดือน
    return Object.values(months).sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return b.month - a.month
    })
}

// ฟังก์ชันช่วย: หาเลขสัปดาห์ของปี
const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

// ฟังก์ชันช่วย: หาวันแรกของสัปดาห์ (วันอาทิตย์)
const getFirstDayOfWeek = (date: Date): Date => {
    const newDate = new Date(date)
    const day = date.getDay() // 0 = วันอาทิตย์, 6 = วันเสาร์
    const diff = date.getDate() - day
    newDate.setDate(diff)
    return newDate
}

// ฟังก์ชันช่วย: แปลงเดือนเป็นชื่อเดือนภาษาไทย
const getMonthName = (month: number): string => {
    const thaiMonths = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]
    return thaiMonths[month]
}

export default function FamilyBudgetApp() {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [incomes, setIncomes] = useState<Transaction[]>([])
    const [expenses, setExpenses] = useState<Transaction[]>([])
    const [newIncome, setNewIncome] = useState<Transaction>({
        id: '',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    })
    const [newExpense, setNewExpense] = useState<Transaction>({
        id: '',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    })

    // สำหรับมุมมองปฏิทิน
    const today = new Date()
    const [currentMonth, setCurrentMonth] = useState(today.getMonth())
    const [currentYear, setCurrentYear] = useState(today.getFullYear())
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedDateTransactions, setSelectedDateTransactions] = useState<Transaction[]>([])

    // สร้างวันในปฏิทิน
    const calendarDays = generateCalendarDays(currentYear, currentMonth)

    // รวมรายการทั้งหมด
    const allTransactions = [
        ...incomes.map(income => ({ ...income, type: 'income' as const })),
        ...expenses.map(expense => ({ ...expense, type: 'expense' as const }))
    ]

    // จัดกลุ่มตามสัปดาห์และเดือน
    const weeklyData = groupByWeek(allTransactions)
    const monthlyData = groupByMonth(allTransactions)

    // รวมยอดรายรับ
    const totalIncome = incomes.reduce((total, income) => total + parseFloat(income.amount || '0'), 0)

    // รวมยอดรายจ่าย
    const totalExpense = expenses.reduce((total, expense) => total + parseFloat(expense.amount || '0'), 0)

    // ยอดคงเหลือ
    const balance = totalIncome - totalExpense

    // เพิ่มรายรับ
    const handleAddIncome = () => {
        if (!newIncome.amount || !newIncome.category) return

        setIncomes([...incomes, { ...newIncome, id: Date.now().toString() }])
        setNewIncome({
            id: '',
            amount: '',
            category: '',
            description: '',
            date: new Date().toISOString().split('T')[0]
        })
    }

    // เพิ่มรายจ่าย
    const handleAddExpense = () => {
        if (!newExpense.amount || !newExpense.category) return

        setExpenses([...expenses, { ...newExpense, id: Date.now().toString() }])
        setNewExpense({
            id: '',
            amount: '',
            category: '',
            description: '',
            date: new Date().toISOString().split('T')[0]
        })
    }

    // ลบรายการ
    const deleteIncome = (id: string) => {
        setIncomes(incomes.filter(income => income.id !== id))
    }

    const deleteExpense = (id: string) => {
        setExpenses(expenses.filter(expense => expense.id !== id))
    }

    // เปลี่ยนเดือนในปฏิทิน
    const goToPreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11)
            setCurrentYear(currentYear - 1)
        } else {
            setCurrentMonth(currentMonth - 1)
        }
    }

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0)
            setCurrentYear(currentYear + 1)
        } else {
            setCurrentMonth(currentMonth + 1)
        }
    }

    // คลิกวันในปฏิทิน
    const handleDateClick = (day: { formattedDate: string }) => {
        setSelectedDate(day.formattedDate)

        // กรองรายการในวันที่เลือก
        const transactionsOnSelectedDate = allTransactions.filter(
            transaction => transaction.date === day.formattedDate
        )

        setSelectedDateTransactions(transactionsOnSelectedDate)
        setIsDialogOpen(true)
    }

    // ลบรายการจากหน้าต่างรายละเอียดวัน
    const handleDeleteTransaction = (id: string, type: 'income' | 'expense') => {
        if (type === 'income') {
            deleteIncome(id)
        } else {
            deleteExpense(id)
        }

        // อัปเดตรายการในหน้าต่างป๊อปอัพ
        setSelectedDateTransactions(
            selectedDateTransactions.filter(transaction => transaction.id !== id)
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl opacity-20 blur-xl"></div>
                        <Card className="relative overflow-hidden border-0 shadow-lg">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                            <CardHeader className="relative z-10 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-3xl font-bold tracking-tight">ระบบบัญชีรายรับรายจ่ายครอบครัว</CardTitle>
                                        <CardDescription className="text-blue-100 mt-2 text-lg">จัดการการเงินของครอบครัวคุณอย่างชาญฉลาด</CardDescription>
                                    </div>
                                    <div className="hidden md:block">
                                        <CircleDollarSign className="h-16 w-16 text-white opacity-50" />
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="relative z-10 pt-0 pb-6 text-white">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                                        <p className="text-sm font-medium text-blue-100">รายรับทั้งหมด</p>
                                        <p className="text-2xl font-bold">{totalIncome.toLocaleString()} บาท</p>
                                    </div>

                                    <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                                        <p className="text-sm font-medium text-blue-100">รายจ่ายทั้งหมด</p>
                                        <p className="text-2xl font-bold">{totalExpense.toLocaleString()} บาท</p>
                                    </div>

                                    <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                                        <p className="text-sm font-medium text-blue-100">ยอดคงเหลือ</p>
                                        <p className="text-2xl font-bold">{balance.toLocaleString()} บาท</p>
                                        <p className="text-xs mt-1 text-blue-100">{balance >= 0 ? '😊 สถานะการเงินดี' : '😟 ควรลดค่าใช้จ่าย'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-5 mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-950 dark:data-[state=active]:text-blue-200 py-3">
                            <LayoutDashboard className="mr-2 h-5 w-5" />
                            <span className="hidden sm:inline">แดชบอร์ด</span>
                        </TabsTrigger>
                        <TabsTrigger value="income" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700 dark:data-[state=active]:bg-green-950 dark:data-[state=active]:text-green-200 py-3">
                            <ArrowUpRight className="mr-2 h-5 w-5" />
                            <span className="hidden sm:inline">รายรับ</span>
                        </TabsTrigger>
                        <TabsTrigger value="expense" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700 dark:data-[state=active]:bg-red-950 dark:data-[state=active]:text-red-200 py-3">
                            <ArrowDownRight className="mr-2 h-5 w-5" />
                            <span className="hidden sm:inline">รายจ่าย</span>
                        </TabsTrigger>
                        <TabsTrigger value="summary" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-950 dark:data-[state=active]:text-purple-200 py-3">
                            <BarChart3 className="mr-2 h-5 w-5" />
                            <span className="hidden sm:inline">สรุป</span>
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-950 dark:data-[state=active]:text-indigo-200 py-3">
                            <Calendar className="mr-2 h-5 w-5" />
                            <span className="hidden sm:inline">ปฏิทิน</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* แดชบอร์ด */}
                    <TabsContent value="dashboard">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="bg-white dark:bg-gray-800 shadow-md overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                                    <CardTitle className="flex items-center text-lg">
                                        <ArrowUpRight className="mr-2 h-5 w-5" />
                                        รายรับล่าสุด
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {incomes.length > 0 ? (
                                        <div className="space-y-3">
                                            {incomes.slice(-5).reverse().map(income => (
                                                <div key={income.id} className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 dark:bg-opacity-20 border border-green-100 dark:border-green-800">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full">
                                                            {incomeCategories.find(cat => cat.id === income.category)?.icon || <CircleDollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800 dark:text-gray-200">{incomeCategories.find(cat => cat.id === income.category)?.name || income.category}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{income.description || 'ไม่มีรายละเอียด'} • {income.date}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-green-600 dark:text-green-400">{parseFloat(income.amount).toLocaleString()} ฿</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <div className="bg-gray-100 dark:bg-gray-700 inline-block p-3 rounded-full mb-2">
                                                <ArrowUpRight className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                                            </div>
                                            <p className="text-gray-500 dark:text-gray-400">ยังไม่มีรายการรายรับ</p>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="bg-gray-50 dark:bg-gray-800 border-t">
                                    <Button variant="ghost" className="w-full text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900 dark:hover:bg-opacity-20" onClick={() => setActiveTab('income')}>
                                        เพิ่มรายรับใหม่
                                    </Button>
                                </CardFooter>
                            </Card>

                            <Card className="bg-white dark:bg-gray-800 shadow-md overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-red-500 to-rose-600 text-white">
                                    <CardTitle className="flex items-center text-lg">
                                        <ArrowDownRight className="mr-2 h-5 w-5" />
                                        รายจ่ายล่าสุด
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {expenses.length > 0 ? (
                                        <div className="space-y-3">
                                            {expenses.slice(-5).reverse().map(expense => (
                                                <div key={expense.id} className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900 dark:to-rose-900 dark:bg-opacity-20 border border-red-100 dark:border-red-800">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-red-100 dark:bg-red-800 p-2 rounded-full">
                                                            {expenseCategories.find(cat => cat.id === expense.category)?.icon || <CreditCard className="h-4 w-4 text-red-600 dark:text-red-400" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800 dark:text-gray-200">{expenseCategories.find(cat => cat.id === expense.category)?.name || expense.category}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{expense.description || 'ไม่มีรายละเอียด'} • {expense.date}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-red-600 dark:text-red-400">{parseFloat(expense.amount).toLocaleString()} ฿</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <div className="bg-gray-100 dark:bg-gray-700 inline-block p-3 rounded-full mb-2">
                                                <ArrowDownRight className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                                            </div>
                                            <p className="text-gray-500 dark:text-gray-400">ยังไม่มีรายการรายจ่าย</p>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="bg-gray-50 dark:bg-gray-800 border-t">
                                    <Button variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900 dark:hover:bg-opacity-20" onClick={() => setActiveTab('expense')}>
                                        เพิ่มรายจ่ายใหม่
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* รายรับ */}
                    <TabsContent value="income">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                                <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 overflow-hidden">
                                    <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                                        <CardTitle className="flex items-center text-lg">
                                            <PlusCircle className="mr-2 h-5 w-5" />
                                            เพิ่มรายรับใหม่
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="income-amount" className="text-sm font-medium">จำนวนเงิน (บาท)</Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <span className="text-gray-500">฿</span>
                                                </div>
                                                <Input
                                                    id="income-amount"
                                                    type="number"
                                                    className="pl-8"
                                                    placeholder="0.00"
                                                    value={newIncome.amount}
                                                    onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="income-category" className="text-sm font-medium">หมวดหมู่</Label>
                                            <Select value={newIncome.category} onValueChange={(value) => setNewIncome({ ...newIncome, category: value })}>
                                                <SelectTrigger id="income-category" className="w-full">
                                                    <SelectValue placeholder="เลือกหมวดหมู่" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {incomeCategories.map(category => (
                                                        <SelectItem key={category.id} value={category.id}>
                                                            <div className="flex items-center">
                                                                {category.icon}
                                                                <span className="ml-2">{category.name}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="income-description" className="text-sm font-medium">รายละเอียด</Label>
                                            <Input
                                                id="income-description"
                                                placeholder="รายละเอียดเพิ่มเติม"
                                                value={newIncome.description}
                                                onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="income-date" className="text-sm font-medium">วันที่</Label>
                                            <Input
                                                id="income-date"
                                                type="date"
                                                value={newIncome.date}
                                                onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="bg-gray-50 dark:bg-gray-800 border-t">
                                        <Button onClick={handleAddIncome} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
                                            <PlusCircle className="mr-2 h-4 w-4" /> เพิ่มรายรับ
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>

                            <div className="lg:col-span-2">
                                <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 h-full">
                                    <CardHeader className="border-b">
                                        <CardTitle className="text-lg flex items-center">
                                            <ArrowUpRight className="mr-2 h-5 w-5 text-green-500" />
                                            รายการรายรับทั้งหมด
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {incomes.length > 0 ? (
                                            <div className="space-y-3">
                                                {incomes.map(income => (
                                                    <div key={income.id} className="flex justify-between items-center p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 dark:bg-opacity-10 border border-green-100 dark:border-green-800 hover:shadow-md transition-shadow duration-200">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full">
                                                                {incomeCategories.find(cat => cat.id === income.category)?.icon || <CircleDollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-800 dark:text-gray-200">{incomeCategories.find(cat => cat.id === income.category)?.name || income.category}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">{income.description || 'ไม่มีรายละเอียด'} • {income.date}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <p className="font-bold text-green-600 dark:text-green-400">{parseFloat(income.amount).toLocaleString()} ฿</p>
                                                            <Button variant="ghost" size="sm" onClick={() => deleteIncome(income.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20 p-1 h-auto">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="bg-gray-100 dark:bg-gray-700 inline-block p-6 rounded-full mb-4">
                                                    <ArrowUpRight className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">ยังไม่มีรายการรายรับ</h3>
                                                <p className="text-gray-500 dark:text-gray-400">เริ่มเพิ่มรายรับของคุณด้วยการกรอกแบบฟอร์มด้านซ้าย</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* รายจ่าย */}
                    <TabsContent value="expense">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                                <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 overflow-hidden">
                                    <CardHeader className="bg-gradient-to-r from-red-500 to-rose-600 text-white">
                                        <CardTitle className="flex items-center text-lg">
                                            <PlusCircle className="mr-2 h-5 w-5" />
                                            เพิ่มรายจ่ายใหม่
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="expense-amount" className="text-sm font-medium">จำนวนเงิน (บาท)</Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <span className="text-gray-500">฿</span>
                                                </div>
                                                <Input
                                                    id="expense-amount"
                                                    type="number"
                                                    className="pl-8"
                                                    placeholder="0.00"
                                                    value={newExpense.amount}
                                                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="expense-category" className="text-sm font-medium">หมวดหมู่</Label>
                                            <Select value={newExpense.category} onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}>
                                                <SelectTrigger id="expense-category" className="w-full">
                                                    <SelectValue placeholder="เลือกหมวดหมู่" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {expenseCategories.map(category => (
                                                        <SelectItem key={category.id} value={category.id}>
                                                            <div className="flex items-center">
                                                                {category.icon}
                                                                <span className="ml-2">{category.name}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="expense-description" className="text-sm font-medium">รายละเอียด</Label>
                                            <Input
                                                id="expense-description"
                                                placeholder="รายละเอียดเพิ่มเติม"
                                                value={newExpense.description}
                                                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="expense-date" className="text-sm font-medium">วันที่</Label>
                                            <Input
                                                id="expense-date"
                                                type="date"
                                                value={newExpense.date}
                                                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="bg-gray-50 dark:bg-gray-800 border-t">
                                        <Button onClick={handleAddExpense} className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white">
                                            <PlusCircle className="mr-2 h-4 w-4" /> เพิ่มรายจ่าย
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>

                            <div className="lg:col-span-2">
                                <Card className="bg-white dark:bg-gray-800 shadow-lg border-0 h-full">
                                    <CardHeader className="border-b">
                                        <CardTitle className="text-lg flex items-center">
                                            <ArrowDownRight className="mr-2 h-5 w-5 text-red-500" />
                                            รายการรายจ่ายทั้งหมด
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {expenses.length > 0 ? (
                                            <div className="space-y-3">
                                                {expenses.map(expense => (
                                                    <div key={expense.id} className="flex justify-between items-center p-4 rounded-lg bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900 dark:to-rose-900 dark:bg-opacity-10 border border-red-100 dark:border-red-800 hover:shadow-md transition-shadow duration-200">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-red-100 dark:bg-red-800 p-2 rounded-full">
                                                                {expenseCategories.find(cat => cat.id === expense.category)?.icon || <CreditCard className="h-4 w-4 text-red-600 dark:text-red-400" />}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-800 dark:text-gray-200">{expenseCategories.find(cat => cat.id === expense.category)?.name || expense.category}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">{expense.description || 'ไม่มีรายละเอียด'} • {expense.date}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <p className="font-bold text-red-600 dark:text-red-400">{parseFloat(expense.amount).toLocaleString()} ฿</p>
                                                            <Button variant="ghost" size="sm" onClick={() => deleteExpense(expense.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20 p-1 h-auto">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="bg-gray-100 dark:bg-gray-700 inline-block p-6 rounded-full mb-4">
                                                    <ArrowDownRight className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">ยังไม่มีรายการรายจ่าย</h3>
                                                <p className="text-gray-500 dark:text-gray-400">เริ่มเพิ่มรายจ่ายของคุณด้วยการกรอกแบบฟอร์มด้านซ้าย</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* สรุป */}
                    <TabsContent value="summary">
                        <Tabs defaultValue="monthly">
                            <TabsList className="mb-4">
                                <TabsTrigger value="monthly" className="px-4">รายเดือน</TabsTrigger>
                                <TabsTrigger value="weekly" className="px-4">รายสัปดาห์</TabsTrigger>
                            </TabsList>

                            <TabsContent value="monthly">
                                <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
                                    <CardHeader className="border-b">
                                        <CardTitle className="text-lg flex items-center">
                                            <BarChart3 className="mr-2 h-5 w-5 text-purple-500" />
                                            สรุปรายเดือน
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {monthlyData.length > 0 ? (
                                            <div className="space-y-4">
                                                {monthlyData.map(month => (
                                                    <div key={month.key} className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                                        <div className="bg-purple-100 dark:bg-purple-900 p-4 flex justify-between items-center">
                                                            <h3 className="font-medium text-lg text-purple-800 dark:text-purple-200">
                                                                {month.monthName} {month.year}
                                                            </h3>
                                                            <div className="flex gap-4">
                                                                <div className="text-right">
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">รายรับ</p>
                                                                    <p className="font-bold text-green-600 dark:text-green-400">{month.totalIncome.toLocaleString()} ฿</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">รายจ่าย</p>
                                                                    <p className="font-bold text-red-600 dark:text-red-400">{month.totalExpense.toLocaleString()} ฿</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">คงเหลือ</p>
                                                                    <p className={`font-bold ${month.totalIncome - month.totalExpense >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                                                        {(month.totalIncome - month.totalExpense).toLocaleString()} ฿
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="p-4">
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button variant="outline" size="sm" className="w-full">
                                                                        ดูรายละเอียด ({month.transactions.length} รายการ)
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-96 max-h-96 overflow-y-auto">
                                                                    <div className="space-y-3">
                                                                        <h4 className="font-medium text-center border-b pb-2">
                                                                            รายละเอียด {month.monthName} {month.year}
                                                                        </h4>
                                                                        {month.transactions.map(transaction => (
                                                                            <div key={transaction.id} className={`p-2 rounded-md flex justify-between items-center
                                        ${transaction.type === 'income'
                                                                                    ? 'bg-green-50 dark:bg-green-900 dark:bg-opacity-20'
                                                                                    : 'bg-red-50 dark:bg-red-900 dark:bg-opacity-20'
                                                                                }`}>
                                                                                <div>
                                                                                    <p className="font-medium">
                                                                                        {transaction.type === 'income'
                                                                                            ? incomeCategories.find(cat => cat.id === transaction.category)?.name
                                                                                            : expenseCategories.find(cat => cat.id === transaction.category)?.name
                                                                                        }
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-500">{transaction.description || 'ไม่มีรายละเอียด'} • {transaction.date}</p>
                                                                                </div>
                                                                                <p className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                                                    {parseFloat(transaction.amount).toLocaleString()} ฿
                                                                                </p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </PopoverContent>
                                                            </Popover>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="bg-gray-100 dark:bg-gray-700 inline-block p-6 rounded-full mb-4">
                                                    <BarChart3 className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">ยังไม่มีข้อมูลสรุปรายเดือน</h3>
                                                <p className="text-gray-500 dark:text-gray-400">เริ่มเพิ่มรายรับและรายจ่ายเพื่อดูข้อมูลสรุป</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="weekly">
                                <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
                                    <CardHeader className="border-b">
                                        <CardTitle className="text-lg flex items-center">
                                            <Clock className="mr-2 h-5 w-5 text-purple-500" />
                                            สรุปรายสัปดาห์
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {weeklyData.length > 0 ? (
                                            <div className="space-y-4">
                                                {weeklyData.map(week => {
                                                    const startDateFormatted = `${week.startDate.getDate()}/${week.startDate.getMonth() + 1}/${week.startDate.getFullYear()}`;
                                                    const endDateFormatted = `${week.endDate.getDate()}/${week.endDate.getMonth() + 1}/${week.endDate.getFullYear()}`;

                                                    return (
                                                        <div key={week.key} className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                                            <div className="bg-indigo-100 dark:bg-indigo-900 p-4 flex justify-between items-center">
                                                                <h3 className="font-medium text-lg text-indigo-800 dark:text-indigo-200">
                                                                    สัปดาห์ที่ {week.weekNumber} ปี {week.year}
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                        {startDateFormatted} - {endDateFormatted}
                                                                    </p>
                                                                </h3>
                                                                <div className="flex gap-4">
                                                                    <div className="text-right">
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">รายรับ</p>
                                                                        <p className="font-bold text-green-600 dark:text-green-400">{week.totalIncome.toLocaleString()} ฿</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">รายจ่าย</p>
                                                                        <p className="font-bold text-red-600 dark:text-red-400">{week.totalExpense.toLocaleString()} ฿</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">คงเหลือ</p>
                                                                        <p className={`font-bold ${week.totalIncome - week.totalExpense >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                                                            {(week.totalIncome - week.totalExpense).toLocaleString()} ฿
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="p-4">
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <Button variant="outline" size="sm" className="w-full">
                                                                            ดูรายละเอียด ({week.transactions.length} รายการ)
                                                                        </Button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-96 max-h-96 overflow-y-auto">
                                                                        <div className="space-y-3">
                                                                            <h4 className="font-medium text-center border-b pb-2">
                                                                                รายละเอียดสัปดาห์ที่ {week.weekNumber} ({startDateFormatted} - {endDateFormatted})
                                                                            </h4>
                                                                            {week.transactions.map(transaction => (
                                                                                <div key={transaction.id} className={`p-2 rounded-md flex justify-between items-center
                                          ${transaction.type === 'income'
                                                                                        ? 'bg-green-50 dark:bg-green-900 dark:bg-opacity-20'
                                                                                        : 'bg-red-50 dark:bg-red-900 dark:bg-opacity-20'
                                                                                    }`}>
                                                                                    <div>
                                                                                        <p className="font-medium">
                                                                                            {transaction.type === 'income'
                                                                                                ? incomeCategories.find(cat => cat.id === transaction.category)?.name
                                                                                                : expenseCategories.find(cat => cat.id === transaction.category)?.name
                                                                                            }
                                                                                        </p>
                                                                                        <p className="text-xs text-gray-500">{transaction.description || 'ไม่มีรายละเอียด'} • {transaction.date}</p>
                                                                                    </div>
                                                                                    <p className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                                                        {parseFloat(transaction.amount).toLocaleString()} ฿
                                                                                    </p>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="bg-gray-100 dark:bg-gray-700 inline-block p-6 rounded-full mb-4">
                                                    <Clock className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">ยังไม่มีข้อมูลสรุปรายสัปดาห์</h3>
                                                <p className="text-gray-500 dark:text-gray-400">เริ่มเพิ่มรายรับและรายจ่ายเพื่อดูข้อมูลสรุป</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </TabsContent>

                    {/* ปฏิทิน */}
                    <TabsContent value="calendar">
                        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
                            <CardHeader className="border-b flex flex-row items-center justify-between">
                                <CardTitle className="text-lg flex items-center">
                                    <Calendar className="mr-2 h-5 w-5 text-indigo-500" />
                                    ปฏิทินการเงิน
                                </CardTitle>
                                <div className="flex items-center space-x-2">
                                    <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <h3 className="text-lg font-medium min-w-32 text-center">
                                        {getMonthName(currentMonth)} {currentYear}
                                    </h3>
                                    <Button variant="outline" size="sm" onClick={goToNextMonth}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {/* วันในสัปดาห์ */}
                                <div className="grid grid-cols-7 mb-2 text-sm font-medium text-center">
                                    <div className="text-red-500 dark:text-red-400">อา</div>
                                    <div>จ</div>
                                    <div>อ</div>
                                    <div>พ</div>
                                    <div>พฤ</div>
                                    <div>ศ</div>
                                    <div className="text-blue-500 dark:text-blue-400">ส</div>
                                </div>

                                {/* ปฏิทิน */}
                                <div className="grid grid-cols-7 gap-2">
                                    {calendarDays.map((day, index) => {
                                        const isToday = day.date.toDateString() === new Date().toDateString();
                                        const incomeAmount = sumAmountByDate(incomes, day.formattedDate);
                                        const expenseAmount = sumAmountByDate(expenses, day.formattedDate);
                                        const hasTransactions = incomeAmount > 0 || expenseAmount > 0;

                                        return (
                                            <div
                                                key={index}
                                                onClick={() => hasTransactions && handleDateClick(day)}
                                                className={`
                          p-1 min-h-20 rounded-lg border relative
                          ${!day.currentMonth ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600' : 'bg-white dark:bg-gray-850'}
                          ${isToday ? 'border-indigo-500 dark:border-indigo-400' : 'border-gray-200 dark:border-gray-700'}
                          ${hasTransactions ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900' : ''}
                        `}
                                            >
                                                <div className={`
                          text-right text-sm font-medium mb-1 pr-1
                          ${day.date.getDay() === 0 ? 'text-red-500 dark:text-red-400' : ''}
                          ${day.date.getDay() === 6 ? 'text-blue-500 dark:text-blue-400' : ''}
                          ${isToday ? 'text-indigo-700 dark:text-indigo-300' : ''}
                        `}>
                                                    {day.date.getDate()}
                                                </div>

                                                {hasTransactions && (
                                                    <div className="space-y-1 text-xs">
                                                        {incomeAmount > 0 && (
                                                            <div className="flex justify-between px-1">
                                                                <span className="text-green-600 dark:text-green-400 flex items-center">
                                                                    <ArrowUpRight className="h-3 w-3 mr-1" /> รับ
                                                                </span>
                                                                <span className="font-medium text-green-600 dark:text-green-400">
                                                                    {incomeAmount.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {expenseAmount > 0 && (
                                                            <div className="flex justify-between px-1">
                                                                <span className="text-red-600 dark:text-red-400 flex items-center">
                                                                    <ArrowDownRight className="h-3 w-3 mr-1" /> จ่าย
                                                                </span>
                                                                <span className="font-medium text-red-600 dark:text-red-400">
                                                                    {expenseAmount.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {isToday && (
                                                    <div className="absolute top-1 left-1 h-2 w-2 bg-indigo-500 rounded-full"></div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* รายละเอียดของวันที่เลือก */}
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogContent className="sm:max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center">
                                        <Calendar className="h-5 w-5 mr-2 text-indigo-500" />
                                        รายการวันที่ {selectedDate && new Date(selectedDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </DialogTitle>
                                    <DialogDescription>
                                        รายละเอียดรายรับและรายจ่ายของวันนี้
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 p-3 rounded-lg">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">รายรับรวม</p>
                                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                            {selectedDateTransactions
                                                .filter(t => t.type === 'income')
                                                .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0)
                                                .toLocaleString()} ฿
                                        </p>
                                    </div>

                                    <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 p-3 rounded-lg">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">รายจ่ายรวม</p>
                                        <p className="text-xl font-bold text-red-600 dark:text-red-400">
                                            {selectedDateTransactions
                                                .filter(t => t.type === 'expense')
                                                .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0)
                                                .toLocaleString()} ฿
                                        </p>
                                    </div>
                                </div>

                                <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
                                    {selectedDateTransactions.map(transaction => (
                                        <div
                                            key={transaction.id}
                                            className={`
                        p-3 rounded-lg flex justify-between items-center
                        ${transaction.type === 'income'
                                                    ? 'bg-green-50 dark:bg-green-900 dark:bg-opacity-20 border border-green-100 dark:border-green-800'
                                                    : 'bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-100 dark:border-red-800'
                                                }
                      `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`
                          p-2 rounded-full
                          ${transaction.type === 'income'
                                                        ? 'bg-green-100 dark:bg-green-800'
                                                        : 'bg-red-100 dark:bg-red-800'
                                                    }
                        `}>
                                                    {transaction.type === 'income'
                                                        ? (incomeCategories.find(cat => cat.id === transaction.category)?.icon || <CircleDollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />)
                                                        : (expenseCategories.find(cat => cat.id === transaction.category)?.icon || <CreditCard className="h-4 w-4 text-red-600 dark:text-red-400" />)
                                                    }
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {transaction.type === 'income'
                                                            ? incomeCategories.find(cat => cat.id === transaction.category)?.name || transaction.category
                                                            : expenseCategories.find(cat => cat.id === transaction.category)?.name || transaction.category
                                                        }
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {transaction.description || 'ไม่มีรายละเอียด'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className={`font-bold ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {parseFloat(transaction.amount).toLocaleString()} ฿
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteTransaction(transaction.id, transaction.type)}
                                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20 p-1 h-auto"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    {selectedDateTransactions.length === 0 && (
                                        <div className="text-center py-6">
                                            <p className="text-gray-500 dark:text-gray-400">ไม่มีรายการในวันนี้</p>
                                        </div>
                                    )}
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        ปิด
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}