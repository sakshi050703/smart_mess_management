import { clsx } from 'clsx';

/**
 * Merge class names (clsx-like without the dependency).
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format a number as Indian Rupees.
 */
export function formatCurrency(amountInPaise) {
  const rupees = (amountInPaise || 0) / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Convert rupees to paise for storage.
 */
export function toPaise(rupees) {
  return Math.round(parseFloat(rupees) * 100);
}

/**
 * Convert paise to rupees for display.
 */
export function toRupees(paise) {
  return (paise || 0) / 100;
}

/**
 * Format a date string to a readable format.
 */
export function formatDate(date, options = {}) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(new Date(date));
}

/**
 * Format a date-time string.
 */
export function formatDateTime(date) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Return today's date as YYYY-MM-DD string in local timezone.
 */
export function todayStr() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get start of a date (midnight) as UTC Date object.
 */
export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of a date (23:59:59) as UTC Date object.
 */
export function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Capitalize first letter of a string.
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate a consistent API response object.
 */
export function apiResponse(data, message = 'Success', status = 200) {
  return Response.json({ success: true, message, data }, { status });
}

/**
 * Generate a consistent API error response.
 */
export function apiError(message, status = 400, errors = null) {
  return Response.json({ success: false, message, errors }, { status });
}

/**
 * Safely parse JSON body from a Request.
 */
export async function parseBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/**
 * Extract search params from a URL.
 */
export function getSearchParams(request) {
  const { searchParams } = new URL(request.url);
  return searchParams;
}

/**
 * Build pagination metadata.
 */
export function paginationMeta(total, page, limit) {
  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(total / limit),
  };
}

/**
 * Get meal type display name.
 */
export function mealTypeLabel(type) {
  const labels = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    snacks: 'Evening Snacks',
    dinner: 'Dinner',
  };
  return labels[type] || type;
}

/**
 * Get bill status badge color.
 */
export function billStatusColor(status) {
  const colors = {
    paid: 'text-emerald-400 bg-emerald-400/10',
    partial: 'text-amber-400 bg-amber-400/10',
    unpaid: 'text-red-400 bg-red-400/10',
    overdue: 'text-rose-400 bg-rose-400/10',
  };
  return colors[status] || 'text-slate-400 bg-slate-400/10';
}

/**
 * Get subscription status badge color.
 */
export function subscriptionStatusColor(status) {
  const colors = {
    active: 'text-emerald-400 bg-emerald-400/10',
    expired: 'text-red-400 bg-red-400/10',
    cancelled: 'text-slate-400 bg-slate-400/10',
    pending: 'text-amber-400 bg-amber-400/10',
  };
  return colors[status] || 'text-slate-400 bg-slate-400/10';
}
