import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProductDetailPage from '../app/(shop)/[id]';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Mock Firebase functions
jest.mock('firebase/firestore', () => {
  const originalModule = jest.requireActual('firebase/firestore');
  return {
    ...originalModule,
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
  };
});

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'test-id' }),
  Link: ({ children }) => children,
}));

// Sample product mock
const mockProduct = {
  name: 'Mock Dress',
  imageUrl: 'https://example.com/image.jpg',
  price: 200000,
  sizes: ['S', 'M', 'L'],
  locations: ['Jakarta', 'Surabaya'],
};

describe('ProductDetailPage', () => {
  beforeEach(() => {
    getDoc.mockResolvedValue({ exists: () => true, data: () => mockProduct });
    setDoc.mockResolvedValue();
    updateDoc.mockResolvedValue();
  });

  it('adds to cart and shows feedback', async () => {
    const { getByText } = render(<ProductDetailPage />);

    // Wait for product to load
    await waitFor(() => getByText('Mock Dress'));

    // Select a size
    fireEvent.press(getByText('M'));

    // Press Add to Cart
    fireEvent.press(getByText('Add to Cart'));

    // Expect feedback to appear
    await waitFor(() => {
      expect(getByText('Added to cart!')).toBeTruthy();
    });
  });
});
