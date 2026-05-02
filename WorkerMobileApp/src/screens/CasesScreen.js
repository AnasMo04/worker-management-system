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
  ScrollView,
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
      Alert.alert('خطأ', 'فشل في تحميل ملخص القضايا الميدانية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-right" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>القضايا القانونية</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <View style={styles.content}>
             <Text style={styles.welcomeText}>ملخص القضايا المسجلة طرفكم</Text>

             <View style={styles.statsGrid}>
                <CaseStatCard
                   label="مفتوحة"
                   count={summary.open}
                   color={theme.colors.danger}
                   icon="alert-octagon-outline"
                />
                <CaseStatCard
                   label="قيد المراجعة"
                   count={summary.review}
                   color={theme.colors.warning}
                   icon="clock-check-outline"
                />
                <CaseStatCard
                   label="مغلقة"
                   count={summary.closed}
                   color={theme.colors.success}
                   icon="check-circle-outline"
                />
             </View>

             <View style={styles.infoBox}>
                <MaterialCommunityIcons name="information-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.infoText}>يتم تحديث هذه البيانات بشكل لحظي من القاعدة المركزية للمنظومة.</Text>
             </View>

             <TouchableOpacity style={styles.newCaseBtn} activeOpacity={0.8}>
                <MaterialCommunityIcons name="plus" size={24} color={theme.colors.textContrast} />
                <Text style={styles.newCaseText}>تسجيل قضية جديدة</Text>
             </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const CaseStatCard = ({ label, count, color, icon }) => (
  <View style={styles.statCard}>
    <View style={[styles.iconCircle, { backgroundColor: `${color}15` }]}>
       <MaterialCommunityIcons name={icon} size={28} color={color} />
    </View>
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
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    textAlign: 'right',
    marginBottom: 24,
  },
  statsGrid: {
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statCount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  infoBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryTransparent,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 32,
  },
  infoText: {
    flex: 1,
    color: theme.colors.textDark,
    fontSize: 12,
    textAlign: 'right',
    lineHeight: 18,
  },
  newCaseBtn: {
    height: 60,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    elevation: 6,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  newCaseText: {
    color: theme.colors.textContrast,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CasesScreen;
