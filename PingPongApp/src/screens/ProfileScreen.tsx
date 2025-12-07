import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, SafeAreaView, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';
import { MY_STATS, HISTORY, Match } from '../constants/data';
import MatchSelectionModal from '../components/modals/MatchSelectionModal';
import ScoreModal from '../components/modals/ScoreModal';

const ProfileScreen: React.FC = () => {
  const [showMyQR, setShowMyQR] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showMatchSelector, setShowMatchSelector] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const handleMatchSelect = (match: Match) => { 
    setShowMatchSelector(false); 
    setTimeout(() => setSelectedMatch(match), 300); 
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <View><Text style={styles.name}>{MY_STATS.name}</Text><Text style={styles.sub}>Gold League III</Text></View>
          <TouchableOpacity onPress={() => setShowMyQR(true)} style={styles.qrBtn}><MaterialCommunityIcons name="qrcode" size={26} color={COLORS.text} /></TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PENDING ACTION</Text>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowMatchSelector(true)}>
            <LinearGradient colors={[COLORS.primary, '#4338CA']} style={styles.gradient} start={{x:0, y:0}} end={{x:1, y:1}}>
               <View style={styles.icon}><Feather name="edit-3" size={20} color={COLORS.primary} /></View>
               <Text style={styles.actionText}>Enter Match Score</Text>
               <Feather name="chevron-right" size={20} color="white" style={{marginLeft:'auto'}} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}><Text style={styles.statLabel}>WIN RATE</Text><Text style={styles.statVal}>{MY_STATS.winRate}</Text></View>
          <View style={styles.statCard}><Text style={styles.statLabel}>STREAK</Text><Text style={styles.statVal}>{MY_STATS.streak}</Text></View>
          <View style={styles.statCard}><Text style={styles.statLabel}>MATCHES</Text><Text style={styles.statVal}>{MY_STATS.matches}</Text></View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.scanBtn} onPress={() => setShowCamera(true)}>
            <MaterialCommunityIcons name="qrcode-scan" size={24} color={COLORS.primary} />
            <Text style={styles.scanText}>Scan Opponent QR</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECENT HISTORY</Text>
          {HISTORY.map((item) => (
            <View key={item.id} style={styles.row}>
              <View style={[styles.badge, { backgroundColor: item.result === 'W' ? '#DCFCE7' : '#FEE2E2' }]}>
                <Text style={[styles.resText, {color: item.result === 'W' ? COLORS.success : COLORS.danger}]}>{item.result}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.opp}>vs {item.opponent}</Text>
                <Text style={styles.date}>{item.date}</Text>
              </View>
              <Text style={styles.score}>{item.score}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <MatchSelectionModal visible={showMatchSelector} onClose={() => setShowMatchSelector(false)} onSelect={handleMatchSelect} />
      <ScoreModal visible={!!selectedMatch} match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      
      <Modal visible={showMyQR} transparent animationType="fade"><View style={styles.modalOverlay}><View style={styles.qrCard}><Text style={styles.qrTitle}>My Player ID</Text><MaterialCommunityIcons name="qrcode" size={200} color="black" style={{marginVertical: 20}} /><TouchableOpacity onPress={() => setShowMyQR(false)} style={styles.closeBtn}><Text style={styles.closeText}>Close</Text></TouchableOpacity></View></View></Modal>
      <Modal visible={showCamera} animationType="slide"><SafeAreaView style={{flex:1, backgroundColor:'black'}}><View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text style={{color:'white', marginBottom: 20}}>Scan QR Code</Text><View style={{width: 250, height: 250, borderWidth: 2, borderColor: COLORS.primary}} /></View><TouchableOpacity onPress={() => setShowCamera(false)} style={{padding: 20, alignItems:'center', marginBottom: 30}}><Text style={{color:'white', fontSize: 18, fontWeight: 'bold'}}>Close Camera</Text></TouchableOpacity></SafeAreaView></Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 24, alignItems: 'center' },
  name: { fontSize: 28, fontWeight: '900', color: COLORS.text },
  sub: { fontSize: 14, color: COLORS.textSec },
  qrBtn: { padding: 8, backgroundColor: COLORS.card, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  section: { paddingHorizontal: 24, marginBottom: 25 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textSec, marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' },
  actionBtn: { shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  gradient: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16 },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  actionText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginBottom: 25 },
  statCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, shadowColor: COLORS.shadow, shadowOpacity: 0.05, shadowRadius: 5 },
  statLabel: { color: COLORS.textSec, fontSize: 10, fontWeight: '700', marginBottom: 4 },
  statVal: { color: COLORS.text, fontSize: 20, fontWeight: 'bold' },
  scanBtn: { backgroundColor: COLORS.card, padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: COLORS.border, shadowColor: COLORS.shadow, shadowOpacity: 0.05, shadowRadius: 5 },
  scanText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  badge: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  resText: { fontWeight: 'bold', fontSize: 12 },
  opp: { color: COLORS.text, fontWeight: 'bold', fontSize: 14 },
  date: { color: COLORS.textSec, fontSize: 12 },
  score: { color: COLORS.text, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  qrCard: { backgroundColor: 'white', padding: 30, borderRadius: 20, alignItems: 'center' },
  qrTitle: { fontSize: 18, fontWeight: 'bold' },
  closeBtn: { marginTop: 20, backgroundColor: COLORS.text, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  closeText: { color: 'white', fontWeight: 'bold' },
});

export default ProfileScreen;