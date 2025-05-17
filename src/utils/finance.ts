// src/utils/finance.ts
export interface Item {
  qty: number;
  cost: number;
  markupPct?: number;
}

/**
 * Returns { markupAmt, finalPrice } where finalPrice = cost + markupAmt.
 * Rounds to 2 decimals.
 */
export function calcMarkup(cost: number, markupPct = 0): { markupAmt: number; finalPrice: number } {
  const safeCost = Math.max(0, cost);
  const safePct = Math.max(0, markupPct);
  const markupAmt = Number(((safeCost * safePct) / 100).toFixed(2));
  return { markupAmt, finalPrice: Number((safeCost + markupAmt).toFixed(2)) };
}

/**
 * Aggregates an array of items → { subtotal, totalMarkup, grandTotal }.
 */
export function calcTotals(items: Item[]) {
  const base = { subtotal: 0, totalMarkup: 0, grandTotal: 0 };
  return items.reduce((acc, it) => {
    const qty = it.qty || 0;
    const cost = it.cost || 0;
    const markupPct = it.markupPct || 0;
    const { markupAmt, finalPrice } = calcMarkup(cost * qty, markupPct);
    acc.subtotal += Number((cost * qty).toFixed(2));
    acc.totalMarkup += markupAmt;
    acc.grandTotal += finalPrice;
    return acc;
  }, base);
}
