function calculateTotal(cartItems) {
  return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
}

function simulateQuantityChange(item, action) {
  if (action === 'increase') {
    return { ...item, quantity: item.quantity + 1 };
  }
  if (action === 'decrease') {
    return item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item;
  }
  return item;
}

module.exports = {
  calculateTotal,
  simulateQuantityChange,
};
