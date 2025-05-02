import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { doc, getDocs, collection, deleteDoc, addDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';

// Store location coordinates for map markers
const storeCoords = {
  Jakarta: { latitude: -6.2088, longitude: 106.8456 },
  Surabaya: { latitude: -7.2575, longitude: 112.7521 },
};

export default function SelectLocationPage() {
  const [availableStores, setAvailableStores] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [loadingMap, setLoadingMap] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [totalCost, setTotalCost] = useState(0);

  const allStores = ['Jakarta', 'Surabaya'];
  const router = useRouter();

  // Fetch cart and calculate available store locations
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const cartSnap = await getDocs(collection(db, 'carts', userId, 'items'));
        const items = cartSnap.docs.map(doc => doc.data());

        const locationSets = items
          .filter(item => Array.isArray(item.locations))
          .map(item => new Set(item.locations));

        if (locationSets.length > 0) {
          const intersection = locationSets.reduce((acc, locs) =>
            acc ? new Set([...acc].filter(x => locs.has(x))) : locs
          );
          setAvailableStores(Array.from(intersection));
        }

        const enriched = items.map(item => ({
          ...item,
          total: item.price * item.quantity,
        }));
        setCartItems(enriched);
        setTotalCost(enriched.reduce((acc, item) => acc + item.total, 0));
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };

    fetchCartData();
  }, []);

  // Get user's live location for map
  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const location = await Location.getCurrentPositionAsync({});
        setUserCoords({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (err) {
        console.error('Error getting location:', err);
      } finally {
        setLoadingMap(false);
      }
    };

    getLocation();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* MAROE logo */}
        <Image source={require('../../assets/fullLogo.png')} style={styles.logo} resizeMode="contain" />

        {/* Store selector buttons */}
        <Text style={styles.title}>Choose Store Location</Text>
        {allStores.map((store) => {
          const isAvailable = availableStores.includes(store);
          const isSelected = selectedLocation === store;

          return (
            <TouchableOpacity
              key={store}
              style={[
                styles.locationButton,
                isSelected && styles.selected,
                !isAvailable && styles.disabled,
              ]}
              onPress={() => isAvailable && setSelectedLocation(store)}
              disabled={!isAvailable}
            >
              <Text
                style={[
                  styles.locationText,
                  isSelected && styles.selectedText,
                  !isAvailable && styles.disabledText,
                ]}
              >
                {store}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Cart product summary */}
        <Text style={styles.subtitle}>Cart Summary</Text>
        {cartItems.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemText}>{item.name}</Text>
            <Text style={styles.itemText}>Size: {item.size}</Text>
            <Text style={styles.itemText}>Qty: {item.quantity}</Text>
            <Text style={styles.itemText}>Rp {item.total.toLocaleString()}</Text>
          </View>
        ))}
        <Text style={styles.totalText}>Total: Rp {totalCost.toLocaleString()}</Text>

        {/* Map explanation and view */}
        <Text style={styles.subtitle}>Map Overview</Text>
        <Text style={styles.description}>
          This map uses your current location (blue marker) and the selected store (red marker).
        </Text>

        <View style={styles.mapContainer}>
          {loadingMap || !userCoords || !selectedLocation ? (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapText}>📍 Waiting for map data...</Text>
            </View>
          ) : (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: userCoords.latitude,
                longitude: userCoords.longitude,
                latitudeDelta: 0.2,
                longitudeDelta: 0.2,
              }}
            >
              <Marker coordinate={userCoords} title="You" pinColor="blue" />
              <Marker coordinate={storeCoords[selectedLocation]} title={selectedLocation} pinColor="red" />
            </MapView>
          )}
        </View>

        {/* Confirm order and create reservation */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={async () => {
            try {
              const userId = auth.currentUser?.uid;
              const cartSnap = await getDocs(collection(db, 'carts', userId, 'items'));
              const cartItems = cartSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

              const order = {
                userId,
                store: selectedLocation,
                status: 'Approved',
                createdAt: new Date().toISOString(),
                items: cartItems,
                total: cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
              };

              // Save new order to Firestore
              const newOrderRef = await addDoc(collection(db, 'orders', userId, 'reservations'), order);

              // Clear cart after checkout
              for (let item of cartSnap.docs) {
                await deleteDoc(doc(db, 'carts', userId, 'items', item.id));
              }

              // Navigate to order details
              router.push(`/order/${newOrderRef.id}`);
            } catch (err) {
              console.error('Error confirming order:', err);
            }
          }}
        >
          <Text style={styles.continueText}>Confirm Pickup</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 24 },
  logo: { width: 180, height: 50, alignSelf: 'center', marginBottom: 10 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  subtitle: { fontSize: 16, fontWeight: '700', marginTop: 24, marginBottom: 6 },
  description: { fontSize: 13, color: '#555', marginBottom: 12 },
  locationButton: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  selected: { backgroundColor: '#000' },
  disabled: { backgroundColor: '#ccc' },
  locationText: {
    color: '#000',
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedText: { color: '#fff' },
  disabledText: { color: '#777' },
  itemRow: {
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 6,
  },
  itemText: {
    fontSize: 13,
    color: '#333',
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'right',
    marginTop: 8,
  },
  mapContainer: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    height: 200,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  mapText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  continueButton: {
    marginTop: 30,
    backgroundColor: '#000',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});