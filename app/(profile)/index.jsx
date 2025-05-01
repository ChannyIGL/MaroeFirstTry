import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import homeIcon from '../../assets/home.png';
import shopIcon from '../../assets/shop.png';
import wishlistIcon from '../../assets/wishlist.png';
import profileIcon from '../../assets/profile.png';

export default function ProfilePage() {
  const user = auth.currentUser;
  const router = useRouter();

  const userName = user?.displayName || user?.email?.split('@')[0] || 'Guest';

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert('Logged out');
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Error logging out');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/fullLogo.png')} style={styles.fullLogo} resizeMode="contain" />
      </View>

      {/* Profile Info */}
      <View style={styles.profileBox}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{userName}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Quote + Branding Footer */}
      <LinearGradient
        colors={['#f5f5f5', '#ffffff']}
        style={styles.quoteWrapper}
      >
        <Text style={styles.quoteText}>
          “Style is a way to say who you are without having to speak.” — Rachel Zoe
        </Text>
        <Text style={styles.version}>✨ Powered by MAROE</Text>
      </LinearGradient>

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
  logoContainer: { alignItems: 'center', marginVertical: 20 },
  fullLogo: { width: 240, height: 60 },
  profileBox: {
    marginHorizontal: 30,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  logoutButton: {
    marginTop: 10,
    backgroundColor: '#000',
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 30,
    marginTop: 40,
  },
  quoteWrapper: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 20,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#777',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 10,
  },
  version: {
    fontSize: 12,
    color: '#aaa',
    fontWeight: '500',
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
