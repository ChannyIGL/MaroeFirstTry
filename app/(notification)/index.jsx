import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useRouter, Link } from 'expo-router';
import homeIcon from '../../assets/home.png';
import shopIcon from '../../assets/shop.png';
import wishlistIcon from '../../assets/wishlist.png';
import profileIcon from '../../assets/profile.png';
import cartIcon from '../../assets/cart.png';
import notificationIcon from '../../assets/notification.png';
import fullLogo from '../../assets/fullLogo.png';
import logoOnly from '../../assets/logo.png';

export default function NotificationPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [search, setSearch] = useState('');
  const router = useRouter();

  // Fetch orders from Firestore
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = auth.currentUser?.uid;
        const snap = await getDocs(collection(db, 'orders', userId, 'reservations'));
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sorted);
        setFilteredOrders(sorted);
      } catch (error) {
        console.error('Error loading orders:', error);
      }
    };
    fetchOrders();
  }, []);

  // Filter orders by reservation ID
  useEffect(() => {
    if (!search.trim()) {
      setFilteredOrders(orders);
    } else {
      const keyword = search.toLowerCase();
      setFilteredOrders(orders.filter(order => order.id.toLowerCase().includes(keyword)));
    }
  }, [search, orders]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar with logo and icons */}
      <View style={styles.topIconsRow}>
        <TouchableOpacity>
          <Image source={notificationIcon} style={styles.icon} />
        </TouchableOpacity>
        <Image source={fullLogo} style={styles.logo} resizeMode="contain" />
        <Link href="/(cart)" asChild>
          <TouchableOpacity>
            <Image source={cartIcon} style={styles.icon} />
          </TouchableOpacity>
        </Link>
      </View>

      {/* Search field for filtering reservations */}
      <TextInput
        placeholder="Search by reservation ID..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      <Text style={styles.title}>Your Orders</Text>

      {/* List of filtered orders */}
      <ScrollView contentContainerStyle={styles.scroll}>
        {filteredOrders.length === 0 ? (
          <Text style={styles.empty}>No orders found.</Text>
        ) : (
          filteredOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => router.push(`/order/${order.id}`)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.orderText}>Reservation ID: {order.id.slice(0, 6)}...</Text>
                <Text style={styles.status}>{order.status}</Text>
                <Text style={styles.date}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Image source={logoOnly} style={styles.logoMini} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Bottom nav bar */}
      <View style={styles.tabBar}>
        <NavIcon href="/(home)" icon={homeIcon} label="Home" />
        <NavIcon href="/shop" icon={shopIcon} label="Shop" />
        <NavIcon href="/(wishlist)" icon={wishlistIcon} label="Wishlist" />
        <NavIcon href="/(profile)" icon={profileIcon} label="Profile" />
      </View>
    </SafeAreaView>
  );
}

// Bottom navigation icon component
function NavIcon({ href, icon, label }) {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.push(href)} style={styles.tabItem}>
      <Image source={icon} style={styles.tabIcon} />
      <Text style={styles.tabLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  icon: { width: 28, height: 28 },
  logo: { width: 200, height: 50 },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  empty: {
    textAlign: 'center',
    fontSize: 14,
    color: '#777',
  },
  orderCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderText: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  status: {
    fontSize: 13,
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  logoMini: {
    width: 30,
    height: 30,
    marginLeft: 12,
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