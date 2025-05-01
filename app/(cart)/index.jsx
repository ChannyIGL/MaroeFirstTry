import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions, SafeAreaView, Alert } from 'react-native';
import { Link } from 'expo-router';
import { auth, db } from '../../firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import homeIcon from '../../assets/home.png';
import shopIcon from '../../assets/shop.png';
import wishlistIcon from '../../assets/wishlist.png';
import profileIcon from '../../assets/profile.png';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  // Fetch cart items from Firestore
  const fetchCart = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const snapshot = await getDocs(collection(db, 'carts', userId, 'items'));
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCartItems(items);
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  // Calculate total whenever cart changes
  useEffect(() => {
    const sum = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setTotal(sum);
  }, [cartItems]);

  useEffect(() => {
    fetchCart();
  }, []);

  // Increase item quantity
  const increaseQty = async (item) => {
    const ref = doc(db, 'carts', auth.currentUser.uid, 'items', item.id);
    await updateDoc(ref, { quantity: item.quantity + 1 });
    fetchCart();
  };

  // Decrease item quantity or remove
  const decreaseQty = async (item) => {
    if (item.quantity <= 1) return;
    const ref = doc(db, 'carts', auth.currentUser.uid, 'items', item.id);
    await updateDoc(ref, { quantity: item.quantity - 1 });
    fetchCart();
  };

  // Remove item from cart
  const removeItem = async (itemId) => {
    try {
      const ref = doc(db, 'carts', auth.currentUser.uid, 'items', itemId);
      await deleteDoc(ref);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error removing item:', err);
      Alert.alert('Error', 'Could not remove item.');
    }
  };

  // Render each cart product
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSize}>Size: {item.size}</Text>
        <Text style={styles.cardPrice}>Rp {item.price.toLocaleString()}</Text>

        <View style={styles.qtyRow}>
          <TouchableOpacity onPress={() => decreaseQty(item)} style={styles.qtyBtn}>
            <Text style={styles.qtySymbol}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => increaseQty(item)} style={styles.qtyBtn}>
            <Text style={styles.qtySymbol}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => removeItem(item.id)}>
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>MY CART</Text>
        <Text style={styles.itemCount}>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Cart List */}
      <FlatList
        data={cartItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
        style={{ paddingHorizontal: 20 }}
      />

      {/* Footer Total */}
      <View style={styles.totalFooter}>
        <Text style={styles.totalLabel}>Estimated Total</Text>
        <Text style={styles.totalValue}>Rp {total.toLocaleString()}</Text>
        <TouchableOpacity style={styles.checkoutButton}>
          <Text style={styles.checkoutText}>Proceed to Pickup</Text>
        </TouchableOpacity>
      </View>

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
  header: {
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  pageTitle: { fontSize: 22, fontWeight: 'bold' },
  itemCount: { color: '#888', fontSize: 13 },
  card: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 16,
  },
  cardImage: {
    width: 90,
    height: 110,
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardSize: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
    marginBottom: 8,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 10,
  },
  qtyBtn: {
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  qtySymbol: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  qtyValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeText: {
    fontSize: 12,
    color: '#e44',
    textDecorationLine: 'underline',
  },
  totalFooter: {
    position: 'absolute',
    bottom: 70,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 6,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  checkoutButton: {
    backgroundColor: '#000',
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 14,
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
