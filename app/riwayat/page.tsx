"use client"

import { useState, useEffect } from "react"
import { getTransactions, type Transaction } from "@/lib/localStorage"

const RiwayatPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = () => {
    setLoading(true)
    try {
      const data = getTransactions()
      setTransactions(data.reverse()) // Show newest first
      setFilteredTransactions(data)
    } catch (error) {
      console.error("Error loading transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Riwayat Transaksi</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {filteredTransactions.map((transaction) => (
            <li key={transaction.id}>
              {transaction.description} - {transaction.amount}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default RiwayatPage
