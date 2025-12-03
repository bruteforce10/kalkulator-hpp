import { GoogleGenerativeAI } from "@google/generative-ai";
import { formatInputNumber } from "./utils";

let genAI = null;

export function initializeGemini(apiKey) {
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
}

function buildContentInput(prompt, imagePayload) {
  if (imagePayload?.data) {
    return [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: imagePayload.data,
              mimeType: imagePayload.mimeType || "image/png",
            },
          },
        ],
      },
    ];
  }

  return prompt;
}

/**
 * Generate variable costs (bahan-bahan) berdasarkan nama produk
 * Menggunakan AI untuk menganalisis produk dan memberikan daftar bahan beserta estimasi biaya
 */
export async function getVariableCostsFromAI(
  productName,
  productCategory = ""
) {
  if (!genAI) {
    return null;
  }

  // Daftar model yang akan dicoba (dari terbaru ke alternatif)
  const modelsToTry = [
    "gemini-2.0-flash-exp", // Gemini 2.0 Flash Experimental
    "gemini-2.5-flash", // Gemini 2.5 Flash
    "gemini-2.5-pro", // Gemini 2.5 Pro
    "gemini-1.5-flash-latest", // Gemini 1.5 Flash Latest
    "gemini-1.5-pro-latest", // Gemini 1.5 Pro Latest
  ];

  const categoryInfo = productCategory ? `Kategori: ${productCategory}. ` : "";

  const prompt = `Sebagai ahli produksi makanan dan minuman di Indonesia, analisis produk "${productName}" dan berikan daftar bahan-bahan (variable costs) yang diperlukan untuk membuat 1 unit produk tersebut.

${categoryInfo}Berikan daftar bahan-bahan dengan estimasi biaya per unit produk (dalam Rupiah Indonesia).

Format jawaban HARUS dalam JSON array seperti ini:
[
  {"name": "Nama Bahan 1", "cost": 2500},
  {"name": "Nama Bahan 2", "cost": 1500},
  {"name": "Nama Bahan 3", "cost": 800}
]

Aturan:
1. Berikan 3-8 bahan utama yang biasanya digunakan untuk produk ini
2. Estimasi biaya per unit produk (bukan per kemasan bahan)
3. Gunakan nama bahan dalam bahasa Indonesia
4. Biaya dalam angka saja (tanpa "Rp" atau koma)
5. Berikan estimasi yang realistis untuk pasar Indonesia
6. JANGAN tambahkan teks lain, HANYA output JSON array saja

Contoh untuk "Kopi Susu Gula Aren":
[
  {"name": "Kopi bubuk", "cost": 2250},
  {"name": "Susu cair", "cost": 2400},
  {"name": "Gula aren", "cost": 750},
  {"name": "Cup + tutup", "cost": 700},
  {"name": "Sedotan", "cost": 75}
]

Sekarang analisis produk "${productName}" dan berikan JSON array bahan-bahannya:`;

  // Coba setiap model sampai berhasil
  let lastError = null;
  for (const modelName of modelsToTry) {
    try {
      console.log(`Mencoba model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON dari response
      // Hapus markdown code blocks jika ada
      let jsonText = text.trim();
      jsonText = jsonText.replace(/```json\n?/gi, "").replace(/```\n?/g, "");
      jsonText = jsonText.trim();

      // Extract JSON array jika ada teks lain
      const jsonMatch = jsonText.match(/\[[\s\S]*?\]/);
      console.log("[getVariableCostsFromAI] jsonMatch:", jsonMatch);
      console.log(
        "[getVariableCostsFromAI] jsonText sebelum extract:",
        jsonText
      );
      if (jsonMatch) {
        jsonText = jsonMatch[0];
        console.log(
          "[getVariableCostsFromAI] jsonText setelah extract:",
          jsonText
        );
      } else {
        console.warn(
          "[getVariableCostsFromAI] Tidak ada JSON array yang ditemukan!"
        );
      }

      // Coba parse JSON
      let variableCosts;
      try {
        variableCosts = JSON.parse(jsonText);
      } catch (parseError) {
        // Jika parsing gagal, coba extract manual
        console.warn("JSON parsing gagal, mencoba extract manual:", parseError);
        throw new Error(
          "Format response tidak valid. AI tidak mengembalikan JSON yang valid."
        );
      }

      // Validasi format
      if (!Array.isArray(variableCosts) || variableCosts.length === 0) {
        throw new Error(
          "Format response tidak valid. Array kosong atau bukan array."
        );
      }

      // Validasi setiap item
      const validCosts = variableCosts
        .filter((item) => item && typeof item === "object")
        .map((item) => ({
          name: String(item.name || "").trim(),
          cost: item.cost
            ? formatInputNumber(Math.abs(parseFloat(item.cost) || 0))
            : "",
        }))
        .filter((item) => item.name && item.cost); // Hanya ambil yang valid

      if (validCosts.length === 0) {
        throw new Error("Tidak ada bahan valid yang ditemukan dari AI.");
      }

      return validCosts;
    } catch (error) {
      console.log(`Model ${modelName} gagal:`, error.message);
      lastError = error;
      // Lanjut ke model berikutnya
      continue;
    }
  }

  // Jika semua model gagal, return error
  console.error("Semua model gagal. Error terakhir:", lastError);
  throw new Error(
    lastError?.message ||
      "Gagal mendapatkan rekomendasi bahan dari AI. Pastikan API key valid."
  );
}

/**
 * Generate fixed costs (biaya tetap) berdasarkan nama produk
 * Menggunakan AI untuk menganalisis produk dan memberikan daftar biaya tetap beserta estimasi biaya bulanan
 */
export async function getFixedCostsFromAI(productName, productCategory = "") {
  if (!genAI) {
    return null;
  }

  // Daftar model yang akan dicoba (dari terbaru ke alternatif)
  const modelsToTry = [
    "gemini-2.0-flash-exp", // Gemini 2.0 Flash Experimental
    "gemini-2.5-flash", // Gemini 2.5 Flash
    "gemini-2.5-pro", // Gemini 2.5 Pro
    "gemini-1.5-flash-latest", // Gemini 1.5 Flash Latest
    "gemini-1.5-pro-latest", // Gemini 1.5 Pro Latest
  ];

  const categoryInfo = productCategory ? `Kategori: ${productCategory}. ` : "";

  const prompt = `Sebagai ahli bisnis makanan dan minuman di Indonesia, analisis produk "${productName}" dan berikan daftar biaya tetap (fixed costs) yang biasanya diperlukan untuk menjalankan bisnis produk tersebut per bulan.

${categoryInfo}Berikan daftar biaya tetap dengan estimasi biaya per bulan (dalam Rupiah Indonesia).

Format jawaban HARUS dalam JSON array seperti ini:
[
  {"name": "Nama Biaya Tetap 1", "totalCost": 2000000},
  {"name": "Nama Biaya Tetap 2", "totalCost": 1500000},
  {"name": "Nama Biaya Tetap 3", "totalCost": 500000}
]

Aturan:
1. Berikan 3-8 biaya tetap utama yang biasanya diperlukan (seperti: sewa tempat, gaji karyawan, listrik, internet, dll)
2. Estimasi biaya per bulan (bukan per tahun atau per hari)
3. Gunakan nama biaya dalam bahasa Indonesia
4. Biaya dalam angka saja (tanpa "Rp" atau koma)
5. Berikan estimasi yang realistis untuk bisnis kecil-menengah di Indonesia
6. JANGAN tambahkan teks lain, HANYA output JSON array saja

Contoh untuk bisnis kopi:
[
  {"name": "Sewa tempat", "totalCost": 3000000},
  {"name": "Gaji karyawan", "totalCost": 4000000},
  {"name": "Listrik", "totalCost": 500000},
  {"name": "Internet", "totalCost": 200000},
  {"name": "Air", "totalCost": 150000}
]

Sekarang analisis produk "${productName}" dan berikan JSON array biaya tetapnya:`;

  // Coba setiap model sampai berhasil
  let lastError = null;
  for (const modelName of modelsToTry) {
    try {
      console.log(`Mencoba model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON dari response
      let jsonText = text.trim();
      jsonText = jsonText.replace(/```json\n?/gi, "").replace(/```\n?/g, "");
      jsonText = jsonText.trim();

      // Extract JSON array jika ada teks lain
      const jsonMatch = jsonText.match(/\[[\s\S]*?\]/);
      console.log("[getFixedCostsFromAI] jsonMatch:", jsonMatch);
      console.log("[getFixedCostsFromAI] jsonText sebelum extract:", jsonText);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
        console.log(
          "[getFixedCostsFromAI] jsonText setelah extract:",
          jsonText
        );
      } else {
        console.warn(
          "[getFixedCostsFromAI] Tidak ada JSON array yang ditemukan!"
        );
      }

      // Coba parse JSON
      let fixedCosts;
      try {
        fixedCosts = JSON.parse(jsonText);
      } catch (parseError) {
        console.warn("JSON parsing gagal, mencoba extract manual:", parseError);
        throw new Error(
          "Format response tidak valid. AI tidak mengembalikan JSON yang valid."
        );
      }

      // Validasi format
      if (!Array.isArray(fixedCosts) || fixedCosts.length === 0) {
        throw new Error(
          "Format response tidak valid. Array kosong atau bukan array."
        );
      }

      // Validasi setiap item
      const validCosts = fixedCosts
        .filter((item) => item && typeof item === "object")
        .map((item) => ({
          name: String(item.name || "").trim(),
          totalCost: item.totalCost
            ? formatInputNumber(Math.abs(parseFloat(item.totalCost) || 0))
            : "",
        }))
        .filter((item) => item.name && item.totalCost); // Hanya ambil yang valid

      if (validCosts.length === 0) {
        throw new Error("Tidak ada biaya tetap valid yang ditemukan dari AI.");
      }

      return validCosts;
    } catch (error) {
      console.log(`Model ${modelName} gagal:`, error.message);
      lastError = error;
      // Lanjut ke model berikutnya
      continue;
    }
  }

  // Jika semua model gagal, return error
  console.error("Semua model gagal. Error terakhir:", lastError);
  throw new Error(
    lastError?.message ||
      "Gagal mendapatkan rekomendasi biaya tetap dari AI. Pastikan API key valid."
  );
}

/**
 * Generate variable costs DAN fixed costs sekaligus berdasarkan nama produk
 * Menggunakan AI untuk menganalisis produk dan memberikan daftar bahan serta biaya tetap
 */
export async function getAllCostsFromAI(
  productName,
  productCategory = "",
  productImage
) {
  if (!genAI) {
    return null;
  }

  // Daftar model yang akan dicoba (dari terbaru ke alternatif)
  const modelsToTry = [
    "gemini-2.0-flash-exp", // Gemini 2.0 Flash Experimental
    "gemini-2.5-flash", // Gemini 2.5 Flash
    "gemini-2.5-pro", // Gemini 2.5 Pro
    "gemini-1.5-flash-latest", // Gemini 1.5 Flash Latest
    "gemini-1.5-pro-latest", // Gemini 1.5 Pro Latest
  ];

  const categoryInfo = productCategory ? `Kategori: ${productCategory}. ` : "";

  const imageInstruction = productImage
    ? "\nGambar produk terlampir. Gunakan detail visual tersebut untuk memahami bahan atau gaya penyajian produk."
    : "";

  const prompt = `Sebagai ahli bisnis makanan dan minuman di Indonesia, analisis produk "${productName}" secara menyeluruh dan berikan:

1. DAFTAR BAHAN-BAHAN (variable costs) yang diperlukan untuk membuat 1 unit produk tersebut
2. DAFTAR BIAYA TETAP (fixed costs) yang biasanya diperlukan untuk menjalankan bisnis produk tersebut per bulan

${categoryInfo}${imageInstruction}

Format jawaban HARUS dalam JSON object seperti ini:
{
  "variableCosts": [
    {"name": "Nama Bahan 1", "cost": 2500},
    {"name": "Nama Bahan 2", "cost": 1500}
  ],
  "fixedCosts": [
    {"name": "Nama Biaya Tetap 1", "totalCost": 2000000},
    {"name": "Nama Biaya Tetap 2", "totalCost": 1500000}
  ]
}

Aturan untuk Variable Costs:
- Berikan 3-8 bahan utama yang biasanya digunakan
- Estimasi biaya per unit produk (dalam Rupiah Indonesia)
- Biaya dalam angka saja (tanpa "Rp" atau koma)

Aturan untuk Fixed Costs:
- Berikan 3-8 biaya tetap utama (seperti: sewa tempat, gaji karyawan, listrik, internet, dll)
- Estimasi biaya per bulan (dalam Rupiah Indonesia)
- Biaya dalam angka saja (tanpa "Rp" atau koma)

Contoh untuk "Kopi Susu Gula Aren":
{
  "variableCosts": [
    {"name": "Kopi bubuk", "cost": 2250},
    {"name": "Susu cair", "cost": 2400},
    {"name": "Gula aren", "cost": 750},
    {"name": "Cup + tutup", "cost": 700},
    {"name": "Sedotan", "cost": 75}
  ],
  "fixedCosts": [
    {"name": "Sewa tempat", "totalCost": 3000000},
    {"name": "Gaji karyawan", "totalCost": 4000000},
    {"name": "Listrik", "totalCost": 500000},
    {"name": "Internet", "totalCost": 200000}
  ]
}

PENTING: JANGAN tambahkan teks lain, HANYA output JSON object saja. Sekarang analisis produk "${productName}" dan berikan JSON object:`;

  // Coba setiap model sampai berhasil
  let lastError = null;
  for (const modelName of modelsToTry) {
    try {
      console.log(`Mencoba model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(
        buildContentInput(prompt, productImage)
      );
      const response = await result.response;
      const text = response.text();

      // Parse JSON dari response
      let jsonText = text.trim();
      jsonText = jsonText.replace(/```json\n?/gi, "").replace(/```\n?/g, "");
      jsonText = jsonText.trim();

      // Extract JSON object jika ada teks lain
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      console.log("[getAllCostsFromAI] jsonMatch:", jsonMatch);
      console.log("[getAllCostsFromAI] jsonText sebelum extract:", jsonText);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
        console.log("[getAllCostsFromAI] jsonText setelah extract:", jsonText);
      } else {
        console.warn(
          "[getAllCostsFromAI] Tidak ada JSON object yang ditemukan!"
        );
      }

      // Coba parse JSON
      let allCosts;
      try {
        allCosts = JSON.parse(jsonText);
        console.log("[getAllCostsFromAI] allCosts:", allCosts);
      } catch (parseError) {
        console.warn("JSON parsing gagal:", parseError);
        throw new Error(
          "Format response tidak valid. AI tidak mengembalikan JSON yang valid."
        );
      }

      // Validasi dan parse variable costs
      const variableCosts = Array.isArray(allCosts.variableCosts)
        ? allCosts.variableCosts
            .filter((item) => item && typeof item === "object")
            .map((item) => ({
              name: String(item.name || "").trim(),
              cost: item.cost
                ? formatInputNumber(Math.abs(parseFloat(item.cost) || 0))
                : "",
            }))
            .filter((item) => item.name && item.cost)
        : [];

      // Validasi dan parse fixed costs
      const fixedCosts = Array.isArray(allCosts.fixedCosts)
        ? allCosts.fixedCosts
            .filter((item) => item && typeof item === "object")
            .map((item) => ({
              name: String(item.name || "").trim(),
              totalCost: item.totalCost
                ? formatInputNumber(Math.abs(parseFloat(item.totalCost) || 0))
                : "",
            }))
            .filter((item) => item.name && item.totalCost)
        : [];

      if (variableCosts.length === 0 && fixedCosts.length === 0) {
        throw new Error("Tidak ada data valid yang ditemukan dari AI.");
      }

      return {
        variableCosts: variableCosts.length > 0 ? variableCosts : null,
        fixedCosts: fixedCosts.length > 0 ? fixedCosts : null,
      };
    } catch (error) {
      console.log(`Model ${modelName} gagal:`, error.message);
      lastError = error;
      // Lanjut ke model berikutnya
      continue;
    }
  }

  // Jika semua model gagal, return error
  console.error("Semua model gagal. Error terakhir:", lastError);
  throw new Error(
    lastError?.message ||
      "Gagal mendapatkan rekomendasi dari AI. Pastikan API key valid."
  );
}

/**
 * Generate price recommendations dengan AI berdasarkan data produk
 */
export async function getAIPriceRecommendations(
  productName,
  productCategory,
  hpp,
  variableCostPerUnit,
  totalFixedCostPerMonth,
  targetSales,
  productImage
) {
  if (!genAI) {
    return null;
  }

  // Daftar model yang akan dicoba
  const modelsToTry = [
    "gemini-2.0-flash-exp",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
  ];

  const categoryInfo = productCategory ? `Kategori: ${productCategory}. ` : "";

  const imageInstruction = productImage
    ? "\nGambar produk terlampir. Gunakan detail visual tersebut untuk menilai positioning harga."
    : "";

  const prompt = `Sebagai konsultan bisnis makanan dan minuman di Indonesia, analisis produk "${productName}" dan berikan rekomendasi harga jual yang strategis.

${categoryInfo}${imageInstruction}
Data Produk:
- HPP (Harga Pokok Produksi): Rp ${hpp.toLocaleString("id-ID")}
- Biaya Variabel per Unit: Rp ${variableCostPerUnit.toLocaleString("id-ID")}
- Total Biaya Tetap per Bulan: Rp ${totalFixedCostPerMonth.toLocaleString(
    "id-ID"
  )}
- Target Penjualan per Bulan: ${targetSales.toLocaleString("id-ID")} unit

Berikan rekomendasi harga jual dengan 3 level strategi:

Format jawaban HARUS dalam JSON object seperti ini:
{
  "competitive": {
    "price": 19500,
    "margin": 30,
    "explanation": "Penjelasan singkat mengapa harga ini tepat untuk pasar kompetitif"
  },
  "standard": {
    "price": 20000,
    "margin": 55,
    "explanation": "Penjelasan singkat mengapa harga ini tepat untuk pasar normal"
  },
  "premium": {
    "price": 25000,
    "margin": 80,
    "explanation": "Penjelasan singkat mengapa harga ini tepat untuk positioning premium"
  }
}

Aturan:
1. Harga competitive: margin 20-40%, fokus volume penjualan tinggi
2. Harga standard: margin 50-70%, keseimbangan profitabilitas dan daya saing
3. Harga premium: margin 70-100%, positioning premium dengan fokus kualitas
4. Harga dalam angka saja (tanpa "Rp" atau koma)
5. Margin dalam persentase (angka saja)
6. Explanation dalam bahasa Indonesia, singkat dan jelas (maksimal 100 karakter)
7. JANGAN tambahkan teks lain, HANYA output JSON object saja

Sekarang analisis produk "${productName}" dan berikan JSON object rekomendasi harga:`;

  // Coba setiap model sampai berhasil
  let lastError = null;
  for (const modelName of modelsToTry) {
    try {
      console.log(`Mencoba model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(
        buildContentInput(prompt, productImage)
      );
      const response = await result.response;
      const text = response.text();

      // Parse JSON dari response
      let jsonText = text.trim();
      jsonText = jsonText.replace(/```json\n?/gi, "").replace(/```\n?/g, "");
      jsonText = jsonText.trim();

      // Extract JSON object jika ada teks lain
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      console.log("[getAIPriceRecommendations] jsonMatch:", jsonMatch);
      console.log(
        "[getAIPriceRecommendations] jsonText sebelum extract:",
        jsonText
      );
      if (jsonMatch) {
        jsonText = jsonMatch[0];
        console.log(
          "[getAIPriceRecommendations] jsonText setelah extract:",
          jsonText
        );
      } else {
        console.warn(
          "[getAIPriceRecommendations] Tidak ada JSON object yang ditemukan!"
        );
      }

      // Coba parse JSON
      let priceRec;
      try {
        priceRec = JSON.parse(jsonText);
      } catch (parseError) {
        console.warn("JSON parsing gagal:", parseError);
        throw new Error(
          "Format response tidak valid. AI tidak mengembalikan JSON yang valid."
        );
      }

      // Validasi dan format response
      const recommendations = {
        competitive: {
          price: Math.round(parseFloat(priceRec.competitive?.price) || 0),
          margin: Math.round(parseFloat(priceRec.competitive?.margin) || 0),
          explanation: String(priceRec.competitive?.explanation || "").trim(),
        },
        standard: {
          price: Math.round(parseFloat(priceRec.standard?.price) || 0),
          margin: Math.round(parseFloat(priceRec.standard?.margin) || 0),
          explanation: String(priceRec.standard?.explanation || "").trim(),
        },
        premium: {
          price: Math.round(parseFloat(priceRec.premium?.price) || 0),
          margin: Math.round(parseFloat(priceRec.premium?.margin) || 0),
          explanation: String(priceRec.premium?.explanation || "").trim(),
        },
      };

      // Validasi bahwa ada minimal satu harga valid
      if (
        recommendations.competitive.price === 0 &&
        recommendations.standard.price === 0 &&
        recommendations.premium.price === 0
      ) {
        throw new Error(
          "Tidak ada rekomendasi harga valid yang ditemukan dari AI."
        );
      }

      return recommendations;
    } catch (error) {
      console.log(`Model ${modelName} gagal:`, error.message);
      lastError = error;
      continue;
    }
  }

  // Jika semua model gagal, return error
  console.error("Semua model gagal. Error terakhir:", lastError);
  throw new Error(
    lastError?.message ||
      "Gagal mendapatkan rekomendasi harga dari AI. Pastikan API key valid."
  );
}
