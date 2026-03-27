import { useMealsContext } from '@/contexts/meals-context';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SettingsScreen() {
  const { history, exclusionDays, loading, updateExclusionDays, clearHistory } = useMealsContext();

  function handleClearHistory() {
    Alert.alert(
      'Clear History',
      'This will allow all previously selected meals to appear in the wheel again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearHistory,
        },
      ],
    );
  }

  const dayOptions = [1, 2, 3, 5, 7, 14, 30];

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A5C38" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1A5C38" />
      <View style={styles.header}>
        <Text style={styles.headerIcon}>⚙️</Text>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Iftaar Spinner</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Exclusion Days */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🕐 Exclusion Period</Text>
          <Text style={styles.cardDesc}>
            Selected meals won&apos;t appear on the wheel for this many days.
          </Text>
          <View style={styles.daysRow}>
            {dayOptions.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.dayChip, exclusionDays === d && styles.dayChipActive]}
                onPress={() => updateExclusionDays(d)}
              >
                <Text style={[styles.dayChipText, exclusionDays === d && styles.dayChipTextActive]}>
                  {d}d
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.currentSetting}>
            Currently: {exclusionDays} day{exclusionDays !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* History */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>📋 Selection History</Text>
            <TouchableOpacity style={styles.clearBtn} onPress={handleClearHistory}>
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          {history.length === 0 ? (
            <Text style={styles.emptyText}>No meals selected yet. Spin the wheel!</Text>
          ) : (
            history.map((entry, i) => {
              const date = new Date(entry.selectedAt);
              const dateStr = date.toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              });
              const timeStr = date.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <View key={`${entry.mealId}-${entry.selectedAt}`} style={styles.historyRow}>
                  <View style={[styles.historyIndex, { opacity: i === 0 ? 1 : 0.6 }]}>
                    <Text style={styles.historyIndexText}>{i + 1}</Text>
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyMeal}>{entry.mealName}</Text>
                    <Text style={styles.historyDate}>
                      {dateStr} · {timeStr}
                    </Text>
                  </View>
                  {i === 0 && (
                    <View style={styles.latestBadge}>
                      <Text style={styles.latestBadgeText}>Latest</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* About */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌙 About Iftaar Spinner</Text>
          <Text style={styles.aboutText}>
            Iftaar Spinner helps Muslim families decide what to have for iftaar – the meal that
            breaks the fast during Ramadan and other fasting days.{'\n\n'}
            Add your favourite iftaar meals to the list, spin the wheel, and let the app choose
            tonight&apos;s meal!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const GREEN = '#1A5C38';
const GOLD = '#D4AF37';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F0E8',
  },
  header: {
    backgroundColor: GREEN,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerIcon: {
    fontSize: 36,
    marginBottom: 4,
  },
  headerTitle: {
    color: GOLD,
    fontSize: 26,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: GREEN,
    marginBottom: 6,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardDesc: {
    color: '#666',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  dayChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  dayChipActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  dayChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  dayChipTextActive: {
    color: '#fff',
  },
  currentSetting: {
    color: '#888',
    fontSize: 13,
  },
  clearBtn: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E63946',
  },
  clearBtnText: {
    color: '#E63946',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 12,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 10,
  },
  historyIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyIndexText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  historyInfo: {
    flex: 1,
  },
  historyMeal: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 1,
  },
  latestBadge: {
    backgroundColor: GOLD,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  latestBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  aboutText: {
    color: '#555',
    fontSize: 14,
    lineHeight: 20,
  },
});
