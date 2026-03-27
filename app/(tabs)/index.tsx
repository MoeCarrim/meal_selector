import SpinWheel from '@/components/spin-wheel';
import { useMeals } from '@/hooks/use-meals';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SpinnerScreen() {
  const { meals, availableMeals, loading, addMeal, removeMeal, recordSelection } = useMeals();
  const [newMeal, setNewMeal] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  async function handleAdd() {
    const trimmed = newMeal.trim();
    if (!trimmed) return;
    const duplicate = meals.find((m) => m.name.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) {
      Alert.alert('Duplicate', `"${trimmed}" is already in your list.`);
      return;
    }
    await addMeal(trimmed);
    setNewMeal('');
  }

  async function handleResult(meal: string) {
    setResult(meal);
    setShowResult(true);
    // Find meal object to record
    const found = meals.find((m) => m.name === meal);
    if (found) {
      await recordSelection(found);
    }
  }

  function handleConfirm() {
    setShowResult(false);
  }

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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerIcon}>🌙</Text>
            <Text style={styles.headerTitle}>Iftaar Spinner</Text>
            <Text style={styles.headerSubtitle}>What&apos;s for iftaar tonight?</Text>
          </View>

          {/* Spinning Wheel */}
          <View style={styles.wheelSection}>
            <SpinWheel meals={availableMeals.map((m) => m.name)} onResult={handleResult} />
            {meals.length > 0 && availableMeals.length === 0 && (
              <View style={styles.allExcludedBanner}>
                <Text style={styles.allExcludedText}>
                  🕐 All meals were recently selected. Go to Settings to adjust the exclusion
                  period or clear history.
                </Text>
              </View>
            )}
          </View>

          {/* Add Meal Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🍛 Your Meals ({meals.length})</Text>
            <View style={styles.addRow}>
              <TextInput
                style={styles.input}
                placeholder="Add a meal…"
                placeholderTextColor="#aaa"
                value={newMeal}
                onChangeText={setNewMeal}
                onSubmitEditing={handleAdd}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Meal list */}
            {meals.length === 0 ? (
              <View style={styles.emptyListContainer}>
                <Text style={styles.emptyListText}>
                  No meals yet. Add some using the field above!
                </Text>
              </View>
            ) : (
              meals.map((meal) => {
                const excluded = !availableMeals.find((m) => m.id === meal.id);
                return (
                  <View key={meal.id} style={[styles.mealRow, excluded && styles.mealRowExcluded]}>
                    <Text style={[styles.mealName, excluded && styles.mealNameExcluded]}>
                      {excluded ? '⏳ ' : '✅ '}
                      {meal.name}
                    </Text>
                    {excluded && <Text style={styles.excludedBadge}>Recently selected</Text>}
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() =>
                        Alert.alert('Remove Meal', `Remove "${meal.name}" from the list?`, [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Remove', style: 'destructive', onPress: () => removeMeal(meal.id) },
                        ])
                      }
                    >
                      <Text style={styles.removeBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Result Modal */}
      <Modal
        visible={showResult}
        transparent
        animationType="fade"
        onRequestClose={handleConfirm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalMoon}>🌙✨</Text>
            <Text style={styles.modalTitle}>Tonight&apos;s Iftaar</Text>
            <Text style={styles.modalMeal}>{result}</Text>
            <Text style={styles.modalSubtitle}>Bismillah! Enjoy your meal 🤲</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={handleConfirm}>
              <Text style={styles.modalBtnText}>Alhamdulillah!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
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
    fontSize: 40,
    marginBottom: 4,
  },
  headerTitle: {
    color: GOLD,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  wheelSection: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  allExcludedBanner: {
    backgroundColor: '#FFF3CD',
    margin: 12,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  allExcludedText: {
    color: '#856404',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 16,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: GREEN,
    marginBottom: 10,
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  addButton: {
    backgroundColor: GREEN,
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: 'bold',
  },
  emptyListContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyListText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: GREEN,
  },
  mealRowExcluded: {
    borderLeftColor: '#ccc',
    opacity: 0.7,
  },
  mealName: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  mealNameExcluded: {
    color: '#888',
  },
  excludedBadge: {
    fontSize: 11,
    color: '#888',
    backgroundColor: '#eee',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  removeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FFF0F0',
  },
  removeBtnText: {
    color: '#E63946',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    borderWidth: 3,
    borderColor: GOLD,
  },
  modalMoon: {
    fontSize: 48,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    color: '#666',
    marginBottom: 12,
    fontWeight: '600',
  },
  modalMeal: {
    fontSize: 32,
    fontWeight: 'bold',
    color: GREEN,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalBtn: {
    backgroundColor: GREEN,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: GOLD,
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

