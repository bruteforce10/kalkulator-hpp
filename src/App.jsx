import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Select } from "./components/ui/select";
import { Button } from "./components/ui/button";
import { VariableCostsInput } from "./components/VariableCostsInput";
import { HPPResult } from "./components/HPPResult";
import { PriceRecommendation } from "./components/PriceRecommendation";
import { BEPAnalysis } from "./components/BEPAnalysis";
import { ProfitAnalysis } from "./components/ProfitAnalysis";
import { SimulationTable } from "./components/SimulationTable";
import { ProfitChart } from "./components/ProfitChart";
import {
  calculateHPP,
  calculatePriceRecommendations,
  calculateBEP,
} from "./lib/calculations";
import {
  initializeGemini,
  getAllCostsFromAI,
  getAIPriceRecommendations,
} from "./lib/gemini";
import { FixedCostsInput } from "./components/FixedCostsInput";

function App() {
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [variableCosts, setVariableCosts] = useState([{ name: "", cost: "" }]);
  const [fixedCosts, setFixedCosts] = useState([
    { name: "", totalCost: "", allocationPerUnit: "" },
  ]);
  const [targetSales, setTargetSales] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [dailySales, setDailySales] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingAIPrice, setLoadingAIPrice] = useState(false);
  const [aiPriceRecommendations, setAiPriceRecommendations] = useState(null);

  // Initialize Gemini on mount
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      initializeGemini(apiKey);
    }
  }, []);

  // Calculate HPP
  const hppData = calculateHPP(
    variableCosts,
    fixedCosts,
    parseFloat(targetSales) || 0
  );

  // Calculate price recommendations
  const priceRecommendations =
    hppData.hpp > 0 ? calculatePriceRecommendations(hppData.hpp) : null;

  // Calculate BEP
  const bep =
    selectedPrice > 0
      ? calculateBEP(fixedCosts, selectedPrice, hppData.variableCostPerUnit)
      : { bepUnit: 0, bepRupiah: 0, isValid: false };

  const handleAddVariableCost = () => {
    setVariableCosts([...variableCosts, { name: "", cost: "" }]);
  };

  const handleRemoveVariableCost = (index) => {
    if (variableCosts.length > 1) {
      setVariableCosts(variableCosts.filter((_, i) => i !== index));
    }
  };

  const handleVariableCostChange = (index, newValue) => {
    const updated = [...variableCosts];
    updated[index] = newValue;
    setVariableCosts(updated);
  };

  const handleGetAllAICosts = async () => {
    if (!productName.trim()) {
      alert("Mohon masukkan nama produk terlebih dahulu");
      return;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      alert(
        "API key tidak ditemukan. Silakan tambahkan VITE_GEMINI_API_KEY di file .env"
      );
      return;
    }

    setLoadingAI(true);
    try {
      const allCosts = await getAllCostsFromAI(productName, productCategory);

      let hasData = false;

      // Update variable costs jika ada
      if (allCosts.variableCosts && allCosts.variableCosts.length > 0) {
        setVariableCosts(allCosts.variableCosts);
        hasData = true;
      }

      // Update fixed costs jika ada
      if (allCosts.fixedCosts && allCosts.fixedCosts.length > 0) {
        setFixedCosts(allCosts.fixedCosts);
        hasData = true;
      }

      if (!hasData) {
        alert(
          "Tidak dapat mendapatkan rekomendasi dari AI. Coba lagi atau isi manual."
        );
      }
    } catch (error) {
      alert(
        "Error: " +
          error.message +
          "\n\nPastikan API key valid dan model Gemini tersedia."
      );
    } finally {
      setLoadingAI(false);
    }
  };

  const handleAddFixedCost = () => {
    setFixedCosts([
      ...fixedCosts,
      { name: "", totalCost: "", allocationPerUnit: "" },
    ]);
  };

  const handleRemoveFixedCost = (index) => {
    if (fixedCosts.length > 1) {
      setFixedCosts(fixedCosts.filter((_, i) => i !== index));
    }
  };

  const handleFixedCostChange = (index, newValue) => {
    const updated = [...fixedCosts];
    updated[index] = newValue;
    setFixedCosts(updated);
  };

  const handleGetAIPriceRecommendations = async () => {
    if (!productName.trim() || !hppData.hpp || hppData.hpp <= 0) {
      alert(
        "Mohon lengkapi nama produk dan pastikan HPP sudah terhitung terlebih dahulu"
      );
      return;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      alert(
        "API key tidak ditemukan. Silakan tambahkan VITE_GEMINI_API_KEY di file .env"
      );
      return;
    }

    setLoadingAIPrice(true);
    try {
      const aiPriceRec = await getAIPriceRecommendations(
        productName,
        productCategory,
        hppData.hpp,
        hppData.variableCostPerUnit,
        hppData.totalFixedCostPerMonth || 0,
        parseFloat(targetSales) || 0
      );

      if (aiPriceRec) {
        setAiPriceRecommendations(aiPriceRec);
      } else {
        alert("Tidak dapat mendapatkan rekomendasi harga dari AI. Coba lagi.");
      }
    } catch (error) {
      alert(
        "Error: " +
          error.message +
          "\n\nPastikan API key valid dan model Gemini tersedia."
      );
    } finally {
      setLoadingAIPrice(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Kalkulator HPP</h1>
          <p className="text-muted-foreground">
            Hitung Harga Pokok Produksi, tentukan harga jual ideal, dan analisis
            profit & BEP
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Produk</CardTitle>
                <CardDescription>
                  Masukkan detail produk yang akan dihitung
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Nama Produk</Label>
                  <Input
                    id="product-name"
                    placeholder="Contoh: Kopi Susu Gula Aren"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-category">Kategori Produk</Label>
                  <Select
                    id="product-category"
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                  >
                    <option value="">Pilih Kategori</option>
                    <option value="food">Makanan</option>
                    <option value="beverage">Minuman</option>
                    <option value="retail">Retail</option>
                    <option value="other">Lainnya</option>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Variable Costs */}
            <VariableCostsInput
              variableCosts={variableCosts}
              onAdd={handleAddVariableCost}
              onRemove={handleRemoveVariableCost}
              onChange={handleVariableCostChange}
              onAIFill={handleGetAllAICosts}
              loadingAI={loadingAI}
              productName={productName}
            />

            {/* Fixed Costs */}
            <FixedCostsInput
              fixedCosts={fixedCosts}
              targetSales={targetSales}
              onAdd={handleAddFixedCost}
              onRemove={handleRemoveFixedCost}
              onChange={(indexOrKey, newValue) => {
                if (indexOrKey === "targetSales") {
                  setTargetSales(newValue);
                } else {
                  handleFixedCostChange(indexOrKey, newValue);
                }
              }}
              onAIFill={handleGetAllAICosts}
              loadingAI={loadingAI}
              productName={productName}
            />

            {/* Daily Sales - Optional */}
            <Card>
              <CardHeader>
                <CardTitle>Penjualan Harian (Opsional)</CardTitle>
                <CardDescription>
                  Digunakan untuk menghitung waktu tercapainya BEP
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="daily-sales">Penjualan Harian (unit)</Label>
                  <Input
                    id="daily-sales"
                    type="number"
                    placeholder="Contoh: 30"
                    value={dailySales}
                    onChange={(e) => setDailySales(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* HPP Result */}
            {hppData.hpp > 0 && (
              <HPPResult
                hpp={hppData.hpp}
                variableCostPerUnit={hppData.variableCostPerUnit}
                fixedCostPerUnit={hppData.fixedCostPerUnit}
              />
            )}
          </div>
        </div>

        {/* Price Recommendations */}
        {priceRecommendations && (
          <div className="mt-6">
            <PriceRecommendation
              recommendations={priceRecommendations}
              hpp={hppData.hpp}
              onSelectPrice={setSelectedPrice}
              aiRecommendations={aiPriceRecommendations}
              loadingAI={loadingAIPrice}
              onGetAIRecommendations={handleGetAIPriceRecommendations}
              productName={productName}
            />
          </div>
        )}

        {/* Analysis Section */}
        {selectedPrice > 0 && (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <BEPAnalysis
              bep={bep}
              sellingPrice={selectedPrice}
              dailySales={parseFloat(dailySales) || 0}
            />
            <ProfitAnalysis
              hpp={hppData.hpp}
              sellingPrice={selectedPrice}
              totalFixedCost={hppData.totalFixedCostPerMonth || 0}
            />
          </div>
        )}

        {/* Charts and Tables */}
        {selectedPrice > 0 && (
          <div className="mt-6 space-y-6">
            <ProfitChart
              hpp={hppData.hpp}
              sellingPrice={selectedPrice}
              variableCostPerUnit={hppData.variableCostPerUnit}
              totalFixedCost={hppData.totalFixedCostPerMonth || 0}
            />
            <SimulationTable
              hpp={hppData.hpp}
              sellingPrice={selectedPrice}
              variableCostPerUnit={hppData.variableCostPerUnit}
              totalFixedCost={hppData.totalFixedCostPerMonth || 0}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
