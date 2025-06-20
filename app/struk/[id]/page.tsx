"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Printer, Share } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { getTransactionById, type Transaction } from "@/lib/database"

export default function StrukPage() {
  const params = useParams()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTransaction()
  }, [params.id])

  const loadTransaction = async () => {
    if (!params.id || typeof params.id !== "string") return

    setLoading(true)
    try {
      const data = await getTransactionById(params.id)
      setTransaction(data)
    } catch (error) {
      console.error("Error loading transaction:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = () => {
    if (navigator.share && transaction) {
      const text = `Struk Belanja Toko Roti\n\nNo: #${transaction.transaction_number}\nTanggal: ${new Date(transaction.created_at).toLocaleString("id-ID")}\n\nItem:\n${transaction.transaction_items?.map((item) => `${item.product_name} x${item.quantity} = ${formatCurrency(item.subtotal)}`).join("\n")}\n\nTotal: ${formatCurrency(transaction.total)}\nPembayaran: ${transaction.payment_method.toUpperCase()}\n\nTerima kasih!`

      navigator.share({
        title: "Struk Belanja",
        text: text,
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat struk...</p>
        </div>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Struk tidak ditemukan</p>
            <Link href="/" className="mt-4 inline-block">
              <Button>Kembali ke Beranda</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header - Hidden when printing */}
        <div className="flex items-center gap-4 print:hidden">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Struk Digital</h1>
        </div>

        {/* Receipt */}
        <Card className="print:shadow-none print:border-none">
          <CardContent className="p-6 space-y-4">
            {/* Store Header */}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold">TOKO ROTI BAHAGIA</h2>
              <p className="text-sm text-gray-600">Jl. Raya No. 123, Kota</p>
              <p className="text-sm text-gray-600">Telp: 0812-3456-7890</p>
            </div>

            <Separator />

            {/* Transaction Info */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>No. Transaksi:</span>
                <span className="font-mono">#{transaction.transaction_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span>{new Date(transaction.created_at).toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>Admin</span>
              </div>
            </div>

            <Separator />

            {/* Items */}
            <div className="space-y-2">
              {transaction.transaction_items?.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.product_name}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>
                      {item.quantity} x {formatCurrency(item.price)}
                    </span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Total */}
            <div className="space-y-2">
              <div className="flex justify-between text-lg font-bold">
                <span>TOTAL:</span>
                <span>{formatCurrency(transaction.total)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Pembayaran:</span>
                <span className="uppercase">{transaction.payment_method}</span>
              </div>

              {transaction.payment_method === "tunai" && transaction.cash_received && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Diterima:</span>
                    <span>{formatCurrency(transaction.cash_received)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Kembalian:</span>
                    <span>{formatCurrency(transaction.change_amount || 0)}</span>
                  </div>
                </>
              )}
            </div>

            <Separator />

            {/* Footer */}
            <div className="text-center space-y-2 text-sm text-gray-600">
              <p>Terima kasih atas kunjungan Anda!</p>
              <p>Barang yang sudah dibeli tidak dapat dikembalikan</p>
              <p>Simpan struk ini sebagai bukti pembelian</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons - Hidden when printing */}
        <div className="grid grid-cols-3 gap-2 print:hidden">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Cetak
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share className="mr-2 h-4 w-4" />
            Bagikan
          </Button>
          <Link href="/transaksi">
            <Button className="w-full">Transaksi Baru</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
