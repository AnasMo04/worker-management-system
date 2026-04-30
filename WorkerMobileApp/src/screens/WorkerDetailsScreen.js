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
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!worker) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="account-search-outline" size={64} color={theme.colors.textSecondary} style={{marginBottom: 16}} />
        <Text style={{ color: theme.colors.textPrimary, marginBottom: 20 }}>لم يتم العثور على بيانات العامل المطلوب</Text>
        <TouchableOpacity
          style={styles.backBtnAction}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>العودة للرئيسية</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getImageUrl = (path) => {
    if (!path) return null;
    return `${BASE_URL}/${path}`;
  };

  const statusMap = {
    'Active': { label: 'نشط ونظامي', color: theme.colors.success, icon: 'check-decagram' },
    'Expired': { label: 'منتهي الصلاحية', color: theme.colors.danger, icon: 'clock-alert-outline' },
    'Suspended': { label: 'موقوف مؤقتاً', color: theme.colors.warning, icon: 'pause-circle-outline' },
    'Runaway': { label: 'بلاغ هروب نشط', color: theme.colors.danger, icon: 'account-alert-outline' },
  };

  const currentStatus = statusMap[worker.Current_Status] || { label: worker.Current_Status, color: theme.colors.textSecondary, icon: 'help-circle-outline' };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerAction}>
           <MaterialCommunityIcons name="chevron-right" size={28} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>سجل بيانات العامل الرقمي</Text>
        <View style={styles.headerAction} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Worker Identity Section */}
        <View style={styles.idCard}>
          <View style={styles.photoContainer}>
            {worker.Personal_Photo_Copy ? (
              <Image
                source={{ uri: getImageUrl(worker.Personal_Photo_Copy) }}
                style={styles.personalPhoto}
              />
            ) : (
              <View style={[styles.personalPhoto, styles.placeholderPhoto]}>
                 <MaterialCommunityIcons name="account" size={60} color={theme.colors.borderStrong} />
              </View>
            )}
          </View>
          <Text style={styles.fullName}>{worker.Full_Name}</Text>

          <View style={[styles.statusBadge, {
            backgroundColor: `${currentStatus.color}15`,
            borderColor: `${currentStatus.color}40`
          }]}>
            <MaterialCommunityIcons name={currentStatus.icon} size={16} color={currentStatus.color} style={{marginLeft: 6}} />
            <Text style={[styles.statusText, { color: currentStatus.color }]}>
              {currentStatus.label}
            </Text>
          </View>

          <View style={styles.verificationBadge}>
            <MaterialCommunityIcons name="shield-check" size={14} color={theme.colors.primary} style={{marginLeft: 6}} />
            <Text style={styles.verificationText}>هوية موثقة رقمياً ومشفرة</Text>
          </View>
        </View>

        {/* Details Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المعلومات الثبوتية</Text>
          <View style={styles.infoGrid}>
            <DetailItem label="رقم الجواز" value={worker.Passport_Number} icon="passport" />
            <DetailItem label="الجنسية" value={worker.Nationality} icon="earth" />
            <DetailItem label="تاريخ الميلاد" value={worker.Birth_Date} icon="calendar-account" />
            <DetailItem label="معرف البطاقة (NFC)" value={worker.NFC_UID || 'غير مخصص'} icon="nfc" />
            <DetailItem label="فئة العمالة" value={worker.Category} icon="tag-outline" />
            <DetailItem label="جهة العمل المسجلة" value={worker.Sponsor?.Sponsor_Name || (worker.Freelance ? 'عمل حر' : 'غير محدد')} icon="office-building" />
            <DetailItem
              label="صلاحية الشهادة الصحية"
              value={worker.Health_Cert_Expiry}
              highlight={new Date(worker.Health_Cert_Expiry) < new Date()}
              highlightColor={theme.colors.danger}
              icon="medical-bag"
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
            <View style={{flexDirection: 'row-reverse', alignItems: 'center', gap: 8}}>
               <MaterialCommunityIcons name="file-document-multiple-outline" size={20} color={theme.colors.primary} />
               <Text style={styles.expandableTitle}>الوثائق والمستندات المرفقة</Text>
            </View>
            <MaterialCommunityIcons name={docsExpanded ? "chevron-up" : "chevron-down"} size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {docsExpanded && (
            <View style={styles.docsList}>
               <DocItem label="صورة جواز السفر الأصلية" type="IMAGE/JPEG" icon="card-account-details-outline" />
               <DocItem label="شهادة الكفاءة الصحية" type="APPLICATION/PDF" icon="heart-pulse" />
               <DocItem label="عقد العمل الموثق" type="IMAGE/PNG" icon="file-certificate-outline" />
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsGrid}>
           <TouchableOpacity style={styles.actionBtn}>
             <MaterialCommunityIcons name="history" size={20} color={theme.colors.textPrimary} style={{marginLeft: 8}} />
             <Text style={styles.actionBtnText}>سجل التفتيش</Text>
           </TouchableOpacity>
           <TouchableOpacity style={[styles.actionBtn, { borderColor: theme.colors.danger }]}>
             <MaterialCommunityIcons name="alert-circle-outline" size={20} color={theme.colors.danger} style={{marginLeft: 8}} />
             <Text style={[styles.actionBtnText, { color: theme.colors.danger }]}>تسجيل مخالفة</Text>
           </TouchableOpacity>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailItem = ({ label, value, highlight, highlightColor, icon }) => (
  <View style={styles.detailItem}>
    <View style={{flexDirection: 'row-reverse', alignItems: 'center', gap: 10}}>
       <MaterialCommunityIcons name={icon} size={18} color={theme.colors.textSecondary} />
       <Text style={styles.detailLabel}>{label}</Text>
    </View>
    <Text style={[
      styles.detailValue,
      highlight ? { color: highlightColor, fontWeight: 'bold' } : {}
    ]}>
      {value}
    </Text>
  </View>
);

const DocItem = ({ label, type, icon }) => (
  <View style={styles.docItem}>
    <View style={styles.docInfo}>
      <View style={styles.docIconPlaceholder}>
         <MaterialCommunityIcons name={icon} size={20} color={theme.colors.primary} />
      </View>
      <View>
        <Text style={styles.docLabel}>{label}</Text>
        <Text style={styles.docType}>{type}</Text>
      </View>
    </View>
    <TouchableOpacity style={styles.viewDocBtn}>
       <Text style={styles.viewDocBtnText}>معاينة</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerAction: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  idCard: {
    backgroundColor: theme.colors.surface,
    margin: 20,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  photoContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personalPhoto: {
    width: '100%',
    height: '100%',
  },
  fullName: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  verificationBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verificationText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 12,
    paddingRight: 4,
  },
  infoGrid: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  detailItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  expandableHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  expandableTitle: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  docsList: {
    marginTop: 10,
    gap: 10,
  },
  docItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  docInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  docIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  docLabel: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  docType: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    textAlign: 'right',
    marginTop: 2,
  },
  viewDocBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  viewDocBtnText: {
    color: theme.colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  actionsGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row-reverse',
    gap: 12,
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  actionBtnText: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  backBtnAction: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backBtnText: {
    color: theme.colors.background,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default WorkerDetailsScreen;
