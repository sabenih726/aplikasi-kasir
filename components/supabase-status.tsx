"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, X } from "lucide-react"
import { isSupabaseConfigured } from "@/lib/supabase"

export function SupabaseStatus() {
  const [isConfigured, setIsConfigured] = useState(false)
  const [showAlert, setShowAlert] = useState(true)

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured())
  }, [])

  if (isConfigured || !showAlert) {
    return null
  }

  return (
    <Alert className="mb-6 border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <strong className="text-orange-800">Mode Offline:</strong>
          <span className="text-orange-700 ml-2">
            Aplikasi berjalan dengan localStorage. Untuk fitur cloud, konfigurasikan Supabase.
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAlert(false)}
          className="text-orange-600 hover:text-orange-800"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  )
}
