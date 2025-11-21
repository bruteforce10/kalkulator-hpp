import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { generateSimulationTable } from "@/lib/calculations"

export function ProfitChart({ hpp, sellingPrice, variableCostPerUnit, totalFixedCost }) {
  if (sellingPrice <= 0) {
    return null
  }

  const simulationData = generateSimulationTable(
    hpp,
    sellingPrice,
    variableCostPerUnit,
    totalFixedCost,
    1000
  )

  const chartData = simulationData.map((row) => ({
    units: row.units,
    revenue: row.revenue,
    totalCost: row.totalCost,
    profit: row.profit,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grafik Profit</CardTitle>
        <CardDescription>
          Visualisasi hubungan antara jumlah penjualan dengan profit
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="units" />
            <YAxis />
            <Tooltip
              formatter={(value) =>
                new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(value)
              }
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="totalCost"
              stroke="#ef4444"
              name="Total Cost"
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#10b981"
              name="Profit"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

