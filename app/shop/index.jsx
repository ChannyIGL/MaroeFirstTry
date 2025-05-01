import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView, FlatList, Dimensions, SafeAreaView, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import homeIcon from '../../assets/home.png';
import shopIcon from '../../assets/shop.png';
import wishlistIcon from '../../assets/wishlist.png';
import profileIcon from '../../assets/profile.png';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'products'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const renderItem = ({ item }) => (
    <Link href={`/shop/${item.id}`} asChild>
      <TouchableOpacity style={styles.card}>
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
        <Text style={styles.cardPrice}>Rp {item.price.toLocaleString()}</Text>
        <Text style={styles.cardSizes}>Sizes: {item.sizes?.join(' / ')}</Text>
      </TouchableOpacity>
    </Link>
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

      {/* Search and Sort */}
      <View style={styles.searchRow}>
        <TextInput placeholder="Search Products" style={styles.searchInput} />
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortText}>⇅</Text>
        </TouchableOpacity>
      </View>

      {/* Product Grid */}
      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.rowWrapper}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 80 }}
          renderItem={renderItem}
        />
      )}

      {/* Bottom Nav */}
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
  topIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 10,
  },
  notificationIcon: { width: 32, height: 32 },
  cartIcon: { width: 28, height: 28 },
  logoContainer: { alignItems: 'center', marginBottom: 10 },
  fullLogo: { width: 240, height: 70 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  cardSizes: {
    fontSize: 11,
    color: '#777',
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
