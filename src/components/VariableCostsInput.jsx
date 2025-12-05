import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select } from "./ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Plus, Trash2, Sparkles } from "lucide-react";
import {
  formatCurrency,
  parseFormattedNumber,
  formatInputNumber,
  calculateCostPerProduct,
} from "@/lib/utils";

const UNITS = [
  { value: "g", label: "g" },
  { value: "kg", label: "kg" },
  { value: "ml", label: "ml" },
  { value: "L", label: "L" },
  { value: "pcs", label: "pcs" },
  { value: "buah", label: "buah" },
  { value: "lembar", label: "lembar" },
];

export function VariableCostsInput({
  variableCosts,
  onAdd,
  onRemove,
  onChange,
  onAIFill,
  loadingAI,
  productName,
  calculationMode = "perPcs",
  batchSize = 0,
}) {
  // Calculate total variable cost from calculated cost per product
  let totalVariableCost = variableCosts.reduce((sum, item) => {
    // If item has the new structure (usageAmount, purchasePrice, etc.), calculate cost
    if (item.usageAmount !== undefined || item.purchasePrice !== undefined) {
      const cost = calculateCostPerProduct(
        parseFormattedNumber(item.usageAmount || 0),
        item.usageUnit || "",
        parseFormattedNumber(item.purchasePrice || 0),
        parseFormattedNumber(item.purchaseQuantity || 0),
        item.purchaseUnit || ""
      );
      return sum + (isNaN(cost) ? 0 : cost);
    }
    // Fallback to old structure (direct cost)
    const cost = parseFormattedNumber(item.cost || 0);
    return sum + (isNaN(cost) ? 0 : cost);
  }, 0);

  // Jika mode perBatch, bagi dengan batchSize untuk dapat biaya per produk
  if (calculationMode === "perBatch" && batchSize > 0) {
    totalVariableCost = totalVariableCost / batchSize;
  }

  // Handler untuk format input
  const handleNumberInput = (value) => {
    const cleaned = value.replace(/[^\d]/g, "");
    return cleaned ? formatInputNumber(cleaned) : "";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle>Biaya Variabel per Produk</CardTitle>
            <CardDescription>
              {calculationMode === "perBatch"
                ? "Rincikan semua bahan yang digunakan untuk membuat 1 resep/batch"
                : "Rincikan semua bahan yang digunakan untuk membuat produk jadi"}
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
        <div className="space-y-6">
          {variableCosts.map((item, index) => {
            // Calculate cost per product
            let calculatedCost = 0;
            if (
              item.usageAmount !== undefined ||
              item.purchasePrice !== undefined
            ) {
              calculatedCost = calculateCostPerProduct(
                parseFormattedNumber(item.usageAmount || 0),
                item.usageUnit || "",
                parseFormattedNumber(item.purchasePrice || 0),
                parseFormattedNumber(item.purchaseQuantity || 0),
                item.purchaseUnit || ""
              );
            } else {
              // Fallback to old structure
              calculatedCost = parseFormattedNumber(item.cost || 0);
            }

            // Jika mode perBatch, bagi dengan batchSize untuk dapat biaya per produk
            if (calculationMode === "perBatch" && batchSize > 0) {
              calculatedCost = calculatedCost / batchSize;
            }

            return (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-sm">Bahan {index + 1}</h4>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => onRemove(index)}
                    disabled={variableCosts.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Nama Bahan */}
                <div className="space-y-2">
                  <Label htmlFor={`var-name-${index}`}>Nama Bahan</Label>
                  <Input
                    id={`var-name-${index}`}
                    placeholder="Contoh: Kopi bubuk"
                    value={item.name || ""}
                    onChange={(e) =>
                      onChange(index, { ...item, name: e.target.value })
                    }
                  />
                </div>

                {/* Grid untuk Pemakaian per Produk dan Info Pembelian */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pemakaian per Produk/Batch */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {calculationMode === "perBatch"
                        ? "Pemakaian per Resep/Batch"
                        : "Pemakaian per Produk"}
                    </Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label
                          htmlFor={`var-usage-amount-${index}`}
                          className="text-xs text-muted-foreground"
                        >
                          Jumlah Pakai
                        </Label>
                        <Input
                          id={`var-usage-amount-${index}`}
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={item.usageAmount || ""}
                          onChange={(e) =>
                            onChange(index, {
                              ...item,
                              usageAmount: handleNumberInput(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="w-24">
                        <Label
                          htmlFor={`var-usage-unit-${index}`}
                          className="text-xs text-muted-foreground"
                        >
                          Satuan
                        </Label>
                        <Select
                          id={`var-usage-unit-${index}`}
                          value={item.usageUnit || ""}
                          onChange={(e) =>
                            onChange(index, {
                              ...item,
                              usageUnit: e.target.value,
                            })
                          }
                        >
                          <option value="">Pilih</option>
                          {UNITS.map((unit) => (
                            <option key={unit.value} value={unit.value}>
                              {unit.label}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Info Pembelian Bahan */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Info Pembelian Bahan
                    </Label>
                    <div className="space-y-2">
                      <div>
                        <Label
                          htmlFor={`var-purchase-price-${index}`}
                          className="text-xs text-muted-foreground"
                        >
                          Total Harga
                        </Label>
                        <Input
                          id={`var-purchase-price-${index}`}
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={item.purchasePrice || ""}
                          onChange={(e) =>
                            onChange(index, {
                              ...item,
                              purchasePrice: handleNumberInput(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label
                            htmlFor={`var-purchase-quantity-${index}`}
                            className="text-xs text-muted-foreground"
                          >
                            Jumlah Beli
                          </Label>
                          <Input
                            id={`var-purchase-quantity-${index}`}
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={item.purchaseQuantity || ""}
                            onChange={(e) =>
                              onChange(index, {
                                ...item,
                                purchaseQuantity: handleNumberInput(
                                  e.target.value
                                ),
                              })
                            }
                          />
                        </div>
                        <div className="w-24">
                          <Label
                            htmlFor={`var-purchase-unit-${index}`}
                            className="text-xs text-muted-foreground"
                          >
                            Satuan
                          </Label>
                          <Select
                            id={`var-purchase-unit-${index}`}
                            value={item.purchaseUnit || ""}
                            onChange={(e) =>
                              onChange(index, {
                                ...item,
                                purchaseUnit: e.target.value,
                              })
                            }
                          >
                            <option value="">Pilih</option>
                            {UNITS.map((unit) => (
                              <option key={unit.value} value={unit.value}>
                                {unit.label}
                              </option>
                            ))}
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Biaya Produk (calculated) */}
                <div className="rounded-lg bg-muted p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {calculationMode === "perBatch"
                        ? "Biaya per Produk (dari batch):"
                        : "Biaya Produk:"}
                    </span>
                    <span className="text-base font-bold text-primary">
                      {formatCurrency(calculatedCost)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
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
  );
}
