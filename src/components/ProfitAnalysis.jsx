import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { calculateSalesNeeded } from "@/lib/calculations"

export function ProfitAnalysis({ hpp, sellingPrice, totalFixedCost }) {
  const [targetProfit, setTargetProfit] = useState("")
  
  const profitPerUnit = sellingPrice > 0 ? sellingPrice - hpp : 0
  const salesNeeded = targetProfit 
    ? calculateSalesNeeded(parseFloat(targetProfit) || 0, profitPerUnit)
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analisis Profit & Penjualan</CardTitle>
        <CardDescription>
          Hitung jumlah penjualan yang dibutuhkan untuk mencapai target laba
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="target-profit">Target Laba Bersih Bulanan</Label>
          <Input
            id="target-profit"
            type="number"
            placeholder="Contoh: 5000000"
            value={targetProfit}
            onChange={(e) => setTargetProfit(e.target.value)}
          />
        </div>
        
        {sellingPrice > 0 && (
          <div className="space-y-3 rounded-lg bg-muted p-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Profit per Unit:</span>
              <span className="font-semibold">
                {formatCurrency(profitPerUnit)}
              </span>
            </div>
            {targetProfit && parseFloat(targetProfit) > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Jumlah Penjualan Dibutuhkan:
                </span>
                <span className="text-lg font-bold text-primary">
                  {formatNumber(salesNeeded)} unit
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

