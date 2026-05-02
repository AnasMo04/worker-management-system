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
  Alert,
  Modal,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import workerService from '../api/workerService';
import fieldLogService from '../api/fieldLogService';
import { BASE_URL } from '../api/apiClient';
import theme from '../theme';
import { toAsciiDigits, formatDate } from '../utils/format';

const WorkerDetailsScreen = ({ route, navigation }) => {
  const { workerId, workerData } = route.params;
  const [worker, setWorker] = useState(workerData || null);
  const [loading, setLoading] = useState(!workerData);
  const [docsExpanded, setDocsExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewingPassport, setViewingPassport] = useState(false);

  useEffect(() => {
    if (!workerData && workerId) {
      fetchWorkerDetails();
    }
  }, [workerId, workerData]);

  const fetchWorkerDetails = async () => {
    setLoading(true);
    try {
      const data = await workerService.getWorkerById(workerId);
      setWorker(data);
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'فشل في تحميل بيانات العامل');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (actionName) => {
    if (actionName === 'تسجيل تفتيش') {
       navigation.navigate('LogInspection', { worker });
       return;
    }
    Alert.alert('نظام التفتيش', `جاري تنفيذ ${actionName}...`);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!worker) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>لم يتم العثور على بيانات العامل</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
           <Text style={{color: theme.colors.textSecondary}}>عودة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getImageUrl = (path) => {
    if (!path) return null;
    return `${BASE_URL}/${path}`;
  };

  const isExpired = worker.Health_Cert_Expiry && new Date(worker.Health_Cert_Expiry) < new Date();

  const statusConfig = {
    'Active': { label: "نشط ونظامي", color: theme.colors.success, icon: 'check-circle' },
    'Expired': { label: "منتهي", color: theme.colors.danger, icon: 'alert-circle' },
    'Suspended': { label: "موقوف", color: theme.colors.warning, icon: 'pause-circle' },
    'Runaway': { label: "هارب", color: theme.colors.danger, icon: 'account-alert' },
  };

  const sc = statusConfig[worker.Current_Status] || statusConfig.Active;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />

      {/* Passport Image Viewer Modal */}
      <Modal
        visible={viewingPassport}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setViewingPassport(false)}
      >
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity
            style={styles.closeImageBtn}
            onPress={() => setViewingPassport(false)}
          >
            <MaterialCommunityIcons name="close-circle" size={40} color={theme.colors.textContrast} />
          </TouchableOpacity>
          <View style={styles.imageModalContent}>
            {worker.Passport_Copy ? (
              <Image
                source={{ uri: getImageUrl(worker.Passport_Copy) }}
                style={styles.largeImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={{color: theme.colors.textContrast, fontSize: 18}}>لا توجد صورة متوفرة في النظام</Text>
            )}
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-right" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>بيانات العامل</Text>
        <View style={{ width: 40 }}>
          {actionLoading && <ActivityIndicator size="small" color={theme.colors.primary} />}
        </View>
      </View>

      <ScrollView style={styles.container} bounces={false}>
        <View style={styles.innerContent}>
          {/* Worker ID Card Card */}
          <View style={styles.idCard}>
            <View style={styles.photoContainer}>
              <View style={styles.photoBox}>
                {worker.Personal_Photo_Copy ? (
                  <Image
                    source={{ uri: getImageUrl(worker.Personal_Photo_Copy) }}
                    style={styles.fullPhoto}
                  />
                ) : (
                  <MaterialCommunityIcons name="account" size={60} color={theme.colors.textMuted} />
                )}
              </View>
              <View style={[styles.statusBadge, { backgroundColor: sc.color }]}>
                 <MaterialCommunityIcons name={sc.icon} size={14} color={theme.colors.textContrast} />
                 <Text style={styles.statusText}>{sc.label}</Text>
              </View>
            </View>

            <View style={styles.idInfo}>
               <Text style={styles.workerName}>{worker.Full_Name}</Text>
               <View style={styles.verificationRow}>
                  <MaterialCommunityIcons name="shield-check" size={14} color={theme.colors.success} />
                  <Text style={styles.verificationText}>هوية رقمية معتمدة</Text>
               </View>
            </View>
          </View>

          {/* Info Sections */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
               <MaterialCommunityIcons name="information-outline" size={18} color={theme.colors.primary} />
               <Text style={styles.sectionTitle}>المعلومات الأساسية</Text>
            </View>

            <View style={styles.infoGrid}>
              <DetailRow label="رقم الجواز" value={toAsciiDigits(worker.Passport_Number)} icon="passport" />
              <DetailRow label="الجنسية" value={worker.Nationality} icon="earth" />
              <DetailRow label="جهة العمل" value={worker.Sponsor?.Sponsor_Name || (worker.Freelance ? 'عمل حر' : 'غير محدد')} icon="office-building" />
              <DetailRow label="تاريخ الإصدار" value={formatDate(worker.createdAt)} icon="calendar-check" />
              <DetailRow
                label="تاريخ الانتهاء"
                value={formatDate(worker.Health_Cert_Expiry)}
                isHighlighted={isExpired}
                icon="calendar-clock"
              />
            </View>
          </View>

          {/* Documents Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.expandableHeader}
              onPress={() => setDocsExpanded(!docsExpanded)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={docsExpanded ? "chevron-up" : "chevron-down"}
                size={24}
                color={theme.colors.textMuted}
              />
              <View style={styles.docsTitleRow}>
                 <Text style={styles.sectionTitle}>المستندات الثبوتية</Text>
                 <MaterialCommunityIcons name="file-document-multiple-outline" size={18} color={theme.colors.primary} />
              </View>
            </TouchableOpacity>

            {docsExpanded && (
              <View style={styles.docsList}>
                {worker.Passport_Copy && (
                  <DocItem
                    label="صورة جواز السفر"
                    type="صورة أصلية"
                    icon="credit-card-outline"
                    onShow={() => setViewingPassport(true)}
                  />
                )}
                {worker.Health_Cert_Copy && <DocItem label="الشهادة الصحية" type="APPLICATION/PDF" icon="heart-pulse" />}
                {worker.Residency_Copy && <DocItem label="صورة الإقامة" type="صورة" icon="card-account-details-outline" />}
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.primaryBtn]}
              onPress={() => handleAction('تسجيل تفتيش')}
            >
              <MaterialCommunityIcons name="clipboard-text-outline" size={24} color={theme.colors.textContrast} />
              <Text style={styles.primaryBtnText}>تسجيل تفتيش</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.dangerBtn]}
              onPress={() => handleAction('إبلاغ مخالفة')}
            >
              <MaterialCommunityIcons name="alert-circle-outline" size={24} color={theme.colors.danger} />
              <Text style={styles.dangerBtnText}>إبلاغ مخالفة</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailRow = ({ icon, label, value, isHighlighted }) => (
  <View style={styles.detailRow}>
    <Text style={[styles.detailValue, isHighlighted && { color: theme.colors.danger, fontWeight: 'bold' }]}>
      {value}
    </Text>
    <View style={styles.detailLabelGroup}>
      <Text style={styles.detailLabel}>{label}</Text>
      <MaterialCommunityIcons name={icon} size={18} color={theme.colors.textMuted} />
    </View>
  </View>
);

const DocItem = ({ label, type, icon, onShow }) => (
  <View style={styles.docItem}>
    <TouchableOpacity style={styles.docViewBtn} onPress={onShow}>
      <MaterialCommunityIcons name="eye-outline" size={18} color={theme.colors.primary} />
    </TouchableOpacity>
    <View style={styles.docInfo}>
      <Text style={styles.docLabelText}>{label}</Text>
      <Text style={styles.docTypeText}>{type}</Text>
    </View>
    <View style={styles.docIconBox}>
      <MaterialCommunityIcons name={icon} size={20} color={theme.colors.textSecondary} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
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
  container: {
    flex: 1,
  },
  innerContent: {
    padding: 20,
    paddingBottom: 40,
  },
  idCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  photoContainer: {
    alignItems: 'center',
    marginLeft: 0,
  },
  photoBox: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  fullPhoto: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: -12,
    elevation: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.textContrast,
  },
  idInfo: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  workerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    textAlign: 'right',
  },
  verificationRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  verificationText: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: '600',
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  infoGrid: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabelGroup: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  docsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  docsList: {
    marginTop: 24,
    gap: 12,
  },
  docItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  docIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  docInfo: {
    flex: 1,
    alignItems: 'flex-end',
    marginHorizontal: 16,
  },
  docLabelText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  docTypeText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  docViewBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionsGrid: {
    flexDirection: 'row-reverse',
    gap: 16,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    elevation: 4,
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.textContrast,
  },
  dangerBtn: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  dangerBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.danger,
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeImageBtn: {
    position: 'absolute',
    top: 60,
    right: 30,
    zIndex: 10,
    elevation: 10,
  },
  imageModalContent: {
    width: '90%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 16,
    marginBottom: 24,
  }
});

export default WorkerDetailsScreen;
