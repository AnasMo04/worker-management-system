import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import workerService from '../api/workerService';
import { BASE_URL } from '../api/apiClient';

const WorkerDetailsScreen = ({ route }) => {
  const { workerId } = route.params;
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkerDetails();
  }, [workerId]);

  const fetchWorkerDetails = async () => {
    setLoading(true);
    try {
      const data = await workerService.getWorkerById(workerId);
      setWorker(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!worker) {
    return (
      <View style={styles.centered}>
        <Text>لم يتم العثور على بيانات العامل</Text>
      </View>
    );
  }

  const getImageUrl = (path) => {
    if (!path) return null;
    return `${BASE_URL}/${path}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.photoContainer}>
          {worker.Personal_Photo_Copy ? (
            <Image
              source={{ uri: getImageUrl(worker.Personal_Photo_Copy) }}
              style={styles.personalPhoto}
            />
          ) : (
            <View style={[styles.personalPhoto, styles.placeholderPhoto]}>
              <Text>لا توجد صورة</Text>
            </View>
          )}
        </View>
        <Text style={styles.fullName}>{worker.Full_Name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: worker.Current_Status === 'Active' ? '#4CAF50' : '#F44336' }]}>
          <Text style={styles.statusText}>{worker.Current_Status === 'Active' ? 'نشط' : 'غير نشط'}</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <DetailItem label="رقم الجواز" value={worker.Passport_Number} />
        <DetailItem label="الجنسية" value={worker.Nationality} />
        <DetailItem label="تاريخ الميلاد" value={worker.Birth_Date} />
        <DetailItem label="NFC UID" value={worker.NFC_UID || 'غير متوفر'} />
        <DetailItem label="الفئة" value={worker.Category} />
        <DetailItem label="جهة العمل (الكفيل)" value={worker.Sponsor?.Sponsor_Name || (worker.Freelance ? 'عمل حر' : 'غير محدد')} />
        <DetailItem
          label="انتهاء الشهادة الصحية"
          value={worker.Health_Cert_Expiry}
          isExpiry
          expired={new Date(worker.Health_Cert_Expiry) < new Date()}
        />
      </View>
    </ScrollView>
  );
};

const DetailItem = ({ label, value, isExpiry, expired }) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[
      styles.detailValue,
      isExpiry && expired ? { color: '#F44336', fontWeight: 'bold' } : {}
    ]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 3,
    backgroundColor: '#fff',
  },
  personalPhoto: {
    width: '100%',
    height: '100%',
  },
  placeholderPhoto: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  fullName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: 20,
  },
  detailItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    elevation: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default WorkerDetailsScreen;
