import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { MY_STATS, DATES } from '../constants/data';
import PingPongBallButton from '../components/buttons/PingPongBallButton';
import TimePickerModal from '../components/modals/TimePickerModal';
import VsMatchingScreen from './VsMatchingScreen';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/modals/AuthModal';

const PlayScreen: React.FC = () => {
  const [matchMode, setMatchMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedCourt, setSelectedCourt] = useState(1);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [activeTimeField, setActiveTimeField] = useState<'start' | 'end' | null>(null); 
  const [startTime, setStartTime] = useState("6:00 PM");
  const [endTime, setEndTime] = useState("7:30 PM");
  const [authVisible, setAuthVisible] = useState(false); 
  

  const {userToken, isLoading} = useAuth(); 

  const openTimePicker = (field: 'start' | 'end') => { setActiveTimeField(field); setTimeModalVisible(true); };

  const handleTimeSelect = (time: string) => {
    if (activeTimeField === 'start') setStartTime(time);
    else setEndTime(time);
    setTimeModalVisible(false);
  };

  const handleMatchButtonPress = () => {
    if (!isLoading && !userToken) {
      setAuthVisible(true);
      return;
    }
    setMatchMode(true);
  }


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View><Text style={styles.title}>Arena</Text><Text style={styles.sub}>Season 4 Ranked</Text></View>
        <View style={styles.badge}><Text style={styles.badgeText}>{MY_STATS.elo}</Text></View>
      </View>

      
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.dateSec}>
          <View style={styles.dateHead}><Text style={styles.secTitle}>When to play?</Text><Text style={styles.hardDate}>DECEMBER 2025</Text></View>

          {/* Time Selection */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 24, paddingRight: 10 }}>
            {DATES.map((d) => (
              <TouchableOpacity key={d.id} style={[styles.dBox, selectedDate === d.id && styles.dBoxActive]} onPress={() => setSelectedDate(d.id)}>
                <Text style={[styles.dDay, selectedDate === d.id && {color: 'rgba(255,255,255,0.8)'}]}>{d.day}</Text>
                <Text style={[styles.dNum, selectedDate === d.id && {color: 'white'}]}>{d.date}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Time Selection */}
          <View style={styles.timeRow}>
            <TouchableOpacity style={styles.tPill} onPress={() => openTimePicker('start')}><Text style={styles.tLabel}>Start</Text><Text style={styles.tVal}>{startTime}</Text></TouchableOpacity>
            <View style={styles.tLine} />
            <TouchableOpacity style={styles.tPill} onPress={() => openTimePicker('end')}><Text style={styles.tLabel}>End</Text><Text style={styles.tVal}>{endTime}</Text></TouchableOpacity>
          </View>
        </View>

        {/* Start Matching Button */}
        <View style={styles.center}><PingPongBallButton onPress={handleMatchButtonPress} /><Text style={styles.cta}>Tap to find match</Text></View>

        {/* Court Selection */}
        <View style={styles.courtSec}>
          <Text style={[styles.secTitle, { paddingLeft: 24 }]}>Choose Court</Text> 
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 24, paddingRight: 24, paddingBottom: 20 }}>
            {[{id:1, name:'Downtown Rec', dist:'0.8mi', col:COLORS.danger}, {id:2, name:'Spin City', dist:'1.2mi', col:COLORS.success}, {id:3, name:'Westside', dist:'2.5mi', col:COLORS.ballEnd}].map((c) => (
              <TouchableOpacity key={c.id} style={[styles.cCard, selectedCourt === c.id && styles.cCardActive]} onPress={() => setSelectedCourt(c.id)}>
                <View style={{flexDirection:'row', justifyContent:'space-between'}}><Text style={[styles.cName, selectedCourt === c.id && {color: COLORS.primary}]}>{c.name}</Text>{selectedCourt === c.id && <Feather name="check-circle" size={14} color={COLORS.primary} />}</View>
                <Text style={styles.cDist}>{c.dist}</Text>
                <View style={{flexDirection:'row', alignItems:'center', marginTop:'auto'}}><View style={{width:6, height:6, borderRadius:3, backgroundColor:c.col, marginRight:6}}/><Text style={{fontSize:10, color:COLORS.textSec, fontWeight:'bold'}}>Traffic</Text></View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <TimePickerModal visible={timeModalVisible} title={activeTimeField === 'start' ? "Start Time" : "End Time"} onClose={() => setTimeModalVisible(false)} onSelect={handleTimeSelect} />
      <VsMatchingScreen visible={matchMode} onClose={() => setMatchMode(false)} onMatchAccepted={() => { setMatchMode(false); Alert.alert("Match Accepted!", "Game on."); }} />
       <AuthModal 
        visible={authVisible} 
        onClose={() => setAuthVisible(false)}
        onLoginSuccess={() => {
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { padding: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 30, fontWeight: '900', color: COLORS.text },
  sub: { fontSize: 13, color: COLORS.textSec, fontWeight: '600' },
  badge: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
  badgeText: { fontWeight: '900', color: COLORS.primary, fontSize: 16 },
  scroll: { paddingBottom: 100 },
  dateSec: { marginBottom: 10 },
  dateHead: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 10 },
  secTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 },
  hardDate: { fontSize: 12, fontWeight: '900', color: COLORS.textSec, letterSpacing: 1 },
  dBox: { width: 55, height: 70, backgroundColor: COLORS.card, borderRadius: 12, marginRight: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  dBoxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dDay: { fontSize: 10, fontWeight: 'bold', color: COLORS.textSec, marginBottom: 4 },
  dNum: { fontSize: 18, fontWeight: '900', color: COLORS.text },
  timeRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15, gap: 10 },
  tPill: { backgroundColor: COLORS.card, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', minWidth: 100 },
  tLabel: { fontSize: 9, color: COLORS.textSec, fontWeight: '700', textTransform: 'uppercase' },
  tVal: { fontSize: 14, fontWeight: 'bold', color: COLORS.text },
  tLine: { width: 20, height: 2, backgroundColor: COLORS.border },
  center: { marginVertical: 30, alignItems: 'center' },
  cta: { marginTop: 20, color: COLORS.textSec, fontWeight: '600' },
  courtSec: { marginTop: 10 },
  cCard: { width: 140, height: 100, padding: 12, backgroundColor: COLORS.card, borderRadius: 16, marginRight: 12, borderWidth: 1, borderColor: COLORS.border },
  cCardActive: { borderColor: COLORS.primary, backgroundColor: '#EEF2FF', borderWidth: 2 },
  cName: { fontWeight: 'bold', fontSize: 13, color: COLORS.text, width: '85%' },
  cDist: { fontSize: 12, color: COLORS.textSec, marginTop: 4 },
});

export default PlayScreen;