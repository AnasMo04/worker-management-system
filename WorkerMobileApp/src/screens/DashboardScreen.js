import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Alert,
  StatusBar,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import workerService from '../api/workerService';
import apiClient from '../api/apiClient';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import { Theme } from '../theme';

const DashboardScreen = ({ navigation }) => {
  const { logout, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchWorkers();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.get('/api/dashboard/summary');
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const fetchWorkers = async (query = '') => {
    setLoading(true);
    try {
      const data = await workerService.getAllWorkers({ search: query });
      setWorkers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNfcScan = async (uid) => {
    setLoading(true);
    try {
      const worker = await workerService.searchByNfcUid(uid);
      if (worker && worker.id) {
        navigation.navigate('WorkerDetails', { workerId: worker.id });
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل العثور على العامل: ' + (error.message || 'خطأ غير معروف'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchWorkers(searchQuery);
  };

  const renderWorkerItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.workerCard}
      onPress={() => navigation.navigate('WorkerDetails', { workerId: item.id })}
    >
      <View style={styles.workerInfo}>
        <Text style={styles.workerName}>{item.Full_Name}</Text>
        <Text style={styles.workerSub}>جواز: {item.Passport_Number}</Text>
        {item.Sponsor && (
          <Text style={styles.workerSub}>جهة العمل: {item.Sponsor.Sponsor_Name}</Text>
        )}
      </View>
      <StatusBadge variant={item.Current_Status} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>لوحة التحكم</Text>
          <Text style={styles.welcomeSubtitle}>نظرة عامة على النظام</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>خروج</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* KPI Section */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiRow}>
            <KPICard
              title="إجمالي العمال"
              value={dashboardData?.counts?.totalWorkers || 0}
              gradient="kpi-gradient-1"
              icon={<Text style={{fontSize: 24}}>👥</Text>}
            />
            <KPICard
              title="البطاقات النشطة"
              value={dashboardData?.counts?.activeCards || 0}
              gradient="kpi-gradient-2"
              icon={<Text style={{fontSize: 24}}>💳</Text>}
            />
          </View>
        </View>

        {/* NFC Scan Action */}
        <TouchableOpacity
          style={styles.nfcButton}
          onPress={() => {
            if (searchQuery) handleNfcScan(searchQuery);
            else Alert.alert('تنبيه', 'يرجى إدخال NFC UID في مربع البحث لمحاكاة المسح');
          }}
        >
          <Text style={styles.nfcButtonIcon}>📡</Text>
          <Text style={styles.nfcButtonText}>مسح بطاقة NFC ميدانياً</Text>
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="بحث بالاسم أو الرقم أو NFC UID..."
              placeholderTextColor={Theme.colors.mutedForeground}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>بحث</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Workers Section */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>آخر التحديثات</Text>
            <View style={styles.badgeLabel}>
              <Text style={styles.badgeLabelText}>ميداني</Text>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 20 }} />
          ) : (
            <View style={styles.listContainer}>
              {workers.map(worker => renderWorkerItem(worker))}
              {workers.length === 0 && (
                <Text style={styles.emptyText}>لا توجد بيانات متاحة حالياً</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  welcomeContainer: {
    alignItems: 'flex-end',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Theme.colors.foreground,
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: Theme.colors.mutedForeground,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Theme.colors.destructive + '10',
    justifyContent: 'center',
  },
  logoutText: {
    color: Theme.colors.destructive,
    fontWeight: '700',
    fontSize: 13,
  },
  kpiContainer: {
    padding: 12,
  },
  kpiRow: {
    flexDirection: 'row',
  },
  nfcButton: {
    flexDirection: 'row-reverse',
    backgroundColor: Theme.colors.secondary,
    marginHorizontal: 16,
    marginBottom: 16,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nfcButtonIcon: {
    fontSize: 20,
    marginLeft: 10,
  },
  nfcButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: 16,
    textAlign: 'right',
    fontSize: 13,
    color: Theme.colors.foreground,
  },
  searchButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 16,
    height: 44,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  listSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
    paddingBottom: 8,
  },
  listHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.foreground,
  },
  badgeLabel: {
    backgroundColor: Theme.colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeLabelText: {
    fontSize: 10,
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  listContainer: {
    paddingTop: 8,
  },
  workerCard: {
    flexDirection: 'row-reverse',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border + '50',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workerInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  workerName: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.foreground,
    marginBottom: 2,
  },
  workerSub: {
    fontSize: 12,
    color: Theme.colors.mutedForeground,
  },
  emptyText: {
    textAlign: 'center',
    padding: 32,
    color: Theme.colors.mutedForeground,
    fontStyle: 'italic',
    fontSize: 13,
  },
});

export default DashboardScreen;
