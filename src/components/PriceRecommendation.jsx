import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { formatCurrency } from "@/lib/utils"
import { Sparkles } from "lucide-react"

export function PriceRecommendation({ 
  recommendations, 
  hpp, 
  onSelectPrice, 
  aiRecommendations, 
  loadingAI,
  onGetAIRecommendations,
  productName 
}) {
  // Gunakan AI recommendations jika ada, fallback ke perhitungan matematis
  const competitivePrice = aiRecommendations?.competitive?.price || recommendations.competitive;
  const standardPrice = aiRecommendations?.standard?.price || recommendations.standard;
  const premiumPrice = aiRecommendations?.premium?.price || recommendations.premium;
  
  const competitiveMargin = aiRecommendations?.competitive?.margin || recommendations.competitiveMargin;
  const standardMargin = aiRecommendations?.standard?.margin || recommendations.standardMargin;
  const premiumMargin = aiRecommendations?.premium?.margin || recommendations.premiumMargin;
  
  const competitiveExplanation = aiRecommendations?.competitive?.explanation || "Cocok untuk pasar yang sangat kompetitif. Fokus pada volume penjualan tinggi.";
  const standardExplanation = aiRecommendations?.standard?.explanation || "Keseimbangan antara profitabilitas dan daya saing. Pilihan yang paling umum.";
  const premiumExplanation = aiRecommendations?.premium?.explanation || "Untuk positioning premium dengan fokus pada kualitas dan eksklusivitas.";

  const priceCards = [
    {
      level: "competitive",
      title: "Harga Kompetitif",
      price: competitivePrice,
      margin: competitiveMargin,
      description: competitiveExplanation,
      color: "border-blue-200 bg-blue-50",
      textColor: "text-blue-700",
      isAI: !!aiRecommendations?.competitive,
    },
    {
      level: "standard",
      title: "Harga Standar",
      price: standardPrice,
      margin: standardMargin,
      description: standardExplanation,
      color: "border-green-200 bg-green-50",
      textColor: "text-green-700",
      isAI: !!aiRecommendations?.standard,
    },
    {
      level: "premium",
      title: "Harga Premium",
      price: premiumPrice,
      margin: premiumMargin,
      description: premiumExplanation,
      color: "border-purple-200 bg-purple-50",
      textColor: "text-purple-700",
      isAI: !!aiRecommendations?.premium,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-semibold">Rekomendasi Harga Jual</h3>
        <div className="flex items-center gap-2">
          {loadingAI && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 animate-pulse" />
              AI sedang menganalisis...
            </div>
          )}
          {aiRecommendations && !loadingAI && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              Saran AI aktif
            </div>
          )}
          {onGetAIRecommendations && productName && (
            <Button
              onClick={onGetAIRecommendations}
              disabled={loadingAI || !productName.trim() || !hpp}
              size="sm"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {loadingAI ? "Memproses..." : "Dapatkan Saran AI"}
            </Button>
          )}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {priceCards.map((card) => {
          const profitPerUnit = card.price - hpp
          return (
            <Card
              key={card.level}
              className={`cursor-pointer transition-all hover:shadow-lg ${card.color}`}
              onClick={() => onSelectPrice(card.price)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className={card.textColor}>{card.title}</CardTitle>
                  {card.isAI && (
                    <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                  )}
                </div>
                <CardDescription className={card.textColor}>
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Harga Jual</p>
                    <p className={`text-2xl font-bold ${card.textColor}`}>
                      {formatCurrency(card.price)}
                    </p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Margin:</span>
                    <span className={`font-semibold ${card.textColor}`}>
                      {card.margin}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Profit/Unit:</span>
                    <span className={`font-semibold ${card.textColor}`}>
                      {formatCurrency(profitPerUnit)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

