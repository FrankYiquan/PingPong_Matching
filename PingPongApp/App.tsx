import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from './src/constants/theme';
import PlayScreen from './src/screens/PlayScreen';
import ProfileScreen from './src/screens/ProfileScreen';

export default function App() {
  const [tab, setTab] = useState<'play' | 'profile'>('play');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{flex: 1}}>
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
        <TouchableOpacity style={styles.tabItem} onPress={() => setTab('profile')}>
          <FontAwesome5 name="user-alt" size={20} color={tab === 'profile' ? COLORS.primary : COLORS.textSec} />
          <Text style={[styles.tabText, {color: tab === 'profile' ? COLORS.primary : COLORS.textSec}]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  tabBar: { flexDirection: 'row', backgroundColor: COLORS.tabBar, paddingVertical: 10, paddingBottom: Platform.OS === 'ios' ? 25 : 15, borderTopWidth: 1, borderTopColor: COLORS.border, position: 'absolute', bottom: 0, left: 0, right: 0 },
  tabItem: { flex: 1, alignItems: 'center' },
  tabText: { fontSize: 10, marginTop: 4, fontWeight: '600' },
});
