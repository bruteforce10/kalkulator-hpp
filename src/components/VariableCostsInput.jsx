import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Plus, Trash2, Sparkles } from "lucide-react"
import { formatCurrency, parseFormattedNumber, formatInputNumber } from "@/lib/utils"

export function VariableCostsInput({ variableCosts, onAdd, onRemove, onChange, onAIFill, loadingAI, productName }) {
  const totalVariableCost = variableCosts.reduce(
    (sum, item) => {
      const cost = parseFormattedNumber(item.cost)
      return sum + (isNaN(cost) ? 0 : cost)
    },
    0
  )

  // Handler untuk format input
  const handleNumberInput = (value) => {
    const cleaned = value.replace(/[^\d]/g, '')
    return cleaned ? formatInputNumber(cleaned) : ''
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle>Biaya Variabel per Produk</CardTitle>
            <CardDescription>
              Masukkan bahan-bahan dan biaya per unit untuk 1 produk
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {onAIFill && productName && (
              <Button
                onClick={onAIFill}
                disabled={loadingAI || !productName.trim()}
                size="sm"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {loadingAI ? "Memproses..." : "Rekomendasi AI"}
              </Button>
            )}
            <Button onClick={onAdd} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Bahan
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loadingAI && (
          <div className="mb-4 rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
            <Sparkles className="mx-auto h-5 w-5 mb-2 animate-pulse" />
            AI sedang menganalisis produk dan mengisi bahan-bahan...
          </div>
        )}
        <div className="space-y-4">
          {variableCosts.map((item, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor={`var-name-${index}`}>Nama Bahan</Label>
                <Input
                  id={`var-name-${index}`}
                  placeholder="Contoh: Kopi bubuk"
                  value={item.name}
                  onChange={(e) =>
                    onChange(index, { ...item, name: e.target.value })
                  }
                />
              </div>
              <div className="flex-1">
                <Label htmlFor={`var-cost-${index}`}>Biaya per Unit</Label>
                <Input
                  id={`var-cost-${index}`}
                  type="text"
                  inputMode="numeric"
                  placeholder="Contoh: 2.250"
                  value={item.cost}
                  onChange={(e) =>
                    onChange(index, { ...item, cost: handleNumberInput(e.target.value) })
                  }
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => onRemove(index)}
                  disabled={variableCosts.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <div className="rounded-lg bg-muted p-4">
            <div className="flex justify-between">
              <span className="font-medium">Total Biaya Variabel:</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(totalVariableCost)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

