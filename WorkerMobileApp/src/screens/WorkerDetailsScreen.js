import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import workerService from '../api/workerService';
import { BASE_URL } from '../api/apiClient';
import theme from '../theme';

const WorkerDetailsScreen = ({ route, navigation }) => {
  const { workerId } = route.params;
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [docsExpanded, setDocsExpanded] = useState(false);

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
        <ActivityIndicator size="large" color="#34D399" />
      </View>
    );
  }

  if (!worker) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>لم يتم العثور على بيانات العامل</Text>
      </View>
    );
  }

  const getImageUrl = (path) => {
    if (!path) return null;
    return `${BASE_URL}/${path}`;
  };

  const statusConfig = {
    'Active': { label: "نشط", color: "hsl(152,60%,40%)" },
    'Expired': { label: "منتهي", color: "hsl(38,92%,50%)" },
    'Suspended': { label: "موقوف", color: "hsl(38,85%,55%)" },
    'Runaway': { label: "هارب", color: "hsl(0,72%,51%)" },
  };

  const sc = statusConfig[worker.Current_Status] || statusConfig.Active;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-right" size={16} color="#94A3B8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>نتيجة التحقق</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.container} bounces={false}>
        <View style={styles.innerContent}>
          {/* Worker Photo & Status */}
          <View style={styles.photoSection}>
            <View style={styles.photoBox}>
              <MaterialCommunityIcons name="account" size={40} color="#475569" />
            </View>
            <Text style={styles.workerName}>{worker.Full_Name}</Text>
            <View style={[
              styles.statusBadge,
              { borderColor: sc.color, backgroundColor: sc.color.replace('hsl', 'hsla').replace(')', ', 0.12)') }
            ]}>
              <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
            </View>
          </View>

          {/* Verification indicator */}
          <View style={styles.verificationCard}>
            <MaterialCommunityIcons name="shield-check" size={16} color="#10B981" />
            <Text style={styles.verificationText}>التشفير تم التحقق منه</Text>
          </View>

          {/* Info Grid */}
          <View style={styles.infoGrid}>
            <DetailRow icon="credit-card-outline" label="رقم الجواز" value={worker.Passport_Number} />
            <DetailRow icon="earth" label="الجنسية" value={worker.Nationality} />
            <DetailRow icon="briefcase-outline" label="الكفيل" value={worker.Sponsor?.Sponsor_Name || 'غير محدد'} />
            <DetailRow icon="calendar" label="تاريخ الإصدار" value={worker.createdAt?.split('T')[0] || '2025-01-15'} />
            <DetailRow icon="calendar" label="تاريخ الانتهاء" value={worker.Health_Cert_Expiry} />
          </View>

          {/* Documents Section */}
          <View style={styles.docsSection}>
            <TouchableOpacity
              style={styles.docsHeader}
              onPress={() => setDocsExpanded(!docsExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.docsHeaderLeft}>
                <MaterialCommunityIcons
                  name={docsExpanded ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#64748B"
                />
              </View>
              <View style={styles.docsHeaderRight}>
                <MaterialCommunityIcons name="file-document-outline" size={16} color="#34D399" />
                <Text style={styles.docsTitle}>المستندات المرفقة</Text>
                <View style={styles.docsCountBadge}>
                  <Text style={styles.docsCountText}>4</Text>
                </View>
              </View>
            </TouchableOpacity>

            {docsExpanded && (
              <View style={styles.docsList}>
                <DocItem label="صورة جواز السفر" type="صورة" icon="credit-card-outline" />
                <DocItem label="الشهادة الصحية" type="PDF" icon="file-document-outline" />
                <DocItem label="صورة الإقامة" type="صورة" icon="file-document-outline" />
                <DocItem label="صورة شخصية" type="صورة" icon="image-outline" />
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={20} color="#0F172A" />
              <Text style={styles.primaryBtnText}>تسجيل تفتيش</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.dangerBtn]}>
              <MaterialCommunityIcons name="alert-triangle-outline" size={20} color="#EF4444" />
              <Text style={styles.dangerBtnText}>إبلاغ مخالفة</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.secondaryBtn]}>
              <MaterialCommunityIcons name="scale-balance" size={20} color="#94A3B8" />
              <Text style={styles.secondaryBtnText}>القضايا</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.secondaryBtn]}>
              <MaterialCommunityIcons name="file-document-outline" size={20} color="#94A3B8" />
              <Text style={styles.secondaryBtnText}>المستندات</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailValue}>{value}</Text>
    <View style={styles.detailLabelGroup}>
      <Text style={styles.detailLabel}>{label}</Text>
      <MaterialCommunityIcons name={icon} size={16} color="#475569" />
    </View>
  </View>
);

const DocItem = ({ label, type, icon }) => (
  <View style={styles.docItem}>
    <TouchableOpacity style={styles.docViewBtn}>
      <MaterialCommunityIcons name="eye-outline" size={14} color="#64748B" />
    </TouchableOpacity>
    <View style={styles.docInfo}>
      <Text style={styles.docLabelText}>{label}</Text>
      <Text style={styles.docTypeText}>{type} • مرفق</Text>
    </View>
    <View style={styles.docIconBox}>
      <MaterialCommunityIcons name={icon} size={16} color="#34D399" />
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  centered: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  innerContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  photoSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  photoBox: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  workerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  statusBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  verificationCard: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  verificationText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '500',
  },
  infoGrid: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 12,
  },
  detailLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  docsSection: {
    marginBottom: 24,
  },
  docsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 12,
  },
  docsHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  docsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  docsCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
  },
  docsCountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#34D399',
  },
  docsList: {
    marginTop: 8,
    gap: 8,
  },
  docItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
  },
  docIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docInfo: {
    flex: 1,
    alignItems: 'flex-end',
    marginHorizontal: 12,
  },
  docLabelText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#E2E8F0',
  },
  docTypeText: {
    fontSize: 9,
    color: '#64748B',
  },
  docViewBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionBtn: {
    width: '48%',
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  primaryBtn: {
    backgroundColor: '#34D399',
  },
  primaryBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  dangerBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  dangerBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  secondaryBtn: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  errorText: {
    color: '#EF4444',
  }
});

export default WorkerDetailsScreen;
