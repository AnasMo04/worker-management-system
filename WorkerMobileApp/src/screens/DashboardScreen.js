import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import workerService from '../api/workerService';
import apiClient from '../api/apiClient';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';

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

  const renderWorkerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.workerCard}
      onPress={() => navigation.navigate('WorkerDetails', { workerId: item.id })}
    >
      <View style={styles.workerInfo}>
        <Text style={styles.workerName}>{item.Full_Name}</Text>
        <Text style={styles.workerSub}>جواز: {item.Passport_Number}</Text>
        {item.Sponsor && (
          <Text style={styles.workerSub}>الكفيل: {item.Sponsor.Sponsor_Name}</Text>
        )}
      </View>
      <StatusBadge variant={item.Current_Status} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>لوحة التحكم</Text>
            <Text style={styles.welcomeSubtitle}>مرحباً، {user?.name}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>خروج</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsGrid}>
          <KPICard
            title="إجمالي العمال"
            value={dashboardData?.counts?.totalWorkers || 0}
            gradient="kpi-gradient-1"
          />
          <KPICard
            title="البطاقات النشطة"
            value={dashboardData?.counts?.activeCards || 0}
            gradient="kpi-gradient-2"
          />
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.nfcButton}
          onPress={() => {
            if (searchQuery) handleNfcScan(searchQuery);
            else Alert.alert('تنبيه', 'يرجى إدخال NFC UID في مربع البحث لمحاكاة المسح');
          }}
        >
          <Text style={styles.nfcButtonText}>مسح بطاقة NFC</Text>
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="بحث بالاسم أو الرقم أو NFC UID..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>بحث</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Workers List Header */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>سجل العمال</Text>
          <Text style={styles.listSubtitle}>آخر السجلات المضافة</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#1e40af" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.listContainer}>
            {workers.map(worker => (
              <View key={worker.id}>
                {renderWorkerItem({ item: worker })}
              </View>
            ))}
            {workers.length === 0 && (
              <Text style={styles.emptyText}>لا توجد نتائج للبحث</Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // background variable
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  welcomeContainer: {
    alignItems: 'flex-end',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
  },
  logoutText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 14,
  },
  statsGrid: {
    padding: 16,
  },
  nfcButton: {
    backgroundColor: '#0d9488', // secondary variable
    marginHorizontal: 16,
    marginBottom: 16,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nfcButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    textAlign: 'right',
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: '#1e40af', // primary variable
    paddingHorizontal: 20,
    height: 48,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listHeader: {
    paddingHorizontal: 24,
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  listSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  workerCard: {
    flexDirection: 'row-reverse',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  workerInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  workerName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  workerSub: {
    fontSize: 13,
    color: '#64748b',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
});

export default DashboardScreen;
