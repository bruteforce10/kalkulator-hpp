import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { formatCurrency, formatNumber, parseFormattedNumber, formatInputNumber } from "@/lib/utils"

export function ProfitAnalysis({ 
  sellingPrice, 
  variableCostPerUnit, 
  totalFixedCostPerMonth, 
  fixedCostPerUnit = 0,
  targetSalesPerMonth = 0,
}) {
  const [targetProfit, setTargetProfit] = useState("")
  const [customSellingPrice, setCustomSellingPrice] = useState("")
  
  // Parse nilai dari format display ke angka
  const targetProfitValue = parseFormattedNumber(targetProfit) // L = Target Laba Bersih
  const customSellingPriceValue = parseFormattedNumber(customSellingPrice)
  
  // Variabel perhitungan:
  // P = Harga Jual per unit (activeSellingPrice)
  // V = Biaya Variabel per unit (variableCostPerUnit)
  // F = Total Biaya Tetap per bulan (totalFixedCostPerMonth)
  // L = Target Laba Bersih per bulan (targetProfitValue)
  
  // Gunakan harga jual custom jika diisi, jika tidak gunakan harga rekomendasi
  const P = customSellingPrice ? customSellingPriceValue : sellingPrice
  const V = variableCostPerUnit
  const targetSalesValue = typeof targetSalesPerMonth === "number" ? targetSalesPerMonth : 0
  const fixedCostFromTargetSales = fixedCostPerUnit > 0 && targetSalesValue > 0
    ? fixedCostPerUnit * targetSalesValue
    : 0
  const F = fixedCostFromTargetSales > 0 ? fixedCostFromTargetSales : totalFixedCostPerMonth
  const L = targetProfitValue
  
  // Contribution Margin per unit = P - V
  const contributionMargin = P - V
  
  // Rumus: u = (F + L) / (P - V)
  // Total Jual / Bulan yang dibutuhkan untuk mencapai target laba
  const totalSalesPerMonth = contributionMargin > 0 && L > 0
    ? Math.ceil((F + L) / contributionMargin)
    : 0
  
  // Target Jual / Hari = u / 30
  const salesPerDay = totalSalesPerMonth > 0 ? totalSalesPerMonth / 30 : 0
  
  // Potensi Omzet / Bulan = P × u
  const potentialRevenue = P * totalSalesPerMonth
  
  // Total Biaya Produksi / Bulan = (V × u) + F
  const totalVariableCost = V * totalSalesPerMonth
  const totalProductionCost = totalVariableCost + F
  
  // Proyeksi Laba Bersih / Bulan = Omzet - Total Biaya Produksi
  const projectedNetProfit = potentialRevenue - totalProductionCost

  // Handler untuk input dengan format ribuan
  const handleTargetProfitChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, '') // Hanya angka
    setTargetProfit(value ? formatInputNumber(value) : '')
  }

  const handleCustomPriceChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, '') // Hanya angka
    setCustomSellingPrice(value ? formatInputNumber(value) : '')
  }

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
            type="text"
            inputMode="numeric"
            placeholder="Contoh: 5.000.000"
            value={targetProfit}
            onChange={handleTargetProfitChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom-selling-price">Harga Jual Pilihan (Rp)</Label>
          <Input
            id="custom-selling-price"
            type="text"
            inputMode="numeric"
            placeholder={sellingPrice > 0 ? `Default: ${formatCurrency(sellingPrice)}` : "Masukkan harga jual"}
            value={customSellingPrice}
            onChange={handleCustomPriceChange}
          />
          {sellingPrice > 0 && !customSellingPrice && (
            <p className="text-xs text-muted-foreground">
              Kosongkan untuk menggunakan harga rekomendasi: {formatCurrency(sellingPrice)}
            </p>
          )}
        </div>
        
        {P > 0 && (
          <div className="space-y-3 rounded-lg bg-muted p-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Harga Jual (P):</span>
              <span className="font-semibold">
                {formatCurrency(P)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Biaya Variabel per Unit (V):</span>
              <span className="font-semibold">
                {formatCurrency(V)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Biaya Tetap / Bulan (F):</span>
              <span className="font-semibold">
                {formatCurrency(F)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm text-muted-foreground">Contribution Margin (P - V):</span>
              <span className="font-semibold text-primary">
                {formatCurrency(contributionMargin)}
              </span>
            </div>
          </div>
        )}

        {/* Hasil Analisis dengan Card Berwarna */}
        {targetProfit && L > 0 && P > 0 && contributionMargin > 0 && (
          <div className="space-y-4 pt-4">
            {/* Target Jual - 2 kolom */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center">
                <p className="text-sm text-slate-600 mb-1">Target Jual / Hari</p>
                <p className="text-2xl font-bold text-slate-800">
                  {(Math.round(salesPerDay * 10) / 10).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} pcs
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center">
                <p className="text-sm text-slate-600 mb-1">Total Jual / Bulan</p>
                <p className="text-2xl font-bold text-slate-800">
                  {formatNumber(totalSalesPerMonth)} pcs
                </p>
              </div>
            </div>

            {/* Omzet & Biaya Produksi - 2 kolom */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-center">
                <p className="text-sm text-yellow-700 mb-1">Potensi Omzet / Bulan</p>
                <p className="text-xl font-bold text-yellow-800">
                  {formatCurrency(potentialRevenue)}
                </p>
              </div>
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center">
                <p className="text-sm text-red-600 mb-1">Total Biaya Produksi / Bulan</p>
                <p className="text-xl font-bold text-red-700">
                  {formatCurrency(totalProductionCost)}
                </p>
              </div>
            </div>

            {/* Biaya Tetap & Laba Bersih - 2 kolom */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
                <p className="text-sm text-amber-700 mb-1">Total Biaya Tetap / Bulan</p>
                <p className="text-xl font-bold text-amber-800">
                  {formatCurrency(F)}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
                <p className="text-sm text-emerald-600 mb-1">Proyeksi Laba Bersih / Bulan</p>
                <p className="text-xl font-bold text-emerald-700">
                  {formatCurrency(projectedNetProfit)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

