"use client"

import { useState, useEffect } from "react"
import { getProducts, saveTransaction, generateTransactionId, type Product } from "@/lib/localStorage"

const TransaksiPage = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [cartItems, setCartItems] = useState<Product[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"Tunai" | "Debit" | "Kredit">("Tunai")
  const [cashReceived, setCashReceived] = useState<number>(0)
  const [change, setChange] = useState<number>(0)

  useEffect(() => {
    const storedProducts = getProducts()
    if (storedProducts) {
      setProducts(storedProducts)
    }
  }, [])

  const addToCart = (product: Product) => {
    setCartItems([...cartItems, product])
  }

  const removeFromCart = (index: number) => {
    const newCartItems = [...cartItems]
    newCartItems.splice(index, 1)
    setCartItems(newCartItems)
  }

  const totalAmount = cartItems.reduce((total, item) => total + item.price, 0)

  const handlePayment = () => {
    if (paymentMethod === "Tunai") {
      if (cashReceived < totalAmount) {
        alert("Jumlah uang tunai kurang!")
        return
      }
      setChange(cashReceived - totalAmount)
    }

    const transactionId = generateTransactionId()

    const transaction = {
      id: transactionId,
      date: new Date().toISOString(),
      items: cartItems,
      total: totalAmount,
      paymentMethod: paymentMethod,
      cashReceived: paymentMethod === "Tunai" ? cashReceived : undefined,
      change: paymentMethod === "Tunai" ? change : undefined,
    }

    console.log("Saving transaction:", transactionId)
    saveTransaction(transaction)
    console.log("Transaction saved successfully")

    setCartItems([])
    setCashReceived(0)
    setChange(0)
    alert("Transaksi berhasil!")
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Transaksi</h1>

      <div className="flex">
        <div className="w-1/2 pr-4">
          <h2 className="text-xl font-semibold mb-2">Daftar Produk</h2>
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border p-2 rounded">
                <p>{product.name}</p>
                <p>Harga: Rp {product.price}</p>
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => addToCart(product)}
                >
                  Tambah ke Keranjang
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="w-1/2 pl-4">
          <h2 className="text-xl font-semibold mb-2">Keranjang Belanja</h2>
          <ul>
            {cartItems.map((item, index) => (
              <li key={index} className="flex justify-between items-center py-2 border-b">
                <span>{item.name}</span>
                <span>Rp {item.price}</span>
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  onClick={() => removeFromCart(index)}
                >
                  Hapus
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <p className="font-semibold">Total: Rp {totalAmount}</p>

            <div className="mb-2">
              <label htmlFor="paymentMethod" className="block text-gray-700 text-sm font-bold mb-2">
                Metode Pembayaran:
              </label>
              <select
                id="paymentMethod"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as "Tunai" | "Debit" | "Kredit")}
              >
                <option value="Tunai">Tunai</option>
                <option value="Debit">Debit</option>
                <option value="Kredit">Kredit</option>
              </select>
            </div>

            {paymentMethod === "Tunai" && (
              <div>
                <label htmlFor="cashReceived" className="block text-gray-700 text-sm font-bold mb-2">
                  Uang Tunai Diterima:
                </label>
                <input
                  type="number"
                  id="cashReceived"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(Number(e.target.value))}
                />
                <p>Kembalian: Rp {change}</p>
              </div>
            )}

            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
              onClick={handlePayment}
            >
              Bayar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransaksiPage
