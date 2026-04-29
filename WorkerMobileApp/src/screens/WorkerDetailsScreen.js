import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import workerService from '../api/workerService';
import { BASE_URL } from '../api/apiClient';
import { StatusBadge } from '../components/StatusBadge';
import { Theme } from '../theme';

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
        <ActivityIndicator size="large" color={Theme.colors.primary} />
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
      <StatusBar barStyle="dark-content" />
      <ScrollView>
        <View style={styles.profileHeader}>
          <View style={styles.photoContainer}>
            {worker.Personal_Photo_Copy ? (
              <Image
                source={{ uri: getImageUrl(worker.Personal_Photo_Copy) }}
                style={styles.personalPhoto}
              />
            ) : (
              <View style={[styles.personalPhoto, styles.placeholderPhoto]}>
                <Text style={styles.placeholderIcon}>👤</Text>
              </View>
            )}
          </View>
          <Text style={styles.fullName}>{worker.Full_Name}</Text>
          <StatusBadge variant={worker.Current_Status} style={styles.headerBadge} />
        </View>

        <View style={styles.infoSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>المعلومات الأساسية</Text>
          </View>

          <View style={styles.grid}>
            <InfoItem label="رقم الجواز" value={worker.Passport_Number} />
            <InfoItem label="الجنسية" value={worker.Nationality} />
            <InfoItem label="تاريخ الميلاد" value={worker.Birth_Date} />
            <InfoItem label="NFC UID" value={worker.NFC_UID || '—'} />
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>بيانات العمل</Text>
          </View>

          <View style={styles.grid}>
            <InfoItem label="الفئة" value={worker.Category} />
            <InfoItem label="جهة العمل" value={worker.Sponsor?.Sponsor_Name || (worker.Freelance ? 'عمل حر' : 'غير محدد')} />
            <InfoItem
              label="انتهاء الشهادة الصحية"
              value={worker.Health_Cert_Expiry}
              isExpiry
              expired={new Date(worker.Health_Cert_Expiry) < new Date()}
            />
          </View>
        </View>

        <View style={styles.footerInfo}>
          <Text style={styles.footerTitle}>نظام إدارة العمالة الأجانب</Text>
          <Text style={styles.footerText}>بيانات موثقة من وزارة العمل</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoItem = ({ label, value, isExpiry, expired }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[
      styles.infoValue,
      isExpiry && expired ? styles.expiredText : {}
    ]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
  },
  profileHeader: {
    backgroundColor: '#fff',
    padding: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: Theme.colors.background,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  personalPhoto: {
    width: '100%',
    height: '100%',
  },
  placeholderPhoto: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.muted,
  },
  placeholderIcon: {
    fontSize: 40,
  },
  fullName: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.colors.foreground,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerBadge: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  infoSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitleRow: {
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Theme.colors.primary,
    textAlign: 'right',
  },
  grid: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
  },
  infoItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border + '50',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 13,
    color: Theme.colors.mutedForeground,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.foreground,
  },
  expiredText: {
    color: Theme.colors.destructive,
  },
  footerInfo: {
    marginTop: 32,
    marginBottom: 40,
    alignItems: 'center',
  },
  footerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  footerText: {
    fontSize: 10,
    color: '#cbd5e1',
    marginTop: 4,
  },
});

export default WorkerDetailsScreen;
