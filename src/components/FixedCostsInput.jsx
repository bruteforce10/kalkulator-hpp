import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function FixedCostsInput({
  fixedCosts,
  targetSales,
  onAdd,
  onRemove,
  onChange,
  onAIFill,
  loadingAI,
  productName,
}) {
  // Hitung total biaya tetap per bulan
  const totalFixedCostPerMonth = fixedCosts.reduce(
    (sum, item) => {
      const cost = parseFloat(item.totalCost) || 0;
      return sum + (isNaN(cost) ? 0 : cost);
    },
    0
  );

  // Hitung alokasi per produk untuk setiap item
  const calculateAllocationPerUnit = (totalCost) => {
    const sales = parseFloat(targetSales) || 0;
    return sales > 0 ? totalCost / sales : 0;
  };

  // Total alokasi per produk (gunakan nilai yang di-edit atau perhitungan otomatis)
  const totalAllocationPerUnit = fixedCosts.reduce((sum, item) => {
    const suggestedAllocation = calculateAllocationPerUnit(
      parseFloat(item.totalCost) || 0
    );
    // Gunakan nilai yang di-edit user jika ada, atau nilai perhitungan otomatis
    const allocation = item.allocationPerUnit !== undefined && item.allocationPerUnit !== ""
      ? parseFloat(item.allocationPerUnit) || 0
      : suggestedAllocation;
    return sum + allocation;
  }, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle>Alokasi Biaya Tetap</CardTitle>
            <CardDescription>
              Masukkan biaya tetap per bulan dan target penjualan untuk
              menghitung alokasi per produk
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
              Tambah Biaya
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loadingAI && (
          <div className="mb-4 rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
            <Sparkles className="mx-auto h-5 w-5 mb-2 animate-pulse" />
            AI sedang menganalisis produk dan mengisi biaya tetap...
          </div>
        )}
        <div className="space-y-4">
          {/* Target Sales Input */}
          <div className="space-y-2">
            <Label htmlFor="target-sales">
              Target Penjualan per Bulan (unit)
            </Label>
            <Input
              id="target-sales"
              type="number"
              placeholder="Contoh: 1000"
              value={targetSales}
              onChange={(e) => {
                // Trigger onChange untuk targetSales
                if (onChange && typeof onChange === "function") {
                  onChange("targetSales", e.target.value);
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Digunakan untuk menghitung alokasi biaya tetap per unit produk
            </p>
          </div>

          {/* Fixed Costs List */}
          <div className="space-y-3">
            {fixedCosts.map((item, index) => {
              // Hitung saran alokasi otomatis
              const suggestedAllocation = calculateAllocationPerUnit(
                parseFloat(item.totalCost) || 0
              );
              
              // Gunakan nilai yang di-edit user jika ada, atau nilai perhitungan otomatis
              const currentAllocation = item.allocationPerUnit !== undefined && item.allocationPerUnit !== ""
                ? parseFloat(item.allocationPerUnit) || 0
                : suggestedAllocation;
              
              // Format untuk display (hilangkan "Rp" dan formatting untuk input)
              const allocationDisplayValue = item.allocationPerUnit !== undefined && item.allocationPerUnit !== ""
                ? item.allocationPerUnit
                : "";

              return (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor={`fixed-name-${index}`}>Nama Biaya</Label>
                    <Input
                      id={`fixed-name-${index}`}
                      placeholder="Contoh: Sewa tempat"
                      value={item.name}
                      onChange={(e) =>
                        onChange(index, { ...item, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`fixed-cost-${index}`}>
                      Total Biaya (per bulan)
                    </Label>
                    <Input
                      id={`fixed-cost-${index}`}
                      type="number"
                      placeholder="Contoh: 2000000"
                      value={item.totalCost}
                      onChange={(e) =>
                        onChange(index, {
                          ...item,
                          totalCost: e.target.value,
                          // Reset allocationPerUnit saat totalCost berubah agar kembali ke saran otomatis
                          allocationPerUnit: "",
                        })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`fixed-allocation-${index}`}>
                      Alokasi per Produk (Rp)
                    </Label>
                    <Input
                      id={`fixed-allocation-${index}`}
                      type="number"
                      placeholder={suggestedAllocation > 0 ? Math.round(suggestedAllocation).toString() : "0"}
                      value={allocationDisplayValue}
                      onChange={(e) => {
                        const value = e.target.value;
                        onChange(index, {
                          ...item,
                          allocationPerUnit: value,
                        });
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Saran: {formatCurrency(suggestedAllocation)}
                    </p>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => onRemove(index)}
                      disabled={fixedCosts.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="space-y-2 rounded-lg bg-muted p-4">
            <div className="flex justify-between">
              <span className="font-medium">Total Biaya Tetap per Bulan:</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(totalFixedCostPerMonth)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Total Alokasi per Produk:</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(totalAllocationPerUnit)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

