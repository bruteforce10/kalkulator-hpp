import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { formatCurrency } from "@/lib/utils"

export function HPPResult({ hpp, variableCostPerUnit, fixedCostPerUnit }) {
  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle className="text-primary">Hasil Perhitungan HPP</CardTitle>
        <CardDescription>
          Harga Pokok Produksi per unit produk
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Biaya Variabel per Unit:</span>
            <span className="text-lg font-semibold">
              {formatCurrency(variableCostPerUnit)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Biaya Tetap per Unit:</span>
            <span className="text-lg font-semibold">
              {formatCurrency(fixedCostPerUnit)}
            </span>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total HPP per Unit:</span>
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(hpp)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

