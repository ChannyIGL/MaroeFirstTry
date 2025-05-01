import React, { useEffect, useState, useRef } from 'react';
import {View, Text, StyleSheet, Image,TextInput, TouchableOpacity, ScrollView, FlatList, Dimensions, SafeAreaView, ActivityIndicator} from 'react-native';
import { Link } from 'expo-router';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import homeIcon from '../../assets/home.png';
import shopIcon from '../../assets/shop.png';
import wishlistIcon from '../../assets/wishlist.png';
import profileIcon from '../../assets/profile.png';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);
  const trendingRef = useRef(null);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const launchDate = new Date('2025-05-22T00:00:00');

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

  const trendingProducts = products.filter(p => p.isTrending);
  const sortedByTimestamp = [...products].sort(
    (a, b) => b.timestamp?.toDate() - a.timestamp?.toDate()
  );
  const newArrivals = sortedByTimestamp.slice(0, 3);

  // Auto-scroll every 3 seconds
  useEffect(() => {
    if (trendingProducts.length > 1) {
      const interval = setInterval(() => {
        const nextIndex = (slideIndex + 1) % trendingProducts.length;
        trendingRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        setSlideIndex(nextIndex);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [slideIndex, trendingProducts.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = launchDate - now;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

      {/* MAROE logo */}
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/fullLogo.png')} style={styles.fullLogo} resizeMode="contain" />
      </View>

      {/* Search bar */}
      <TextInput placeholder="Search Products" style={styles.searchInput} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Trending Slideshow */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TRENDING</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : trendingProducts.length > 0 ? (
            <FlatList
              ref={trendingRef}
              data={trendingProducts}
              keyExtractor={item => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={e => {
                const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setSlideIndex(index);
              }}
              renderItem={({ item }) => (
                <View style={styles.trendingItem}>
                  <Image source={{ uri: item.imageUrl }} style={styles.trendingImage} />
                  <Text style={styles.trendingName}>{item.name}</Text>
                </View>
              )}
            />
          ) : (
            <Text>No trending products available.</Text>
          )}
        </View>

        {/* Divider */}
        <Text style={styles.dividerText}>Just In — Our Freshest Picks</Text>

        {/* New Arrivals */}
        <View style={styles.newArrivalsHeader}>
          <Text style={styles.newArrivalsLabel}>NEW ARRIVALS</Text>
          <Text style={styles.viewAll}>View All</Text>
        </View>

        <View style={styles.newArrivalsRow}>
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            newArrivals.map(product => (
              <View style={styles.newArrivalItemWrapper} key={product.id}>
                <Image source={{ uri: product.imageUrl }} style={styles.newArrivalItem} />
                <View style={styles.textLeft}>
                  <Text style={styles.dressName}>{product.name}</Text>
                  <Text style={styles.dressPrice}>Rp {product.price.toLocaleString()}</Text>
                  <Text style={styles.dressSizes}>Sizes: {product.sizes.join(' / ')}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Divider */}
        <Text style={styles.dividerText}>The Season Ahead, Curated for You</Text>

        {/* Upcoming Arrivals */}
        <View style={styles.upcomingContainer}>
          <Text style={styles.upcomingTitle}>Upcoming Arrivals</Text>
          <Text style={styles.upcomingDesc}>
            The Desert Rose Collection — Unveiling timeless elegance, inspired by Middle Eastern grace.
          </Text>
          <View style={styles.countdownRow}>
            {['Days', 'Hours', 'Mins', 'Sec'].map((label, i) => (
              <View style={styles.timerBlock} key={label}>
                <Text style={styles.timerNumber}>
                  {String([timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds][i]).padStart(2, '0')}
                </Text>
                <Text style={styles.timerLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom nav */}
      <View style={styles.tabBar}>
        <NavIcon href="/(home)" icon={homeIcon} label="Home" />
        <NavIcon href="/(shop)" icon={shopIcon} label="Shop" />
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
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionLabel: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 8,
  },
  trendingItem: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
  },
  trendingImage: {
    width: SCREEN_WIDTH * 0.9,
    height: 200,
    borderRadius: 10,
  },
  trendingName: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  dividerText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 16,
  },
  newArrivalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  newArrivalsLabel: { fontSize: 16, fontWeight: 'bold' },
  viewAll: {
    fontSize: 14,
    color: '#555',
    textDecorationLine: 'underline',
  },
  newArrivalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginHorizontal: 10,
    marginBottom: 30,
  },
  newArrivalItemWrapper: {
    width: 100,
    marginBottom: 20,
  },
  newArrivalItem: {
    width: 100,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#ddd',
    marginBottom: 6,
  },
  textLeft: { alignItems: 'flex-start' },
  dressName: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  dressPrice: { fontSize: 11, color: '#111', marginBottom: 1 },
  dressSizes: { fontSize: 10, color: '#777' },
  upcomingContainer: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  upcomingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  upcomingDesc: {
    textAlign: 'center',
    fontSize: 13,
    color: '#555',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  countdownRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  timerBlock: { alignItems: 'center' },
  timerNumber: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  timerLabel: { fontSize: 12, color: '#555' },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  tabItem: { alignItems: 'center' },
  tabIcon: { width: 24, height: 24, marginBottom: 4 },
  tabLabel: { fontSize: 12, color: '#444' },
});
