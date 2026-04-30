import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import workerService from '../api/workerService';
import theme from '../theme';

const DashboardScreen = ({ navigation }) => {
  const { logout, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);

  const stats = [
    { label: "تفتيش اليوم", value: "12", color: theme.colors.primary, icon: "clipboard-list-outline" },
    { label: "مخالفات", value: "3", color: theme.colors.danger, icon: "alert-octagon-outline" },
    { label: "تنبيهات", value: "5", color: theme.colors.warning, icon: "bell-outline" },
  ];

  const fetchWorkers = async (query = '') => {
    const sanitizedQuery = query.trim();
    setLoading(true);
    try {
      const data = await workerService.getAllWorkers({ search: sanitizedQuery });
      setWorkers(data);
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ في النظام', 'فشل في استرجاع قائمة العمال');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleSearch = () => {
    fetchWorkers(searchQuery);
  };

  const renderWorkerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.workerCard}
      onPress={() => navigation.navigate('WorkerDetails', { workerId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.workerMainInfo}>
        <Text style={styles.workerName}>{item.Full_Name}</Text>
        <Text style={styles.workerSub}>رقم الجواز: {item.Passport_Number}</Text>
      </View>
      <View style={styles.workerStatusContainer}>
         <View style={[styles.statusBadge, {
           backgroundColor: item.Current_Status === 'Active' ? theme.colors.successSurface : theme.colors.dangerSurface,
           borderColor: item.Current_Status === 'Active' ? theme.colors.success : theme.colors.danger
         }]}>
          <Text style={[styles.statusText, {
            color: item.Current_Status === 'Active' ? theme.colors.success : theme.colors.danger
          }]}>
            {item.Current_Status === 'Active' ? 'نشط' : 'متوقف'}
          </Text>
        </View>
      </View>
      <View style={styles.workerIconContainer}>
        <MaterialCommunityIcons name="account-circle-outline" size={32} color={theme.colors.textSecondary} style={{opacity: 0.5}} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
               <MaterialCommunityIcons name="account-tie" size={24} color={theme.colors.background} />
            </View>
            <View>
              <Text style={styles.userName}>{user?.name || 'مسؤول التفتيش'}</Text>
              <Text style={styles.userRole}>رقم الشارة: OFF-{user?.id || '2241'}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
             <MaterialCommunityIcons name="logout" size={20} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((s, index) => (
            <View key={index} style={styles.statCard}>
              <MaterialCommunityIcons name={s.icon} size={20} color={s.color} style={{marginBottom: 4}} />
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Main Actions */}
        <View style={styles.actionContainer}>
           <TouchableOpacity
            style={[styles.actionBtn, styles.primaryAction]}
            onPress={() => navigation.navigate('NfcScan')}
          >
            <MaterialCommunityIcons name="nfc" size={24} color={theme.colors.background} style={{marginLeft: 10}} />
            <Text style={styles.primaryActionText}>مسح بطاقة NFC</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <TextInput
              style={styles.searchInput}
              placeholder="بحث يدوي (الاسم، الجواز، NFC)..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textSecondary} style={{marginLeft: 10}} />
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>بحث</Text>
          </TouchableOpacity>
        </View>

        {/* Workers List Header */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>سجل العمليات الأخير</Text>
          <MaterialCommunityIcons name="history" size={16} color={theme.colors.textSecondary} style={{marginRight: 6}} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={workers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderWorkerItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>لا توجد سجلات مطابقة للمعايير</Text>}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  userInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  userRole: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    textAlign: 'right',
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: theme.colors.dangerSurface,
    borderRadius: 10,
  },
  statsGrid: {
    flexDirection: 'row-reverse',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  actionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionBtn: {
    height: 54,
    borderRadius: 12,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryAction: {
    backgroundColor: theme.colors.primary,
  },
  primaryActionText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: theme.colors.textPrimary,
    textAlign: 'right',
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 18,
    borderRadius: 10,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  searchButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  listHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  listTitle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  workerCard: {
    flexDirection: 'row-reverse',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  workerIconContainer: {
    marginRight: 0,
    marginLeft: 12,
  },
  workerMainInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  workerName: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  workerSub: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  workerStatusContainer: {
    width: 80,
    alignItems: 'center',
    marginLeft: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
});

export default DashboardScreen;
