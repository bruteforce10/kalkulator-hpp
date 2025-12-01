import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value) {
  return new Intl.NumberFormat('id-ID').format(value)
}

// Parse formatted number string (e.g., "1.200.000") to raw number
export function parseFormattedNumber(value) {
  if (!value) return 0
  // Remove dots (thousand separators) and parse
  const cleaned = value.toString().replace(/\./g, '')
  return parseFloat(cleaned) || 0
}

// Format number for input display (with thousand separators)
export function formatInputNumber(value) {
  if (!value && value !== 0) return ''
  const num = parseFormattedNumber(value)
  if (isNaN(num) || num === 0) return ''
  return new Intl.NumberFormat('id-ID').format(num)
}

