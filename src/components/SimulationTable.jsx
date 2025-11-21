import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { generateSimulationTable } from "@/lib/calculations"

export function SimulationTable({ hpp, sellingPrice, variableCostPerUnit, totalFixedCost }) {
  if (sellingPrice <= 0) {
    return null
  }

  const simulationData = generateSimulationTable(
    hpp,
    sellingPrice,
    variableCostPerUnit,
    totalFixedCost
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulasi Penjualan</CardTitle>
        <CardDescription>
          Tabel simulasi profit berdasarkan jumlah unit yang terjual
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Unit</th>
                <th className="p-2 text-right">Revenue</th>
                <th className="p-2 text-right">Biaya Variabel</th>
                <th className="p-2 text-right">Biaya Tetap</th>
                <th className="p-2 text-right">Total Biaya</th>
                <th className="p-2 text-right">Profit</th>
              </tr>
            </thead>
            <tbody>
              {simulationData.map((row, index) => (
                <tr
                  key={index}
                  className={`border-b ${
                    row.profit < 0
                      ? "bg-destructive/10"
                      : row.profit === 0
                      ? "bg-muted"
                      : ""
                  }`}
                >
                  <td className="p-2">{formatNumber(row.units)}</td>
                  <td className="p-2 text-right">{formatCurrency(row.revenue)}</td>
                  <td className="p-2 text-right">{formatCurrency(row.variableCost)}</td>
                  <td className="p-2 text-right">{formatCurrency(row.fixedCost)}</td>
                  <td className="p-2 text-right">{formatCurrency(row.totalCost)}</td>
                  <td
                    className={`p-2 text-right font-semibold ${
                      row.profit < 0
                        ? "text-destructive"
                        : row.profit > 0
                        ? "text-green-600"
                        : ""
                    }`}
                  >
                    {formatCurrency(row.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

