import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../api/dashboardService';
import theme from '../theme';

const DashboardScreen = ({ navigation }) => {
  const { logout, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [summary, setSummary] = useState({
    counts: {
      todayInspections: 0,
      myViolations: 0,
      activeAlerts: 0
    },
    recentInspections: []
  });

  const fetchData = async () => {
    try {
      const data = await dashboardService.getSummary();
      setSummary(data);
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ في الاتصال', 'فشل في استرجاع بيانات لوحة التحكم');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const stats = [
    {
      label: "تفتيش اليوم",
      value: summary.counts.todayInspections?.toString() || "0",
      icon: "clipboard-list-outline",
      color: theme.colors.primary
    },
    {
      label: "مخالفات",
      value: summary.counts.myViolations?.toString() || "0",
      icon: "alert-octagon-outline",
      color: theme.colors.danger
    },
    {
      label: "تنبيهات نشطة",
      value: summary.counts.activeAlerts?.toString() || "0",
      icon: "bell-outline",
      color: theme.colors.warning
    },
  ];

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.container}
        bounces={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.connectionBadge}>
              <MaterialCommunityIcons name="wifi" size={12} color={theme.colors.success} />
              <Text style={styles.connectionText}>متصل</Text>
            </View>
            <TouchableOpacity style={styles.deviceButton}>
              <MaterialCommunityIcons name="cellphone" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerUserInfo}
              onPress={() => setProfileModalVisible(true)}
            >
              <Text style={styles.userName}>{user?.name || 'خالد الأحمدي'}</Text>
              <Text style={styles.badgeNumber}>رقم الشارة: OFF-{user?.id || '2241'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileAvatar}
              onPress={() => setProfileModalVisible(true)}
            >
              <Text style={styles.avatarText}>{user?.name ? user.name.substring(0, 1) : 'خ'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          {stats.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <MaterialCommunityIcons name={s.icon} size={20} color={s.color} style={styles.statIcon} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryAction]}
              onPress={() => navigation.navigate('NfcScan')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="credit-card-outline" size={24} color={theme.colors.background} />
              <Text style={[styles.actionLabel, { color: theme.colors.background }]}>مسح بطاقة NFC</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryAction]}
              onPress={() => navigation.navigate('NfcScan')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="magnify" size={24} color={theme.colors.textSecondary} />
              <Text style={[styles.actionLabel, { color: theme.colors.textSecondary }]}>بحث يدوي</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryAction]}
              onPress={() => navigation.navigate('InspectionRecords')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="clipboard-list-outline" size={24} color={theme.colors.textSecondary} />
              <Text style={[styles.actionLabel, { color: theme.colors.textSecondary }]}>سجلات التفتيش</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryAction]}
              onPress={() => navigation.navigate('Cases')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="scale-balance" size={24} color={theme.colors.textSecondary} />
              <Text style={[styles.actionLabel, { color: theme.colors.textSecondary }]}>القضايا المفتوحة</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Scans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>آخر عمليات التفتيش</Text>
          <View style={styles.scansList}>
            {summary.recentInspections && summary.recentInspections.length > 0 ? (
              summary.recentInspections.map((scan, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.scanItem}
                  onPress={() => navigation.navigate('WorkerDetails', { workerId: scan.Worker_ID })}
                >
                  <View style={styles.scanLeft}>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={20}
                      color={theme.colors.success}
                    />
                  </View>
                  <View style={styles.scanRight}>
                    <View style={styles.scanInfo}>
                      <Text style={styles.scanName}>{scan.Worker?.Full_Name || 'عامل غير معروف'}</Text>
                      <Text style={styles.scanTime}>{new Date(scan.Scan_Time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    <View style={styles.scanAvatar}>
                      <MaterialCommunityIcons name="account" size={16} color={theme.colors.textMuted} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>لا توجد عمليات تفتيش مؤخراً</Text>
            )}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={profileModalVisible}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>الملف الشخصي</Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.profileInfo}>
              <View style={[styles.profileAvatar, { width: 80, height: 80, borderRadius: 40 }]}>
                <Text style={[styles.avatarText, { fontSize: 24 }]}>{user?.name ? user.name.substring(0, 1) : 'خ'}</Text>
              </View>
              <Text style={[styles.userName, { fontSize: 20, marginTop: 16 }]}>{user?.name}</Text>
              <Text style={[styles.badgeNumber, { fontSize: 14, marginTop: 4 }]}>{user?.role === 'admin' ? 'مدير النظام' : 'ضابط جهاز متخصص'}</Text>
              <Text style={[styles.badgeNumber, { fontSize: 12, marginTop: 2 }]}>الجهة المنتسب لها: هيئة الرقابة الإدارية</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalActionBtn}>
                <MaterialCommunityIcons name="lock-reset" size={20} color={theme.colors.primary} />
                <Text style={styles.modalActionText}>تغيير كلمة المرور</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalActionBtn, { borderBottomWidth: 0 }]}
                onPress={() => {
                  setProfileModalVisible(false);
                  logout();
                }}
              >
                <MaterialCommunityIcons name="logout" size={20} color={theme.colors.danger} />
                <Text style={[styles.modalActionText, { color: theme.colors.danger }]}>تسجيل خروج</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Placeholder */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <MaterialCommunityIcons name="shield" size={20} color={theme.colors.primary} />
            <Text style={[styles.navText, { color: theme.colors.primary }]}>الرئيسية</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('InspectionRecords')}>
            <MaterialCommunityIcons name="clipboard-list" size={20} color={theme.colors.textDark} />
            <Text style={styles.navText}>السجلات</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('NfcScan')}
          >
            <MaterialCommunityIcons name="credit-card" size={20} color={theme.colors.textDark} />
            <Text style={styles.navText}>مسح</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Cases')}>
            <MaterialCommunityIcons name="scale-balance" size={20} color={theme.colors.textDark} />
            <Text style={styles.navText}>القضايا</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => setProfileModalVisible(true)}>
            <MaterialCommunityIcons name="account" size={20} color={theme.colors.textDark} />
            <Text style={styles.navText}>حسابي</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: theme.colors.successTransparent,
    borderWidth: 1,
    borderColor: theme.colors.borderTransparent,
  },
  connectionText: {
    fontSize: 9,
    color: theme.colors.success,
    fontWeight: '500',
  },
  deviceButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerUserInfo: {
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  badgeNumber: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.background,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 9,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'right',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    height: 96,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryAction: {
    backgroundColor: theme.colors.primary,
  },
  secondaryAction: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  scansList: {
    gap: 8,
  },
  scanItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
  },
  scanLeft: {
    justifyContent: 'center',
  },
  scanRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scanInfo: {
    alignItems: 'flex-end',
  },
  scanName: {
    fontSize: 14,
    color: theme.colors.textSlate100,
    fontWeight: '500',
  },
  scanTime: {
    fontSize: 10,
    color: theme.colors.textDark,
  },
  scanAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    fontSize: 12,
    marginTop: 10,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 32,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 12,
  },
  navText: {
    fontSize: 9,
    fontWeight: '500',
    color: theme.colors.textDark,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  modalActions: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalActionBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 12,
  },
  modalActionText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default DashboardScreen;
