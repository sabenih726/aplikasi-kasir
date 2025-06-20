import { supabase, isSupabaseConfigured } from "./supabase"

// Types
export interface Product {
  id: string
  name: string
  price: number
  stock?: number
  created_at?: string
  updated_at?: string
}

export interface Transaction {
  id: string
  transaction_number: string
  total: number
  payment_method: string
  cash_received?: number
  change_amount?: number
  created_at: string
  transaction_items?: TransactionItem[]
}

export interface TransactionItem {
  id: string
  transaction_id: string
  product_id?: string
  product_name: string
  price: number
  quantity: number
  subtotal: number
}

// Default products for fallback
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

// Fallback to localStorage when Supabase is not configured
const getLocalStorageData = (key: string, defaultValue: any = []) => {
  if (typeof window === "undefined") return defaultValue
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch {
    return defaultValue
  }
}

const setLocalStorageData = (key: string, data: any) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error("Error saving to localStorage:", error)
  }
}

// Products
export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const products = getLocalStorageData("products", defaultProducts)
    return products
  }

  const { data, error } = await supabase.from("products").select("*").order("name")

  if (error) {
    console.error("Error fetching products:", error)
    // Fallback to localStorage on error
    return getLocalStorageData("products", defaultProducts)
  }

  return data || []
}

export async function createProduct(
  product: Omit<Product, "id" | "created_at" | "updated_at">,
): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const products = getLocalStorageData("products", defaultProducts)
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const updatedProducts = [...products, newProduct]
    setLocalStorageData("products", updatedProducts)
    return newProduct
  }

  const { data, error } = await supabase.from("products").insert([product]).select().single()

  if (error) {
    console.error("Error creating product:", error)
    return null
  }

  return data
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const products = getLocalStorageData("products", defaultProducts)
    const updatedProducts = products.map((p: Product) =>
      p.id === id ? { ...p, ...product, updated_at: new Date().toISOString() } : p,
    )
    setLocalStorageData("products", updatedProducts)
    return updatedProducts.find((p: Product) => p.id === id) || null
  }

  const { data, error } = await supabase
    .from("products")
    .update({ ...product, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating product:", error)
    return null
  }

  return data
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const products = getLocalStorageData("products", defaultProducts)
    const updatedProducts = products.filter((p: Product) => p.id !== id)
    setLocalStorageData("products", updatedProducts)
    return true
  }

  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    console.error("Error deleting product:", error)
    return false
  }

  return true
}

// Transactions
export async function getTransactions(limit?: number): Promise<Transaction[]> {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const transactions = getLocalStorageData("transactions", [])
    const sorted = transactions.sort(
      (a: Transaction, b: Transaction) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    return limit ? sorted.slice(0, limit) : sorted
  }

  let query = supabase
    .from("transactions")
    .select(`
      *,
      transaction_items (
        id,
        product_name,
        price,
        quantity,
        subtotal
      )
    `)
    .order("created_at", { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching transactions:", error)
    return getLocalStorageData("transactions", [])
  }

  return data || []
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const transactions = getLocalStorageData("transactions", [])
    return transactions.find((t: Transaction) => t.id === id) || null
  }

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      *,
      transaction_items (
        id,
        product_name,
        price,
        quantity,
        subtotal
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching transaction:", error)
    return null
  }

  return data
}

export async function createTransaction(
  transaction: Omit<Transaction, "id" | "created_at" | "transaction_items">,
  items: Omit<TransactionItem, "id" | "transaction_id">[],
): Promise<Transaction | null> {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const transactions = getLocalStorageData("transactions", [])
    const transactionNumber = `TRX${Date.now()}`
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      transaction_number: transactionNumber,
      created_at: new Date().toISOString(),
      transaction_items: items.map((item, index) => ({
        ...item,
        id: `${Date.now()}-${index}`,
        transaction_id: Date.now().toString(),
      })),
    }

    const updatedTransactions = [...transactions, newTransaction]
    setLocalStorageData("transactions", updatedTransactions)
    return newTransaction
  }

  // Generate transaction number
  const transactionNumber = `TRX${Date.now()}`

  // Start transaction
  const { data: transactionData, error: transactionError } = await supabase
    .from("transactions")
    .insert([{ ...transaction, transaction_number: transactionNumber }])
    .select()
    .single()

  if (transactionError) {
    console.error("Error creating transaction:", transactionError)
    return null
  }

  // Insert transaction items
  const transactionItems = items.map((item) => ({
    ...item,
    transaction_id: transactionData.id,
  }))

  const { error: itemsError } = await supabase.from("transaction_items").insert(transactionItems)

  if (itemsError) {
    console.error("Error creating transaction items:", itemsError)
    // Rollback transaction
    await supabase.from("transactions").delete().eq("id", transactionData.id)
    return null
  }

  // Return transaction with items
  return await getTransactionById(transactionData.id)
}

// Analytics
export async function getTodayStats(): Promise<{
  totalSales: number
  totalTransactions: number
}> {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const transactions = getLocalStorageData("transactions", [])
    const today = new Date().toDateString()

    const todayTransactions = transactions.filter((t: Transaction) => new Date(t.created_at).toDateString() === today)

    const totalSales = todayTransactions.reduce((sum: number, t: Transaction) => sum + t.total, 0)
    const totalTransactions = todayTransactions.length

    return { totalSales, totalTransactions }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data, error } = await supabase
    .from("transactions")
    .select("total")
    .gte("created_at", today.toISOString())
    .lt("created_at", tomorrow.toISOString())

  if (error) {
    console.error("Error fetching today stats:", error)
    return { totalSales: 0, totalTransactions: 0 }
  }

  const totalSales = data.reduce((sum, t) => sum + t.total, 0)
  const totalTransactions = data.length

  return { totalSales, totalTransactions }
}

export async function getTransactionsByDateRange(startDate: string, endDate?: string): Promise<Transaction[]> {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const transactions = getLocalStorageData("transactions", [])
    return transactions.filter((t: Transaction) => {
      const transactionDate = new Date(t.created_at)
      const start = new Date(startDate)
      const end = endDate ? new Date(endDate) : new Date()

      return transactionDate >= start && transactionDate <= end
    })
  }

  let query = supabase
    .from("transactions")
    .select(`
      *,
      transaction_items (
        id,
        product_name,
        price,
        quantity,
        subtotal
      )
    `)
    .gte("created_at", startDate)
    .order("created_at", { ascending: false })

  if (endDate) {
    query = query.lte("created_at", endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching transactions by date range:", error)
    return []
  }

  return data || []
}
