import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from './src/constants/theme';
import PlayScreen from './src/screens/PlayScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AuthModal from './src/components/modals/AuthModal';
import { AuthProvider, useAuth } from './src/context/AuthContext'; // <--- Import useAuth
import { SocketProvider } from './src/context/SocketContext';

const MainApp = () => {
  const [tab, setTab] = useState<'play' | 'profile'>('play');
  const [authVisible, setAuthVisible] = useState(false);
  
  // 1. Get the token from context
  const { userToken } = useAuth(); 

  // 2. Helper function to handle Profile click
  const handleProfilePress = () => {
    if (!userToken) {
      setAuthVisible(true); // Show login if not logged in
    } else {
      setTab('profile'); // Switch tab if logged in
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{flex: 1}}>
        
        {/* Header Login Button (Optional: Hide if already logged in) */}
        {!userToken && (
          <View style={{position: 'absolute', top: 50, right: 20, zIndex: 100}}>
             <TouchableOpacity onPress={() => setAuthVisible(true)}>
                <Text style={{fontWeight: 'bold', color: COLORS.primary}}>Log In</Text>
             </TouchableOpacity>
          </View>
        )}

        <View style={{ flex: 1 }}>
          {tab === 'play' ? <PlayScreen /> : <ProfileScreen />}
        </View>
      </SafeAreaView>
      
      {/* TAB BAR */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setTab('play')}>
          <MaterialCommunityIcons name="table-tennis" size={26} color={tab === 'play' ? COLORS.primary : COLORS.textSec} />
          <Text style={[styles.tabText, {color: tab === 'play' ? COLORS.primary : COLORS.textSec}]}>Play</Text>
        </TouchableOpacity>

        {/* 3. Protect this Tab */}
        <TouchableOpacity style={styles.tabItem} onPress={handleProfilePress}>
          <FontAwesome5 name="user-alt" size={20} color={tab === 'profile' ? COLORS.primary : COLORS.textSec} />
          <Text style={[styles.tabText, {color: tab === 'profile' ? COLORS.primary : COLORS.textSec}]}>Profile</Text>
        </TouchableOpacity>
      </View>

      <AuthModal 
        visible={authVisible} 
        onClose={() => setAuthVisible(false)}
        onLoginSuccess={() => {
           console.log("Logged in form MainApp!");
           // Optional: Auto-switch to profile on success
           // setTab('profile'); 
        }}
      />
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>  
        <MainApp />
      </SocketProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  tabBar: { flexDirection: 'row', backgroundColor: COLORS.tabBar, paddingVertical: 10, paddingBottom: Platform.OS === 'ios' ? 25 : 15, borderTopWidth: 1, borderTopColor: COLORS.border, position: 'absolute', bottom: 0, left: 0, right: 0 },
  tabItem: { flex: 1, alignItems: 'center' },
  tabText: { fontSize: 10, marginTop: 4, fontWeight: '600' },
});