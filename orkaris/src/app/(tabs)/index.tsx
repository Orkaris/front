import { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { useThemeContext } from '@/src/context/ThemeContext';
import MotivationalStats, { MotivationalStat } from '@/src/components/statistics/motivationalStats';
import WeeklyPerformance from '@/src/components/statistics/weeklyPerformance';
import { apiService } from '@/src/services/api';
import { useAuth } from '@/src/context/AuthContext';

interface RawSession {
  date: string; // ISO
  duration: number; // in minutes
}

export default function HomeScreen() {
  const { theme } = useThemeContext();

  // States
  const [sessions, setSessions] = useState<RawSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [motivStats, setMotivStats] = useState<MotivationalStat[]>([]);
  const { userId } = useAuth();

  // MotivationalStats
  async function fetchWeeklyVolume() {
    //return await apiService.get('/stats/weekly-volume');
    return "12 500 kg";
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

  // Appel API pour récupérer les données + mocks en cas d'erreur
  useEffect(() => {
    async function fetchAllStats() {
      setLoading(true);
      try {

        // MotivationalStats
        const [rawVolume, sets, nbSessions] = await Promise.all([
          fetchWeeklyVolume(),
          fetchWeeklySets(),
          fetchMonthlySessions(),
        ]);
        setMotivStats([
          { value: rawVolume, message: `Tu as soulevé ${rawVolume} cette semaine !`, icon: "🏋️" },
          { value: sets, message: `${sets} séries terminées cette semaine.`, icon: "📊" },
          { value: nbSessions as string | number, message: `${nbSessions} sessions complètes ce mois-ci. Garde le rythme !`, icon: "🔥" },
        ]);

        // WeeklyPerformance TODO: à réactiver quand l'API sera prête
        const sessionsData = await apiService.get<RawSession[]>(`/stats/last-8-weeks-sessions/${userId}`);
        setSessions(sessionsData);

      } catch (e) {
        // fallback sur les mocks en cas d'erreur
        setSessions([
          { date: '2025-05-28T10:00:00Z', duration: 60 },
          { date: '2025-05-27T11:00:00Z', duration: 45 },
          { date: '2025-05-25T09:30:00Z', duration: 90 },
          { date: '2025-05-20T14:00:00Z', duration: 60 },
          { date: '2025-05-21T15:30:00Z', duration: 30 },
          { date: '2025-05-13T12:00:00Z', duration: 50 },
          { date: '2025-05-15T10:00:00Z', duration: 40 },
          { date: '2025-05-07T08:00:00Z', duration: 30 },
          { date: '2025-04-30T17:00:00Z', duration: 75 },
          { date: '2025-05-02T18:00:00Z', duration: 60 },
          { date: '2025-04-23T16:00:00Z', duration: 90 },
          { date: '2025-04-15T19:00:00Z', duration: 45 },
          { date: '2025-04-09T09:00:00Z', duration: 30 },
        ]);
        setMotivStats([
          { value: "12 500 kg", message: "Tu as soulevé 12 500 kg cette semaine !", icon: "🏋️" },
          { value: 345, message: "345 séries terminées cette semaine.", icon: "📊" },
          { value: 5, message: "5 sessions complètes ce mois-ci. Garde le rythme !", icon: "🔥" },
          //{ value: "+10 kg", message: "Ton record au développé couché a augmenté de +10 kg depuis le mois dernier.", icon: "💪" },
          //{ value: "60 %", message: "Tu as complété 60 % de ton programme 'Force 5x5'.", icon: "📈" },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchAllStats();
  }, []);

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