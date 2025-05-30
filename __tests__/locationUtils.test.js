const { getCommonLocations } = require('../utils/locationUtils');

describe('getCommonLocations', () => {
  it('returns common locations for multiple items', () => {
    const items = [
      { locations: ['Jakarta', 'Surabaya'] },
      { locations: ['Jakarta'] },
    ];
    const result = getCommonLocations(items);
    expect(result).toEqual(['Jakarta']);
  });

  it('returns empty array if no common locations exist', () => {
    const items = [
      { locations: ['Jakarta'] },
      { locations: ['Surabaya'] },
    ];
    const result = getCommonLocations(items);
    expect(result).toEqual([]);
  });

  it('handles single item with locations', () => {
    const items = [
      { locations: ['Jakarta', 'Surabaya'] },
    ];
    const result = getCommonLocations(items);
    expect(result).toEqual(['Jakarta', 'Surabaya']);
  });

  it('returns empty array if no items are passed', () => {
    const items = [];
    const result = getCommonLocations(items);
    expect(result).toEqual([]);
  });

  it('returns empty array if no items have locations', () => {
    const items = [{ name: 'Dress' }, { name: 'Skirt', locations: null }];
    const result = getCommonLocations(items);
    expect(result).toEqual([]);
  });
});
