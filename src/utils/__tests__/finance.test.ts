import { describe, test, expect } from 'vitest';
import { calcMarkup, calcTotals, Item } from '../finance';

describe('Finance Utility - calcMarkup', () => {
  test('calculates markup with positive cost and markup percentage', () => {
    const result = calcMarkup(100, 20);
    expect(result.markupAmt).toBe(20);
    expect(result.finalPrice).toBe(120);
  });

  test('handles zero cost properly', () => {
    const result = calcMarkup(0, 15);
    expect(result.markupAmt).toBe(0);
    expect(result.finalPrice).toBe(0);
  });

  test('clamps negative cost to zero', () => {
    const result = calcMarkup(-50, 10);
    expect(result.markupAmt).toBe(0);
    expect(result.finalPrice).toBe(0);
  });

  test('clamps negative markup percentage to zero', () => {
    const result = calcMarkup(100, -5);
    expect(result.markupAmt).toBe(0);
    expect(result.finalPrice).toBe(100);
  });

  test('rounds to 2 decimal places correctly', () => {
    const result = calcMarkup(100, 33.333);
    expect(result.markupAmt).toBe(33.33);
    expect(result.finalPrice).toBe(133.33);
  });

  test('handles zero markup percentage (default)', () => {
    const result = calcMarkup(100);
    expect(result.markupAmt).toBe(0);
    expect(result.finalPrice).toBe(100);
  });
});

describe('Finance Utility - calcTotals', () => {
  test('calculates totals across multiple items', () => {
    const items: Item[] = [
      { qty: 2, cost: 50, markupPct: 20 },
      { qty: 1, cost: 100, markupPct: 15 },
      { qty: 3, cost: 25, markupPct: 10 },
    ];

    const result = calcTotals(items);

    // Manually calculate expected results
    // Item 1: 2 * 50 = 100 base, 20% markup = 20, total = 120
    // Item 2: 1 * 100 = 100 base, 15% markup = 15, total = 115
    // Item 3: 3 * 25 = 75 base, 10% markup = 7.50, total = 82.50
    // Expected: subtotal = 275, totalMarkup = 42.50, grandTotal = 317.50

    expect(result.subtotal).toBeCloseTo(275, 2);
    expect(result.totalMarkup).toBeCloseTo(42.5, 2);
    expect(result.grandTotal).toBeCloseTo(317.5, 2);
  });

  test('handles empty items array', () => {
    const result = calcTotals([]);
    expect(result.subtotal).toBe(0);
    expect(result.totalMarkup).toBe(0);
    expect(result.grandTotal).toBe(0);
  });

  test('handles items with missing or zero values', () => {
    const items: Item[] = [
      { qty: 0, cost: 50, markupPct: 20 },
      { qty: 2, cost: 0, markupPct: 15 },
      { qty: 3, cost: 25, markupPct: 0 },
    ];

    const result = calcTotals(items);

    expect(result.subtotal).toBeCloseTo(75, 2); // Only 3 * 25 = 75 is counted
    expect(result.totalMarkup).toBe(0);
    expect(result.grandTotal).toBeCloseTo(75, 2);
  });
});
