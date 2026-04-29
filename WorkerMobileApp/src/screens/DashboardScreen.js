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
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import workerService from '../api/workerService';

const DashboardScreen = ({ navigation }) => {
  const { logout, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);

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
    >
      <View style={styles.workerInfo}>
        <Text style={styles.workerName}>{item.Full_Name}</Text>
        <Text style={styles.workerSub}>جواز: {item.Passport_Number}</Text>
        {item.Sponsor && (
          <Text style={styles.workerSub}>الكفيل: {item.Sponsor.Sponsor_Name}</Text>
        )}
      </View>
      <View style={[styles.statusBadge, { backgroundColor: item.Current_Status === 'Active' ? '#4CAF50' : '#F44336' }]}>
        <Text style={styles.statusText}>{item.Current_Status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>مرحباً، {user?.name}</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>خروج</Text>
        </TouchableOpacity>
      </View>

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

      <TouchableOpacity
        style={styles.nfcButton}
        onPress={() => {
          // Simulation of NFC Scan using the search query as UID
          if (searchQuery) {
            handleNfcScan(searchQuery);
          } else {
            Alert.alert('تنبيه', 'يرجى إدخال NFC UID في مربع البحث لمحاكاة المسح');
          }
        }}
      >
        <Text style={styles.nfcButtonText}>مسح بطاقة NFC</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={workers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderWorkerItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>لا يوجد عمال مطابقين للبحث</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    elevation: 2,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutText: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    padding: 15,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  nfcButton: {
    backgroundColor: '#34C759',
    margin: 15,
    marginTop: 0,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  nfcButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 15,
  },
  workerCard: {
    flexDirection: 'row-reverse',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
  },
  workerInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  workerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  workerSub: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999',
  },
});

export default DashboardScreen;
