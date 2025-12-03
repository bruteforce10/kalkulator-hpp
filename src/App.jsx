import { useState, useEffect, useRef } from "react";
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
import { parseFormattedNumber } from "./lib/utils";
import { ImagePlus, X } from "lucide-react";

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
  const [productImage, setProductImage] = useState({
    base64: "",
    preview: "",
    mimeType: "",
    name: "",
  });
  const imageInputRef = useRef(null);

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
    parseFormattedNumber(targetSales)
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
  const handleProductImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setProductImage({ base64: "", preview: "", mimeType: "", name: "" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        const [, base64Data] = result.split(",");
        setProductImage({
          base64: base64Data || "",
          preview: result,
          mimeType: file.type || "image/png",
          name: file.name,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProductImage = () => {
    setProductImage({ base64: "", preview: "", mimeType: "", name: "" });
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
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
      const imagePayload =
        productImage.base64 && productImage.mimeType
          ? {
              data: productImage.base64,
              mimeType: productImage.mimeType || "image/png",
            }
          : null;
      const allCosts = await getAllCostsFromAI(
        productName,
        productCategory,
        imagePayload
      );

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
      const imagePayload =
        productImage.base64 && productImage.mimeType
          ? {
              data: productImage.base64,
              mimeType: productImage.mimeType || "image/png",
            }
          : null;
      const aiPriceRec = await getAIPriceRecommendations(
        productName,
        productCategory,
        hppData.hpp,
        hppData.variableCostPerUnit,
        hppData.totalFixedCostPerMonth || 0,
        parseFormattedNumber(targetSales) || 0,
        imagePayload
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
                    <option value="food & baverage">Makanan & Minuman</option>
                    <option value="retail">Retail</option>
                    <option value="other">Lainnya</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-image">
                    Gambar Produk (Opsional)
                  </Label>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border border-dashed border-muted-foreground/40 bg-muted">
                      {productImage.preview ? (
                        <img
                          src={productImage.preview}
                          alt="Preview produk"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-xs text-muted-foreground">
                          <ImagePlus className="mb-1 h-6 w-6" />
                          <span>Belum ada</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <input
                        id="product-image"
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProductImageChange}
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => imageInputRef.current?.click()}
                        >
                          Pilih Gambar
                        </Button>
                        {productImage.preview && (
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={handleRemoveProductImage}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Hapus
                          </Button>
                        )}
                      </div>
                      {productImage.name && (
                        <p className="text-xs text-muted-foreground">
                          {productImage.name}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground max-w-sm">
                        Gambar akan membantu AI memberikan saran komponen biaya
                        yang lebih akurat.
                      </p>
                    </div>
                  </div>
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
            />
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
          <div className="mt-6 space-y-6">
            <ProfitAnalysis
              sellingPrice={selectedPrice}
              variableCostPerUnit={hppData.variableCostPerUnit || 0}
              totalFixedCostPerMonth={hppData.totalFixedCostPerMonth || 0}
              fixedCostPerUnit={hppData.fixedCostPerUnit || 0}
              targetSalesPerMonth={parseFormattedNumber(targetSales)}
            />
            <BEPAnalysis
              bep={bep}
              sellingPrice={selectedPrice}
              dailySales={dailySales}
              onChange={setDailySales}
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
