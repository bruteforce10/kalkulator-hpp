import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

export function BEPAnalysis({ bep, sellingPrice, dailySales, onChange }) {
  if (!bep.isValid) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">BEP Tidak Valid</CardTitle>
          <CardDescription>
            Harga jual harus lebih besar dari biaya variabel untuk mencapai BEP
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const daysToBEP = dailySales > 0 ? Math.ceil(bep.bepUnit / dailySales) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Break Even Point (BEP)</CardTitle>
        <CardDescription>
          Titik dimana total pendapatan sama dengan total biaya
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">BEP dalam Unit</p>
            <p className="text-3xl font-bold text-primary">
              {formatNumber(bep.bepUnit)} unit
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">BEP dalam Rupiah</p>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(bep.bepRupiah)}
            </p>
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="daily-sales">Penjualan Harian (unit)</Label>
            <Input
              id="daily-sales"
              className={"w-full"}
              placeholder="Contoh: 30"
              value={dailySales}
              onChange={(e) => onChange(e.target.value)}
            />
            <span className="text-muted-foreground text-sm">
              Digunakan untuk menghitung waktu tercapainya BEP
            </span>
          </div>
        </div>
        {daysToBEP && (
          <div className="mt-4 rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              Dengan penjualan {formatNumber(dailySales)} unit/hari
            </p>
            <p className="text-lg font-semibold">
              BEP akan tercapai dalam {formatNumber(daysToBEP)} hari
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
