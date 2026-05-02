import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient from '../api/apiClient';
import theme from '../theme';

const CasesScreen = ({ navigation }) => {
  const [summary, setSummary] = useState({ open: 0, review: 0, closed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/legal-cases/summary');
      setSummary(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'فشل في تحميل ملخص القضايا');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-right" size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>القضايا</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <View style={styles.content}>
          <CaseStatCard label="مفتوحة" count={summary.open} color={theme.colors.danger} />
          <CaseStatCard label="قيد المراجعة" count={summary.review} color={theme.colors.warning} />
          <CaseStatCard label="مغلقة" count={summary.closed} color={theme.colors.success} />
        </View>
      )}
    </SafeAreaView>
  );
};

const CaseStatCard = ({ label, count, color }) => (
  <View style={styles.statCard}>
    <Text style={[styles.statCount, { color }]}>{count}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statCount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    marginTop: 8,
  },
});

export default CasesScreen;
