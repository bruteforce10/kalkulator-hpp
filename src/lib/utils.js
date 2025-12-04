import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value) {
  return new Intl.NumberFormat("id-ID").format(value);
}

// Parse formatted number string (e.g., "1.200.000") to raw number
export function parseFormattedNumber(value) {
  if (!value) return 0;
  // Remove dots (thousand separators) and parse
  const cleaned = value.toString().replace(/\./g, "");
  return parseFloat(cleaned) || 0;
}

// Format number for input display (with thousand separators)
export function formatInputNumber(value) {
  if (!value && value !== 0) return "";
  const num = parseFormattedNumber(value);
  if (isNaN(num) || num === 0) return "";
  return new Intl.NumberFormat("id-ID").format(num);
}

// Convert unit to base unit for calculation
function convertToBaseUnit(value, unit) {
  if (!value || !unit) return 0;

  const unitLower = unit.toLowerCase();

  // Weight conversions (to grams)
  if (unitLower === "kg") return value * 1000;
  if (unitLower === "g") return value;

  // Volume conversions (to ml)
  if (unitLower === "l") return value * 1000;
  if (unitLower === "ml") return value;

  // Count units (no conversion needed)
  if (["pcs", "buah", "lembar"].includes(unitLower)) return value;

  return value;
}

// Check if units are compatible (same category)
function areUnitsCompatible(unit1, unit2) {
  if (!unit1 || !unit2) return false;

  const unit1Lower = unit1.toLowerCase();
  const unit2Lower = unit2.toLowerCase();

  // Weight units
  const weightUnits = ["g", "kg"];
  if (weightUnits.includes(unit1Lower) && weightUnits.includes(unit2Lower)) {
    return true;
  }

  // Volume units
  const volumeUnits = ["ml", "l"];
  if (volumeUnits.includes(unit1Lower) && volumeUnits.includes(unit2Lower)) {
    return true;
  }

  // Count units
  const countUnits = ["pcs", "buah", "lembar"];
  if (countUnits.includes(unit1Lower) && countUnits.includes(unit2Lower)) {
    return true;
  }

  // Same unit
  if (unit1Lower === unit2Lower) return true;

  return false;
}

/**
 * Calculate cost per product based on usage and purchase information
 * @param {number} usageAmount - Amount used per product
 * @param {string} usageUnit - Unit for usage (g, kg, ml, L, pcs, buah, lembar)
 * @param {number} purchasePrice - Total purchase price
 * @param {number} purchaseQuantity - Quantity purchased
 * @param {string} purchaseUnit - Unit for purchase (g, kg, ml, L, pcs, buah, lembar)
 * @returns {number} Cost per product in Rupiah
 */
export function calculateCostPerProduct(
  usageAmount,
  usageUnit,
  purchasePrice,
  purchaseQuantity,
  purchaseUnit
) {
  // Validate inputs
  if (
    !usageAmount ||
    !purchasePrice ||
    !purchaseQuantity ||
    !usageUnit ||
    !purchaseUnit
  ) {
    return 0;
  }

  // Check if units are compatible
  if (!areUnitsCompatible(usageUnit, purchaseUnit)) {
    return 0;
  }

  // Convert both to base units
  const usageInBase = convertToBaseUnit(usageAmount, usageUnit);
  const purchaseInBase = convertToBaseUnit(purchaseQuantity, purchaseUnit);

  if (purchaseInBase === 0) return 0;

  // Calculate cost per base unit
  const costPerBaseUnit = purchasePrice / purchaseInBase;

  // Calculate cost per product
  const costPerProduct = costPerBaseUnit * usageInBase;

  return costPerProduct;
}
