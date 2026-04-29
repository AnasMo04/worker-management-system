import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import workerService from '../api/workerService';
import { BASE_URL } from '../api/apiClient';
import { StatusBadge } from '../components/StatusBadge';

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
        <ActivityIndicator size="large" color="#1e40af" />
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
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.photoContainer}>
            {worker.Personal_Photo_Copy ? (
              <Image
                source={{ uri: getImageUrl(worker.Personal_Photo_Copy) }}
                style={styles.personalPhoto}
              />
            ) : (
              <View style={[styles.personalPhoto, styles.placeholderPhoto]}>
                <Text style={styles.placeholderText}>لا توجد صورة</Text>
              </View>
            )}
          </View>
          <Text style={styles.fullName}>{worker.Full_Name}</Text>
          <StatusBadge variant={worker.Current_Status} style={styles.statusBadge} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>
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
    </SafeAreaView>
  );
};

const DetailItem = ({ label, value, isExpiry, expired }) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[
      styles.detailValue,
      isExpiry && expired ? styles.expiredValue : {}
    ]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  photoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#f1f5f9',
    elevation: 4,
  },
  personalPhoto: {
    width: '100%',
    height: '100%',
  },
  placeholderPhoto: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
    alignItems: 'flex-end',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  detailsContainer: {
    padding: 16,
  },
  detailItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  expiredValue: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
});

export default WorkerDetailsScreen;
