"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Trash2, Package } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  price: number
  stock?: number
}

const defaultProducts: Product[] = [
  { id: "1", name: "Roti Tawar", price: 12000 },
  { id: "2", name: "Roti Coklat", price: 15000 },
  { id: "3", name: "Roti Keju", price: 18000 },
  { id: "4", name: "Croissant", price: 25000 },
  { id: "5", name: "Donat Gula", price: 8000 },
  { id: "6", name: "Donat Coklat", price: 10000 },
  { id: "7", name: "Roti Pisang", price: 13000 },
  { id: "8", name: "Roti Abon", price: 16000 },
]

export default function ProdukPage() {
  const [products, setProducts] = useState<Product[]>(defaultProducts)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
  })

  useEffect(() => {
    const savedProducts = localStorage.getItem("products")
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts))
    } else {
      localStorage.setItem("products", JSON.stringify(defaultProducts))
    }
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount)
  }

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts)
    localStorage.setItem("products", JSON.stringify(newProducts))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.price) {
      alert("Nama dan harga produk harus diisi!")
      return
    }

    const productData = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.name,
      price: Number.parseFloat(formData.price),
      stock: formData.stock ? Number.parseInt(formData.stock) : undefined,
    }

    if (editingProduct) {
      // Update existing product
      const updatedProducts = products.map((p) => (p.id === editingProduct.id ? productData : p))
      saveProducts(updatedProducts)
    } else {
      // Add new product
      saveProducts([...products, productData])
    }

    // Reset form
    setFormData({ name: "", price: "", stock: "" })
    setShowForm(false)
    setEditingProduct(null)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock?.toString() || "",
    })
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Yakin ingin menghapus produk ini?")) {
      const updatedProducts = products.filter((p) => p.id !== id)
      saveProducts(updatedProducts)
    }
  }

  const cancelForm = () => {
    setFormData({ name: "", price: "", stock: "" })
    setShowForm(false)
    setEditingProduct(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Kelola Produk</h1>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{editingProduct ? "Edit Produk" : "Tambah Produk Baru"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Produk *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Contoh: Roti Coklat"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Harga *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="15000"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stok (Opsional)</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="Kosongkan jika tidak ingin melacak stok"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">{editingProduct ? "Update" : "Tambah"} Produk</Button>
                  <Button type="button" variant="outline" onClick={cancelForm}>
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Daftar Produk ({products.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">Belum ada produk</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4 space-y-3">
                    <div>
                      <h3 className="font-medium text-lg">{product.name}</h3>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(product.price)}</p>
                      {product.stock !== undefined && (
                        <Badge variant="outline" className="mt-2">
                          Stok: {product.stock}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(product)} className="flex-1">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
