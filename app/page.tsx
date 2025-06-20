"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, TrendingUp, Receipt, Package, RefreshCw } from "lucide-react"
import Link from "next/link"

interface Transaction {
  id: string
  date: string
  total: number
  items: Array<{
    name: string
    price: number
    quantity: number
  }>
  paymentMethod: string
}

export default function Dashboard() {
  const [todaySales, setTodaySales] = useState(0)
  const [todayTransactions, setTodayTransactions] = useState(0)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    setLoading(true)
    try {
      // Load data from localStorage
      const transactions = JSON.parse(localStorage.getItem("transactions") || "[]")
      const today = new Date().toDateString()

      const todayTxns = transactions.filter((t: Transaction) => new Date(t.date).toDateString() === today)

      const totalSales = todayTxns.reduce((sum: number, t: Transaction) => sum + t.total, 0)

      setTodaySales(totalSales)
      setTodayTransactions(todayTxns.length)
      setRecentTransactions(transactions.slice(-5).reverse())
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Kasir Toko Lely</h1>
          <p className="text-gray-600">Aplikasi Kasir Digital</p>
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/transaksi">
            <Button size="lg" className="w-full sm:w-auto">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Transaksi Baru
            </Button>
          </Link>
          <Link href="/riwayat">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Receipt className="mr-2 h-5 w-5" />
              Riwayat Transaksi
            </Button>
          </Link>
          <Link href="/produk">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Package className="mr-2 h-5 w-5" />
              Kelola Produk
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Penjualan Hari Ini</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loading ? "Loading..." : formatCurrency(todaySales)}
              </div>
              <p className="text-xs text-muted-foreground">{todayTransactions} transaksi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transaksi Terakhir</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading
                  ? "Loading..."
                  : recentTransactions.length > 0
                    ? formatCurrency(recentTransactions[0].total)
                    : formatCurrency(0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {recentTransactions.length > 0
                  ? new Date(recentTransactions[0].date).toLocaleTimeString("id-ID")
                  : "Belum ada transaksi"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-gray-500 py-8">Memuat data...</p>
            ) : recentTransactions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Belum ada transaksi hari ini</p>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">#{transaction.id.slice(-6)}</p>
                      <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleString("id-ID")}</p>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{transaction.paymentMethod}</Badge>
                        <Badge variant="outline">{transaction.items.length} item</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(transaction.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
