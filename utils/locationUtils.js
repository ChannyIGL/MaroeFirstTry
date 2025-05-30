function getCommonLocations(cartItems) {
  if (!cartItems.length) return [];
  return cartItems
    .map(item => item.locations || [])
    .reduce((acc, locs) => acc.filter(loc => locs.includes(loc)));
}

module.exports = { getCommonLocations };
