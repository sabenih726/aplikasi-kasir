import { createClient } from "@supabase/supabase-js"

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a mock client if environment variables are not set
let supabase: any

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  // Mock client for development when Supabase is not configured
  supabase = {
    from: () => ({
      select: () => ({ data: [], error: new Error("Supabase not configured") }),
      insert: () => ({ data: null, error: new Error("Supabase not configured") }),
      update: () => ({ data: null, error: new Error("Supabase not configured") }),
      delete: () => ({ error: new Error("Supabase not configured") }),
      eq: function () {
        return this
      },
      gte: function () {
        return this
      },
      lt: function () {
        return this
      },
      lte: function () {
        return this
      },
      order: function () {
        return this
      },
      limit: function () {
        return this
      },
      single: function () {
        return this
      },
    }),
  }
}

export { supabase }

// Types for our database
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

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}
