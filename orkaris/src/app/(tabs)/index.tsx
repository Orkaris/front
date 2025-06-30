import { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { useThemeContext } from '@/src/context/ThemeContext';
import MotivationalStats, { MotivationalStat } from '@/src/components/statistics/motivationalStats';
import WeeklyPerformance from '@/src/components/statistics/weeklyPerformance';
import { apiService } from '@/src/services/api';
import { useAuth } from '@/src/context/AuthContext';
import { i18n } from '@/src/i18n/i18n'; // Ajout de l'import i18n
import { useLanguageContext } from '@/src/context/LanguageContext';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';

interface RawSession {
  date: string; // ISO
  duration: number; // in minutes
}

export default function HomeScreen() {
  const { theme } = useThemeContext();
  const { language } = useLanguageContext();

  // States
  const [sessions, setSessions] = useState<RawSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [motivStats, setMotivStats] = useState<MotivationalStat[]>([]);
  const { userId } = useAuth();

  // MotivationalStats
  async function fetchWeeklyVolume() {
    return await apiService.get(`/stats/weekly-volume/${userId}`);
    //return "12 500 kg";
  }
  async function fetchWeeklySets() {
    try {
      const response = await apiService.get<number>(`/stats/weekly-sets/${userId}`);
      return response;
    } catch (error) {
      console.error("Failed to fetch weekly sets", error);
      return 0; 
    }
  }
  async function fetchMonthlySessions() {
    try {
      const response = await apiService.get(`/stats/monthly-sessions/${userId}`);
      return response;
    } catch (error) {
      console.error("Failed to fetch weekly sets", error);
      return 0;
    }
  }

  // A voir si on veut réactiver ces stats plus tard
  // async function fetchBenchProgress() {
  //   // return await apiService.get('/stats/bench-progress');
  //   return "+10 kg";
  // }
  // async function fetchProgramCompletion() {
  //   // return await apiService.get('/stats/program-completion');
  //   return "60 %";
  // }

  // Remplace useEffect par useFocusEffect pour recharger à chaque focus
  useFocusEffect(
    // useCallback pour éviter des effets de bord
    React.useCallback(() => {
      let isActive = true;
      async function fetchAllStats() {
        setLoading(true);
        try {

          // MotivationalStats
          const [rawVolume, sets, nbSessions] = await Promise.all([
            fetchWeeklyVolume(),
            fetchWeeklySets(),
            fetchMonthlySessions(),
          ]);
          if (!isActive) return;
          setMotivStats([
            { value: rawVolume as string | number, message: i18n.t('home.weekly_volume', { volume: rawVolume }), icon: "🏋️" },
            { value: sets, message: i18n.t('home.weekly_sets', { sets }), icon: "📊" },
            { value: nbSessions as string | number, message: i18n.t('home.monthly_sessions', { sessions: nbSessions }), icon: "🔥" },
          ]);

          // WeeklyPerformance TODO: à réactiver quand l'API sera prête
          const sessionsData = await apiService.get<RawSession[]>(`/stats/last-8-weeks-sessions/${userId}`);
          if (!isActive) return;
          setSessions(sessionsData);

        } catch (e) {
          if (!isActive) return;
          setMotivStats([
            { value: "12 500 kg", message: i18n.t('home.fallback_volume'), icon: "🏋️" },
            { value: 345, message: i18n.t('home.fallback_sets'), icon: "📊" },
            { value: 5, message: i18n.t('home.fallback_sessions'), icon: "🔥" },
            //{ value: "+10 kg", message: "Ton record au développé couché a augmenté de +10 kg depuis le mois dernier.", icon: "💪" },
            //{ value: "60 %", message: "Tu as complété 60 % de ton programme 'Force 5x5'.", icon: "📈" },
          ]);
        } finally {
          if (isActive) setLoading(false);
        }
      }
      fetchAllStats();
      return () => { isActive = false; };
    }, [language, userId])
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <MotivationalStats stats={motivStats} theme={theme} />
      {!loading && <WeeklyPerformance sessions={sessions} theme={theme} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});