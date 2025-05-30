import { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { useThemeContext } from '@/src/context/ThemeContext';
import MotivationalStats, { MotivationalStat } from '@/src/components/statistics/motivationalStats';
import WeeklyPerformance from '@/src/components/statistics/weeklyPerformance';
import { apiService } from '@/src/services/api';

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

  // Fonctions API pour les MotivationalStats
  async function fetchWeeklyVolume() {
    // return await apiService.get('/stats/weekly-volume');
    return "12 500 kg";
  }
  async function fetchMonthlySets() {
    // return await apiService.get('/stats/monthly-sets');
    return 345;
  }
  async function fetchMonthlySessions() {
    // return await apiService.get('/stats/monthly-sessions');
    return 5;
  }
  async function fetchBenchProgress() {
    // return await apiService.get('/stats/bench-progress');
    return "+10 kg";
  }
  async function fetchProgramCompletion() {
    // return await apiService.get('/stats/program-completion');
    return "60 %";
  }

  // Appel API pour récupérer les données MotivationalStats et WeeklyPerformance
  useEffect(() => {
    async function fetchAllStats() {
      setLoading(true);
      try {
        // WeeklyPerformance
        const sessionsData = await apiService.get<RawSession[]>('/sessions/weekly');
        setSessions(sessionsData);

        // MotivationalStats
        const [volume, sets, nbSessions, bench, completion] = await Promise.all([
          fetchWeeklyVolume(),
          fetchMonthlySets(),
          fetchMonthlySessions(),
          fetchBenchProgress(),
          fetchProgramCompletion(),
        ]);
        setMotivStats([
          { value: volume, message: `Tu as soulevé ${volume} cette semaine !`, icon: "🏋️" },
          { value: sets, message: `${sets} séries terminées ce mois-ci.`, icon: "📊" },
          { value: nbSessions, message: `${nbSessions} sessions complètes ce mois-ci. Garde le rythme !`, icon: "🔥" },
          { value: bench, message: `Ton record au développé couché a augmenté de ${bench} depuis le mois dernier.`, icon: "💪" },
          { value: completion, message: `Tu as complété ${completion} de ton programme 'Force 5x5'.`, icon: "📈" },
        ]);
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
          { value: 345, message: "345 séries terminées ce mois-ci.", icon: "📊" },
          { value: 5, message: "5 sessions complètes ce mois-ci. Garde le rythme !", icon: "🔥" },
          { value: "+10 kg", message: "Ton record au développé couché a augmenté de +10 kg depuis le mois dernier.", icon: "💪" },
          { value: "60 %", message: "Tu as complété 60 % de ton programme 'Force 5x5'.", icon: "📈" },
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