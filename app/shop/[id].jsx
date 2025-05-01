import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, SafeAreaView, ScrollView, ActivityIndicator, Animated } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import homeIcon from '../../assets/home.png';
import shopIcon from '../../assets/shop.png';
import wishlistIcon from '../../assets/wishlist.png';
import profileIcon from '../../assets/profile.png';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ProductDetailPage() {
  // Get product ID from URL
  const { id } = useLocalSearchParams();

  // State management
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [cartMessage, setCartMessage] = useState('');
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const ref = doc(db, 'products', id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProduct(snap.data());
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to load product:', error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Wishlist animation
  const triggerPulse = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  // Add to Wishlist
  const handleAddToWishlist = async () => {
    if (!selectedSize) {
      setFeedback('Please select a size first.');
      return;
    }

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setFeedback('You must be logged in to use wishlist.');
        return;
      }

      const wishlistRef = doc(db, 'wishlists', userId, 'items', id);
      await setDoc(wishlistRef, {
        productId: id,
        size: selectedSize,
        addedAt: new Date(),
        name: product.name,
        imageUrl: product.imageUrl,
        price: product.price,
      });

      triggerPulse();
      setFeedback('Added to wishlist!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      setFeedback('Error adding to wishlist.');
    }
  };

  // Add to Cart
  const handleAddToCart = async () => {
    if (!selectedSize) {
      setFeedback('Please select a size.');
      return;
    }

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setFeedback('You must be logged in to add to cart.');
        return;
      }

      const cartRef = doc(db, 'carts', userId, 'items', id);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        const existing = cartSnap.data();
        await updateDoc(cartRef, { quantity: existing.quantity + 1 });
      } else {
        await setDoc(cartRef, {
          productId: id,
          name: product.name,
          imageUrl: product.imageUrl,
          size: selectedSize,
          price: product.price,
          quantity: 1,
        });
      }

      setFeedback('Added to cart!');
      setTimeout(() => setFeedback(''), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setFeedback('Failed to add to cart.');
    }
  };

  if (loading || !product) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top icons */}
      <View style={styles.topIconsRow}>
        <Link href="/shop" asChild>
          <TouchableOpacity><Text style={styles.backButton}>←</Text></TouchableOpacity>
        </Link>
        <Link href="/(cart)" asChild>
          <TouchableOpacity>
            <Image source={require('../../assets/cart.png')} style={styles.cartIcon} />
          </TouchableOpacity>
        </Link>
      </View>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/fullLogo.png')} style={styles.fullLogo} resizeMode="contain" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product image */}
        <Image source={{ uri: product.imageUrl }} style={styles.productImage} resizeMode="cover" />

        <View style={styles.content}>
          {/* Title + wishlist */}
          <View style={styles.row}>
            <Text style={styles.title}>{product.name}</Text>
            <TouchableOpacity onPress={handleAddToWishlist}>
              <Animated.Image
                source={require('../../assets/wishlist.png')}
                style={[styles.wishlistIcon, { transform: [{ scale: scaleAnim }] }]}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.price}>Rp {product.price.toLocaleString()}</Text>

          {/* Size Picker */}
          <View style={styles.sizeRow}>
            {product.sizes.map(size => (
              <TouchableOpacity
                key={size}
                style={[styles.sizeButton, selectedSize === size && styles.selectedSize]}
                onPress={() => setSelectedSize(size)}
              >
                <Text style={[styles.sizeText, selectedSize === size && styles.selectedSizeText]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Unified feedback for wishlist + cart */}
          {feedback ? (
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: feedback.includes('Added') ? 'green' : 'red',
              marginBottom: 10,
              marginTop: -8,
            }}>
              {feedback}
            </Text>
          ) : null}

          {/* Add to Cart */}
          <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
            <Text style={styles.cartButtonText}>Add to Cart</Text>
          </TouchableOpacity>

          {/* Description */}
          <Text style={styles.description}>
            {product.description || 'This is a stunning piece made from premium materials and crafted with elegance. A must-have in any timeless wardrobe.'}
          </Text>

          {/* Store Locations */}
          <Text style={styles.locationHeader}>Available in:</Text>
          <View style={styles.locationList}>
            {product.locations?.map((loc, index) => (
              <Text key={index} style={styles.locationItem}>• {loc}</Text>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.tabBar}>
        <NavIcon href="/(home)" icon={homeIcon} label="Home" />
        <NavIcon href="/shop" icon={shopIcon} label="Shop" />
        <NavIcon href="/(wishlist)" icon={wishlistIcon} label="Wishlist" />
        <NavIcon href="/(profile)" icon={profileIcon} label="Profile" />
      </View>
    </SafeAreaView>
  );
}

function NavIcon({ href, icon, label }) {
  return (
    <Link href={href} asChild>
      <TouchableOpacity style={styles.tabItem}>
        <Image source={icon} style={styles.tabIcon} />
        <Text style={styles.tabLabel}>{label}</Text>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 10,
  },
  backButton: { fontSize: 28, fontWeight: 'bold' },
  cartIcon: { width: 28, height: 28 },
  logoContainer: { alignItems: 'center', marginBottom: 10, marginTop: -10 },
  fullLogo: { width: 240, height: 60 },
  productImage: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 1.2,
    alignSelf: 'center',
    borderRadius: 16,
    marginBottom: 20,
  },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold', flex: 1, marginRight: 10 },
  wishlistIcon: { width: 24, height: 24 },
  price: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  sizeRow: { flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  sizeButton: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  selectedSize: { backgroundColor: '#000' },
  sizeText: { color: '#000', fontWeight: '600' },
  selectedSizeText: { color: '#fff' },
  cartButton: {
    backgroundColor: '#000',
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  cartButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  description: { fontSize: 13, color: '#444', lineHeight: 20, marginBottom: 20 },
  locationHeader: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  locationList: { marginBottom: 40 },
  locationItem: { fontSize: 13, color: '#333', marginBottom: 2 },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  tabItem: { alignItems: 'center' },
  tabIcon: { width: 24, height: 24, marginBottom: 4 },
  tabLabel: { fontSize: 12, color: '#444' },
});
