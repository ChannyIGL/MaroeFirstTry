const { calculateTotal, simulateQuantityChange } = require('../utils/cartUtils');

describe('calculateTotal', () => {
  it('returns correct total for multiple items', () => {
    const cart = [
      { price: 100000, quantity: 2 },
      { price: 150000, quantity: 1 }
    ];
    expect(calculateTotal(cart)).toBe(350000);
  });

  it('returns 0 for an empty cart', () => {
    expect(calculateTotal([])).toBe(0);
  });
});

describe('simulateQuantityChange', () => {
  const sampleItem = { id: 'abc123', quantity: 2, price: 100000 };

  it('increases quantity by 1', () => {
    const updated = simulateQuantityChange(sampleItem, 'increase');
    expect(updated.quantity).toBe(3);
  });

  it('decreases quantity by 1 if quantity > 1', () => {
    const updated = simulateQuantityChange(sampleItem, 'decrease');
    expect(updated.quantity).toBe(1);
  });

  it('does not decrease quantity below 1', () => {
    const updated = simulateQuantityChange({ ...sampleItem, quantity: 1 }, 'decrease');
    expect(updated.quantity).toBe(1);
  });

  it('returns original item for unknown action', () => {
    const updated = simulateQuantityChange(sampleItem, 'invalid');
    expect(updated).toEqual(sampleItem);
  });
});
