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
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import workerService from '../api/workerService';
import fieldLogService from '../api/fieldLogService';
import { BASE_URL } from '../api/apiClient';
import theme from '../theme';

const WorkerDetailsScreen = ({ route, navigation }) => {
  const { workerId, workerData } = route.params;
  const [worker, setWorker] = useState(workerData || null);
  const [loading, setLoading] = useState(!workerData);
  const [docsExpanded, setDocsExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleLogInspection = async () => {
    if (!worker) return;

    setActionLoading(true);
    try {
      await fieldLogService.logInspection({
        Worker_ID: worker.id,
        Result: 'Verified',
        Note: 'تم التحقق من البيانات ميدانياً عبر تطبيق الهاتف'
      });
      Alert.alert('نجاح', 'تم تسجيل عملية التفتيش بنجاح');
    } catch (error) {
      Alert.alert('فشل', 'حدث خطأ أثناء تسجيل التفتيش');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = (actionName) => {
    if (actionName === 'تسجيل تفتيش') {
       handleLogInspection();
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
    'Active': { label: "نشط", color: theme.colors.success },
    'Expired': { label: "منتهي", color: theme.colors.danger },
    'Suspended': { label: "موقوف", color: theme.colors.warning },
    'Runaway': { label: "هارب", color: theme.colors.danger },
  };

  const sc = statusConfig[worker.Current_Status] || statusConfig.Active;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-right" size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>نتيجة التحقق</Text>
        <View style={{ width: 36 }}>
          {actionLoading && <ActivityIndicator size="small" color={theme.colors.primary} />}
        </View>
      </View>

      <ScrollView style={styles.container} bounces={false}>
        <View style={styles.innerContent}>
          {/* Worker Photo & Status */}
          <View style={styles.photoSection}>
            <View style={styles.photoBox}>
              {worker.Personal_Photo_Copy ? (
                <Image
                  source={{ uri: getImageUrl(worker.Personal_Photo_Copy) }}
                  style={styles.fullPhoto}
                />
              ) : (
                <MaterialCommunityIcons name="account" size={40} color={theme.colors.textDark} />
              )}
            </View>
            <Text style={styles.workerName}>{worker.Full_Name}</Text>
            <View style={[
              styles.statusBadge,
              { borderColor: sc.color, backgroundColor: `${sc.color}1F` } // Approx 0.12 opacity
            ]}>
              <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
            </View>
          </View>

          {/* Verification indicator */}
          <View style={styles.verificationCard}>
            <MaterialCommunityIcons name="shield-check" size={16} color={theme.colors.success} />
            <Text style={styles.verificationText}>التشفير تم التحقق منه</Text>
          </View>

          {/* Info Grid */}
          <View style={styles.infoGrid}>
            <DetailRow icon="credit-card-outline" label="رقم الجواز" value={worker.Passport_Number} />
            <DetailRow icon="earth" label="الجنسية" value={worker.Nationality} />
            <DetailRow icon="briefcase-outline" label="الكفيل" value={worker.Sponsor?.Sponsor_Name || (worker.Freelance ? 'عمل حر' : 'غير محدد')} />
            <DetailRow icon="calendar" label="تاريخ التسجيل" value={new Date(worker.createdAt).toLocaleDateString('ar-SA')} />
            <DetailRow
              icon="calendar"
              label="صلاحية الشهادة"
              value={worker.Health_Cert_Expiry}
              isHighlighted={isExpired}
            />
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
                  color={theme.colors.textMuted}
                />
              </View>
              <View style={styles.docsHeaderRight}>
                <MaterialCommunityIcons name="file-document-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.docsTitle}>المستندات المرفقة</Text>
                <View style={styles.docsCountBadge}>
                  <Text style={styles.docsCountText}>
                    {[worker.Passport_Copy, worker.Health_Cert_Copy, worker.Residency_Copy, worker.Personal_Photo_Copy].filter(Boolean).length}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {docsExpanded && (
              <View style={styles.docsList}>
                {worker.Passport_Copy && <DocItem label="صورة جواز السفر" type="صورة" icon="credit-card-outline" />}
                {worker.Health_Cert_Copy && <DocItem label="الشهادة الصحية" type="PDF" icon="file-document-outline" />}
                {worker.Residency_Copy && <DocItem label="صورة الإقامة" type="صورة" icon="file-document-outline" />}
                {worker.Personal_Photo_Copy && <DocItem label="صورة شخصية" type="صورة" icon="image-outline" />}
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.primaryBtn, actionLoading && {opacity: 0.7}]}
              onPress={() => handleAction('تسجيل تفتيش')}
              disabled={actionLoading}
            >
              <MaterialCommunityIcons name="clipboard-text-outline" size={20} color={theme.colors.background} />
              <Text style={styles.primaryBtnText}>تسجيل تفتيش</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.dangerBtn]} onPress={() => handleAction('إبلاغ مخالفة')}>
              <MaterialCommunityIcons name="alert-triangle-outline" size={20} color={theme.colors.danger} />
              <Text style={styles.dangerBtnText}>إبلاغ مخالفة</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.secondaryBtn]} onPress={() => handleAction('عرض القضايا')}>
              <MaterialCommunityIcons name="scale-balance" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.secondaryBtnText}>القضايا</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.secondaryBtn]} onPress={() => handleAction('عرض المستندات')}>
              <MaterialCommunityIcons name="file-document-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.secondaryBtnText}>المستندات</Text>
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
      <MaterialCommunityIcons name={icon} size={16} color={theme.colors.textDark} />
    </View>
  </View>
);

const DocItem = ({ label, type, icon }) => (
  <View style={styles.docItem}>
    <TouchableOpacity style={styles.docViewBtn}>
      <MaterialCommunityIcons name="eye-outline" size={14} color={theme.colors.textMuted} />
    </TouchableOpacity>
    <View style={styles.docInfo}>
      <Text style={styles.docLabelText}>{label}</Text>
      <Text style={styles.docTypeText}>{type} • مرفق</Text>
    </View>
    <View style={styles.docIconBox}>
      <MaterialCommunityIcons name={icon} size={16} color={theme.colors.primary} />
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
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
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
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  fullPhoto: {
    width: '100%',
    height: '100%',
  },
  workerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
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
    backgroundColor: theme.colors.successTransparent,
    borderWidth: 1,
    borderColor: theme.colors.borderTransparent,
    borderRadius: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  verificationText: {
    fontSize: 11,
    color: theme.colors.success,
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
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    color: theme.colors.textMuted,
  },
  detailValue: {
    fontSize: 12,
    color: theme.colors.textSlate200,
    fontWeight: '500',
  },
  docsSection: {
    marginBottom: 24,
  },
  docsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    color: theme.colors.textSlate100,
  },
  docsCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: theme.colors.primaryTransparent,
  },
  docsCountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  docsList: {
    marginTop: 8,
    gap: 8,
  },
  docItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.slateTransparent,
    borderWidth: 1,
    borderColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
  },
  docIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.primaryTransparent,
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
    color: theme.colors.textSlate200,
  },
  docTypeText: {
    fontSize: 9,
    color: theme.colors.textMuted,
  },
  docViewBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
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
    backgroundColor: theme.colors.primary,
  },
  primaryBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.background,
  },
  dangerBtn: {
    backgroundColor: theme.colors.dangerTransparent,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  dangerBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.danger,
  },
  secondaryBtn: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  errorText: {
    color: theme.colors.danger,
    marginBottom: 20,
  }
});

export default WorkerDetailsScreen;
