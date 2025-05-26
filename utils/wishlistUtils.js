function updateWishlist(wishlist, newItem) {
  const index = wishlist.findIndex(item => item.id === newItem.id);
  if (index !== -1) {
    // If item exists, update its size
    return wishlist.map(item =>
      item.id === newItem.id ? { ...item, size: newItem.size } : item
    );
  } else {
    // Add new item
    return [...wishlist, newItem];
  }
}

module.exports = { updateWishlist };
