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
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
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
              <View style={styles.onlineDot} />
              <Text style={styles.connectionText}>متصل</Text>
            </View>
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
              <MaterialCommunityIcons name={s.icon} size={24} color={s.color} style={styles.statIcon} />
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
              activeOpacity={0.8}
            >
              <View style={styles.actionIconCircle}>
                 <MaterialCommunityIcons name="nfc" size={28} color={theme.colors.textContrast} />
              </View>
              <Text style={styles.actionLabelPrimary}>مسح بطاقة NFC</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButtonSecondary}
              onPress={() => navigation.navigate('ManualSearch')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="magnify" size={24} color={theme.colors.primary} />
              <Text style={styles.actionLabelSecondary}>بحث يدوي</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButtonSecondary}
              onPress={() => navigation.navigate('InspectionRecords')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="history" size={24} color={theme.colors.primary} />
              <Text style={styles.actionLabelSecondary}>سجلات التفتيش</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButtonSecondary}
              onPress={() => navigation.navigate('Cases')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="scale-balance" size={24} color={theme.colors.primary} />
              <Text style={styles.actionLabelSecondary}>القضايا المفتوحة</Text>
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
                  activeOpacity={0.6}
                >
                  <View style={styles.scanLeft}>
                    <MaterialCommunityIcons
                      name="chevron-left"
                      size={20}
                      color={theme.colors.textMuted}
                    />
                  </View>
                  <View style={styles.scanRight}>
                    <View style={styles.scanInfo}>
                      <Text style={styles.scanName}>{scan.Worker?.Full_Name || 'عامل غير معروف'}</Text>
                      <View style={styles.scanTimeRow}>
                        <MaterialCommunityIcons name="clock-outline" size={12} color={theme.colors.textMuted} />
                        <Text style={styles.scanTime}>{new Date(scan.Scan_Time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</Text>
                      </View>
                    </View>
                    <View style={styles.scanAvatar}>
                      <MaterialCommunityIcons name="account-outline" size={20} color={theme.colors.primary} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                 <Text style={styles.emptyText}>لا توجد عمليات تفتيش مؤخراً</Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 120 }} />
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
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setProfileModalVisible(false)} style={styles.closeModalBtn}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>الملف الشخصي</Text>
              <View style={{ width: 40 }} />
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.largeAvatar}>
                <Text style={styles.largeAvatarText}>{user?.name ? user.name.substring(0, 1) : 'خ'}</Text>
              </View>
              <Text style={styles.profileName}>{user?.name}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user?.role === 'admin' ? 'مدير النظام' : 'ضابط جهاز متخصص'}</Text>
              </View>
              <Text style={styles.agencyText}>هيئة الرقابة الإدارية - فرع طرابلس</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalActionBtn}>
                <MaterialCommunityIcons name="shield-lock-outline" size={22} color={theme.colors.primary} />
                <Text style={styles.modalActionText}>تغيير كلمة المرور</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalActionBtn, { borderBottomWidth: 0 }]}
                onPress={() => {
                  setProfileModalVisible(false);
                  logout();
                }}
              >
                <MaterialCommunityIcons name="logout-variant" size={22} color={theme.colors.danger} />
                <Text style={[styles.modalActionText, { color: theme.colors.danger }]}>تسجيل خروج من النظام</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <MaterialCommunityIcons name="home-variant" size={26} color={theme.colors.primary} />
            <Text style={[styles.navText, { color: theme.colors.primary }]}>الرئيسية</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('InspectionRecords')}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={26} color={theme.colors.textMuted} />
            <Text style={styles.navText}>السجلات</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItemMain}
            onPress={() => navigation.navigate('NfcScan')}
          >
            <View style={styles.mainNavCircle}>
               <MaterialCommunityIcons name="nfc" size={28} color={theme.colors.textContrast} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Cases')}>
            <MaterialCommunityIcons name="scale-balance" size={26} color={theme.colors.textMuted} />
            <Text style={styles.navText}>القضايا</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => setProfileModalVisible(true)}>
            <MaterialCommunityIcons name="account-outline" size={26} color={theme.colors.textMuted} />
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
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
    elevation: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: theme.colors.successTransparent,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
  },
  connectionText: {
    fontSize: 10,
    color: theme.colors.success,
    fontWeight: 'bold',
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
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  badgeNumber: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  profileAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textContrast,
  },
  statsContainer: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'right',
  },
  actionsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '100%',
    height: 80,
    borderRadius: 16,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    elevation: 6,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  primaryAction: {
    backgroundColor: theme.colors.primary,
    marginBottom: 4,
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabelPrimary: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textContrast,
  },
  actionButtonSecondary: {
    width: '31%',
    height: 90,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 8,
  },
  actionLabelSecondary: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
  scansList: {
    gap: 12,
  },
  scanItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    fontSize: 15,
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
  },
  scanTimeRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  scanTime: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  scanAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryTransparent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  bottomNav: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    height: 70,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    paddingHorizontal: 10,
  },
  navItem: {
    alignItems: 'center',
    width: 60,
  },
  navItemMain: {
    alignItems: 'center',
    width: 60,
    marginTop: -30,
  },
  mainNavCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  navText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    elevation: 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.borderStrong,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  closeModalBtn: {
    padding: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    elevation: 2,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  largeAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  largeAvatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.textContrast,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginTop: 16,
  },
  roleBadge: {
    backgroundColor: theme.colors.primaryTransparent,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  roleText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  agencyText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginTop: 12,
  },
  modalActions: {
    gap: 12,
  },
  modalActionBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 18,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    gap: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalActionText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;
