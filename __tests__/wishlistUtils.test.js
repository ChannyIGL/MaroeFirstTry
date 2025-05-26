const { updateWishlist } = require('../utils/wishlistUtils');

describe('updateWishlist', () => {
  const existingWishlist = [
    { id: '123', name: 'Dress A', size: 'S' },
    { id: '456', name: 'Dress B', size: 'M' }
  ];

  it('adds a new item if it does not exist', () => {
    const result = updateWishlist(existingWishlist, { id: '789', name: 'Dress C', size: 'L' });
    expect(result).toHaveLength(3);
    expect(result[2]).toEqual({ id: '789', name: 'Dress C', size: 'L' });
  });

  it('updates size of existing item if it exists', () => {
    const result = updateWishlist(existingWishlist, { id: '123', name: 'Dress A', size: 'L' });
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: '123', name: 'Dress A', size: 'L' });
  });

  it('returns the same list if added item is identical', () => {
    const result = updateWishlist(existingWishlist, { id: '123', name: 'Dress A', size: 'S' });
    expect(result).toEqual(existingWishlist);
  });
});
