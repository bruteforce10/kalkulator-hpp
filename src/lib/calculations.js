import { parseFormattedNumber } from "./utils"

/**
 * Calculate HPP and related metrics
 */

export function calculateHPP(variableCosts, fixedCosts, targetSales) {
  const variableCostPerUnit = variableCosts.reduce((sum, item) => {
    return sum + parseFormattedNumber(item.cost)
  }, 0)

  // Hitung total biaya tetap per bulan dari array fixed costs
  const totalFixedCostPerMonth = Array.isArray(fixedCosts)
    ? fixedCosts.reduce((sum, item) => {
        return sum + parseFormattedNumber(item.totalCost)
      }, 0)
    : parseFormattedNumber(fixedCosts)

  // Hitung alokasi biaya tetap per unit
  // Gunakan nilai yang di-edit user jika ada, atau perhitungan otomatis
  let fixedCostPerUnit = 0;
  if (Array.isArray(fixedCosts)) {
    fixedCostPerUnit = fixedCosts.reduce((sum, item) => {
      const totalCost = parseFormattedNumber(item.totalCost);
      // Jika user sudah mengedit allocationPerUnit, gunakan nilai tersebut
      if (item.allocationPerUnit !== undefined && item.allocationPerUnit !== "") {
        return sum + parseFormattedNumber(item.allocationPerUnit);
      }
      // Jika belum di-edit, hitung otomatis
      const suggestedAllocation = targetSales > 0 ? totalCost / targetSales : 0;
      return sum + suggestedAllocation;
    }, 0);
  } else {
    // Fallback untuk format lama
    fixedCostPerUnit = targetSales > 0 
      ? totalFixedCostPerMonth / targetSales 
      : 0
  }

  const hpp = variableCostPerUnit + fixedCostPerUnit

  return {
    variableCostPerUnit,
    fixedCostPerUnit,
    totalFixedCostPerMonth,
    hpp,
  }
}

export function calculatePriceRecommendations(hpp) {
  if (hpp <= 0) {
    return {
      competitive: 0,
      standard: 0,
      premium: 0,
      competitiveMargin: 0,
      standardMargin: 0,
      premiumMargin: 0,
    }
  }

  const competitive = hpp * 1.3 // 30% margin (20-40% range)
  const standard = hpp * 1.55 // 55% margin (50-60% range)
  const premium = hpp * 1.8 // 80% margin (70-90% range)

  return {
    competitive: Math.round(competitive),
    standard: Math.round(standard),
    premium: Math.round(premium),
    competitiveMargin: 30,
    standardMargin: 55,
    premiumMargin: 80,
  }
}

export function calculateProfitPerUnit(hpp, sellingPrice) {
  return sellingPrice - hpp
}

export function calculateBEP(fixedCosts, sellingPrice, variableCostPerUnit) {
  const contributionMargin = sellingPrice - variableCostPerUnit
  
  if (contributionMargin <= 0) {
    return {
      bepUnit: 0,
      bepRupiah: 0,
      isValid: false,
    }
  }

  // Hitung total biaya tetap per bulan
  const totalFixedCost = Array.isArray(fixedCosts)
    ? fixedCosts.reduce((sum, item) => {
        return sum + parseFormattedNumber(item.totalCost)
      }, 0)
    : parseFormattedNumber(fixedCosts)

  const bepUnit = Math.ceil(totalFixedCost / contributionMargin)
  const bepRupiah = bepUnit * sellingPrice

  return {
    bepUnit,
    bepRupiah,
    isValid: true,
  }
}

export function calculateSalesNeeded(targetProfit, profitPerUnit) {
  if (profitPerUnit <= 0) {
    return 0
  }
  return Math.ceil(targetProfit / profitPerUnit)
}

export function generateSimulationTable(hpp, sellingPrice, variableCostPerUnit, fixedCosts, maxUnits = 1500) {
  const data = []
  const step = Math.max(1, Math.floor(maxUnits / 50))

  // Hitung total biaya tetap per bulan
  const totalFixedCost = Array.isArray(fixedCosts)
    ? fixedCosts.reduce((sum, item) => {
        return sum + parseFormattedNumber(item.totalCost)
      }, 0)
    : parseFormattedNumber(fixedCosts)

  for (let units = 0; units <= maxUnits; units += step) {
    const revenue = units * sellingPrice
    const variableCost = units * variableCostPerUnit
    const totalCost = variableCost + totalFixedCost
    const profit = revenue - totalCost

    data.push({
      units,
      revenue,
      variableCost,
      fixedCost: totalFixedCost,
      totalCost,
      profit,
    })
  }

  return data
}

