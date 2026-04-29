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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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
          <Icon name="logout-variant" size={20} color={Theme.colors.destructive} />
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
              iconName="account-group"
            />
            <KPICard
              title="البطاقات النشطة"
              value={dashboardData?.counts?.activeCards || 0}
              gradient="kpi-gradient-2"
              iconName="credit-card-chip"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.nfcButton}
          onPress={() => {
            if (searchQuery) handleNfcScan(searchQuery);
            else Alert.alert('تنبيه', 'يرجى إدخال NFC UID في مربع البحث لمحاكاة المسح');
          }}
        >
          <Icon name="nfc-variant" size={24} color="#fff" style={{ marginLeft: 12 }} />
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
              <Icon name="magnify" size={24} color="#fff" />
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
    ...Theme.shadows.sm,
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
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Theme.colors.destructive + '15',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 20,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.md,
  },
  nfcButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
    ...Theme.shadows.sm,
  },
  searchInput: {
    flex: 1,
    height: 52,
    paddingHorizontal: 16,
    textAlign: 'right',
    fontSize: 14,
    color: Theme.colors.foreground,
  },
  searchButton: {
    backgroundColor: Theme.colors.primary,
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
    paddingBottom: 8,
    ...Theme.shadows.sm,
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
    fontWeight: '800',
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
    fontWeight: '800',
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
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.foreground,
    marginBottom: 4,
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
