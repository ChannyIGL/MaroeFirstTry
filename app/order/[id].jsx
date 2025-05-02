import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, SafeAreaView, Image, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import { collection, doc, getDoc, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import homeIcon from '../../assets/home.png';
import shopIcon from '../../assets/shop.png';
import wishlistIcon from '../../assets/wishlist.png';
import profileIcon from '../../assets/profile.png';

export default function OrderDetailPage() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState('');
  const router = useRouter();

  // Fetch order data by ID
  useEffect(() => {
    const fetchOrder = async () => {
      const userId = auth.currentUser?.uid;
      const ref = doc(db, 'orders', userId, 'reservations', id);
      const snap = await getDoc(ref);
      if (snap.exists()) setOrder(snap.data());
    };
    fetchOrder();
  }, [id]);

  // Realtime chat listener
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    const chatRef = collection(db, 'orders', userId, 'reservations', id, 'chats');
    const q = query(chatRef, orderBy('timestamp'));

    const unsub = onSnapshot(q, snapshot => {
      const messages = snapshot.docs.map(doc => doc.data());
      setChat(messages);
    });

    return () => unsub();
  }, [id]);

  // Send chat message to store
  const sendMessage = async () => {
    if (!message.trim()) return;
    const userId = auth.currentUser?.uid;
    const ref = collection(db, 'orders', userId, 'reservations', id, 'chats');
    await addDoc(ref, {
      text: message,
      sender: 'customer',
      timestamp: new Date(),
    });
    setMessage('');
  };

  // Show loading if order hasn't loaded
  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>Loading order...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Top back button + title */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.push('/(home)')}>
              <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Order Details</Text>
          </View>

          {/* Order status */}
          <Text style={[styles.status, styles[`status_${order.status.toLowerCase()}`]]}>
            {order.status}
          </Text>

          {/* List of ordered products */}
          {order.items.map((item, i) => (
            <View key={i} style={styles.itemBox}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              <View style={styles.itemInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.detail}>Size: {item.size}</Text>
                <Text style={styles.detail}>Qty: {item.quantity}</Text>
                <Text style={styles.detail}>Rp {item.price.toLocaleString()} each</Text>
                <Text style={styles.total}>Subtotal: Rp {(item.price * item.quantity).toLocaleString()}</Text>
              </View>
            </View>
          ))}

          {/* Total cost */}
          <Text style={styles.grandTotal}>Total: Rp {order.total.toLocaleString()}</Text>

          {/* Chat section */}
          <Text style={styles.chatTitle}>Chat with Store</Text>
          <View style={styles.chatArea}>
            {chat.map((item, i) => (
              <View
                key={i}
                style={[
                  styles.chatBubble,
                  item.sender === 'customer' ? styles.bubbleRight : styles.bubbleLeft,
                ]}
              >
                <Text style={styles.chatText}>{item.text}</Text>
              </View>
            ))}
          </View>

          {/* Chat input */}
          <View style={styles.chatBox}>
            <TextInput
              placeholder="Type your message..."
              value={message}
              onChangeText={setMessage}
              style={styles.input}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom nav bar */}
        <View style={styles.tabBar}>
          <NavIcon href="/(home)" icon={homeIcon} label="Home" />
          <NavIcon href="/(shop)" icon={shopIcon} label="Shop" />
          <NavIcon href="/(wishlist)" icon={wishlistIcon} label="Wishlist" />
          <NavIcon href="/(profile)" icon={profileIcon} label="Profile" />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Bottom tab nav icon
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
  scroll: { padding: 20, paddingBottom: 100 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backButton: { fontSize: 24, marginRight: 10 },
  title: { fontSize: 22, fontWeight: 'bold' },
  status: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 20,
    fontWeight: '600',
    color: '#fff',
  },
  status_approved: { backgroundColor: 'green' },
  status_cancelled: { backgroundColor: 'red' },
  status_completed: { backgroundColor: 'gray' },
  itemBox: {
    flexDirection: 'row',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 10,
  },
  image: { width: 80, height: 100, borderRadius: 8, marginRight: 12 },
  itemInfo: { flex: 1, justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  detail: { fontSize: 13, color: '#555' },
  total: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  grandTotal: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 30,
  },
  chatTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  chatArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
    minHeight: 120,
  },
  chatBubble: {
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
    maxWidth: '80%',
  },
  bubbleRight: {
    backgroundColor: '#000',
    alignSelf: 'flex-end',
  },
  bubbleLeft: {
    backgroundColor: '#eee',
    alignSelf: 'flex-start',
  },
  chatText: { color: '#fff' },
  chatBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sendButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendText: {
    color: '#fff',
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
