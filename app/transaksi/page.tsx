"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getProducts, createTransaction, type Product } from "@/lib/database"

interface CartItem extends Product {
  quantity: number
  subtotal: number
}

export default function TransaksiPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("tunai")
  const [cashReceived, setCashReceived] = useState("")
  const [showPayment, setShowPayment] = useState(false)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      console.error("Error loading products:", error)
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

  const addToCart = () => {
    if (!selectedProduct) return

    const product = products.find((p) => p.id === selectedProduct)
    if (!product) return

    const existingItem = cart.find((item) => item.id === selectedProduct)

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === selectedProduct
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * item.price,
              }
            : item,
        ),
      )
    } else {
      setCart([
        ...cart,
        {
          ...product,
          quantity,
          subtotal: product.price * quantity,
        },
      ])
    }

    setSelectedProduct("")
    setQuantity(1)
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id)
      return
    }

    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price } : item,
      ),
    )
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0)
  }

  const getChange = () => {
    const cash = Number.parseFloat(cashReceived) || 0
    return cash - getTotalAmount()
  }

  const processTransaction = async () => {
    if (cart.length === 0) return

    if (paymentMethod === "tunai" && getChange() < 0) {
      alert("Uang yang diterima kurang!")
      return
    }

    setProcessing(true)

    try {
      const transactionData = {
        total: getTotalAmount(),
        payment_method: paymentMethod,
        cash_received: paymentMethod === "tunai" ? Number.parseFloat(cashReceived) : null,
        change_amount: paymentMethod === "tunai" ? getChange() : null,
      }

      const items = cart.map((item) => ({
        product_id: item.id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
      }))

      const transaction = await createTransaction(transactionData, items)

      if (transaction) {
        // Redirect to receipt page
        router.push(`/struk/${transaction.id}`)
      } else {
        alert("Gagal memproses transaksi. Silakan coba lagi.")
      }
    } catch (error) {
      console.error("Error processing transaction:", error)
      alert("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat produk...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Transaksi Baru</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Items */}
          <Card>
            <CardHeader>
              <CardTitle>Tambah Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Pilih Produk</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih roti..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {formatCurrency(product.price)}
                        {product.stock !== null && product.stock !== undefined && (
                          <span className="text-gray-500 ml-2">(Stok: {product.stock})</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Jumlah</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                    className="text-center w-20"
                    min="1"
                  />
                  <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button onClick={addToCart} className="w-full" disabled={!selectedProduct}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah ke Keranjang
              </Button>
            </CardContent>
          </Card>

          {/* Cart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Keranjang ({cart.length} item)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Keranjang masih kosong</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="font-bold">{formatCurrency(item.subtotal)}</p>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">{formatCurrency(getTotalAmount())}</span>
                  </div>

                  <Button onClick={() => setShowPayment(true)} className="w-full" disabled={cart.length === 0}>
                    Lanjut ke Pembayaran
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Modal */}
        {showPayment && (
          <Card className="fixed inset-4 z-50 bg-white shadow-lg max-w-md mx-auto my-auto h-fit">
            <CardHeader>
              <CardTitle>Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Total Belanja</Label>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(getTotalAmount())}</div>
              </div>

              <div className="space-y-2">
                <Label>Metode Pembayaran</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tunai">Tunai</SelectItem>
                    <SelectItem value="qris">QRIS</SelectItem>
                    <SelectItem value="transfer">Transfer Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === "tunai" && (
                <>
                  <div className="space-y-2">
                    <Label>Uang Diterima</Label>
                    <Input
                      type="number"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="Masukkan jumlah uang..."
                    />
                  </div>

                  {cashReceived && (
                    <div className="space-y-2">
                      <Label>Kembalian</Label>
                      <div className={`text-xl font-bold ${getChange() >= 0 ? "text-blue-600" : "text-red-600"}`}>
                        {formatCurrency(getChange())}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPayment(false)}
                  className="flex-1"
                  disabled={processing}
                >
                  Batal
                </Button>
                <Button onClick={processTransaction} className="flex-1" disabled={processing}>
                  {processing ? "Memproses..." : "Selesai"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {showPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowPayment(false)} />
        )}
      </div>
    </div>
  )
}
