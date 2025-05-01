import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, FlatList, Dimensions, SafeAreaView, ActivityIndicator, Animated } from 'react-native';
import { Link } from 'expo-router';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import homeIcon from '../../assets/home.png';
import shopIcon from '../../assets/shop.png';
import wishlistIcon from '../../assets/wishlist.png';
import profileIcon from '../../assets/profile.png';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  // Fetch user wishlist
  const fetchWishlist = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const snapshot = await getDocs(collection(db, 'wishlists', userId, 'items'));
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), anim: new Animated.Value(1) }));
      setWishlistItems(items);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Remove item from wishlist with fade animation
  const removeItem = async (itemId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const index = wishlistItems.findIndex(item => item.id === itemId);
    if (index === -1) return;

    const item = wishlistItems[index];

    Animated.timing(item.anim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(async () => {
      try {
        await deleteDoc(doc(db, 'wishlists', userId, 'items', itemId));
        setWishlistItems(prev => prev.filter(i => i.id !== itemId));
        setFeedback('Removed from wishlist.');
        setTimeout(() => setFeedback(''), 2000);
      } catch (error) {
        console.error('Error removing item:', error);
      }
    });
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // Render each wishlist product
  const renderItem = ({ item }) => (
    <View>
      <Link href={`/shop/${item.id}`} asChild>
        <TouchableOpacity>
          <Animated.View style={{ opacity: item.anim, transform: [{ scale: item.anim }], ...styles.card }}>
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
            <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.cardPrice}>Rp {item.price.toLocaleString()}</Text>
            <Text style={styles.cardSize}>Size: {item.size}</Text>
          </Animated.View>
        </TouchableOpacity>
      </Link>
      <TouchableOpacity style={styles.removeButton} onPress={() => removeItem(item.id)}>
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top icons */}
      <View style={styles.topIconsRow}>
        <Link href="/(notification)" asChild>
          <TouchableOpacity>
            <Image source={require('../../assets/notification.png')} style={styles.notificationIcon} />
          </TouchableOpacity>
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

      {/* Search + Sort */}
      <View style={styles.searchRow}>
        <TextInput placeholder="Search Products" style={styles.searchInput} />
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortText}>⇅</Text>
        </TouchableOpacity>
      </View>

      {/* Title + Feedback */}
      <Text style={styles.pageTitle}>WISHLIST</Text>
      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

      {/* Main Content */}
      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 40 }} />
      ) : wishlistItems.length === 0 ? (
        <Text style={styles.emptyText}>Your wishlist is empty</Text>
      ) : (
        <FlatList
          data={wishlistItems}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.rowWrapper}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 80 }}
          renderItem={renderItem}
        />
      )}

      {/* Bottom nav */}
      <View style={styles.tabBar}>
        <NavIcon href="/(home)" icon={homeIcon} label="Home" />
        <NavIcon href="/shop" icon={shopIcon} label="Shop" />
        <NavIcon href="/(wishlist)" icon={wishlistIcon} label="Wishlist" />
        <NavIcon href="/(profile)" icon={profileIcon} label="Profile" />
      </View>
    </SafeAreaView>
  );
}

// Reusable bottom nav icon
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

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 10,
  },
  notificationIcon: { width: 32, height: 32 },
  cartIcon: { width: 28, height: 28 },
  logoContainer: { alignItems: 'center', marginBottom: 10, marginTop: -10 },
  fullLogo: { width: 240, height: 60 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  sortButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sortText: {
    fontSize: 18,
    fontWeight: '600',
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  feedback: {
    fontSize: 14,
    color: 'green',
    fontWeight: '600',
    marginHorizontal: 20,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#888',
    marginTop: 40,
  },
  rowWrapper: {
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  card: {
    width: (SCREEN_WIDTH - 60) / 2,
    alignItems: 'flex-start',
  },
  cardImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardPrice: {
    fontSize: 12,
    color: '#333',
  },
  cardSize: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  removeButton: {
    backgroundColor: '#000',
    borderRadius: 10,
    paddingVertical: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 6,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
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
