import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import workerService from '../api/workerService';
import theme from '../theme';

const DashboardScreen = ({ navigation }) => {
  const { logout, user } = useAuth();
  const [loading, setLoading] = useState(false);

  const stats = [
    { label: "تفتيش اليوم", value: "12", icon: "clipboard-text-outline", color: "#34D399" },
    { label: "مخالفات", value: "3", icon: "alert-triangle-outline", color: "#EF4444" },
    { label: "تنبيهات نشطة", value: "5", icon: "bell-outline", color: "#FBBF24" },
  ];

  const actions = [
    { label: "مسح بطاقة NFC", icon: "credit-card-outline", screen: "NfcScan", primary: true },
    { label: "بحث يدوي", icon: "magnify", screen: "NfcScan", primary: false },
    { label: "سجلات التفتيش", icon: "clipboard-list-outline", screen: "Dashboard", primary: false },
    { label: "القضايا المفتوحة", icon: "scale-balance", screen: "Dashboard", primary: false },
  ];

  const recentScans = [
    { name: "محمد أحمد", time: "10:30 ص", status: "valid" },
    { name: "عبدالله سالم", time: "09:45 ص", status: "violation" },
    { name: "رحمن كريم", time: "09:15 ص", status: "valid" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} bounces={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.connectionBadge}>
              <MaterialCommunityIcons name="wifi" size={12} color={theme.colors.success} />
              <Text style={styles.connectionText}>متصل</Text>
            </View>
            <TouchableOpacity style={styles.deviceButton}>
              <MaterialCommunityIcons name="cellphone" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.headerUserInfo}>
              <Text style={styles.userName}>{user?.name || 'خالد الأحمدي'}</Text>
              <Text style={styles.badgeNumber}>رقم الشارة: OFF-2241</Text>
            </View>
            <TouchableOpacity
              style={styles.profileAvatar}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <Text style={styles.avatarText}>خ.أ</Text>
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
            {actions.map((a, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.actionButton,
                  a.primary ? styles.primaryAction : styles.secondaryAction
                ]}
                onPress={() => navigation.navigate(a.screen)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={a.icon}
                  size={24}
                  color={a.primary ? '#0F172A' : '#CBD5E1'}
                />
                <Text style={[
                  styles.actionLabel,
                  { color: a.primary ? '#0F172A' : '#CBD5E1' }
                ]}>
                  {a.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Scans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>آخر عمليات المسح</Text>
          <View style={styles.scansList}>
            {recentScans.map((scan, i) => (
              <View key={i} style={styles.scanItem}>
                <View style={styles.scanLeft}>
                  <MaterialCommunityIcons
                    name={scan.status === 'valid' ? 'check-circle' : 'alert-circle'}
                    size={20}
                    color={scan.status === 'valid' ? '#10B981' : '#EF4444'}
                  />
                </View>
                <View style={styles.scanRight}>
                  <View style={styles.scanInfo}>
                    <Text style={styles.scanName}>{scan.name}</Text>
                    <Text style={styles.scanTime}>{scan.time}</Text>
                  </View>
                  <View style={styles.scanAvatar}>
                    <MaterialCommunityIcons name="account" size={16} color="#64748B" />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Navigation Placeholder */}
        <View style={styles.bottomNavContainer}>
          <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem}>
              <MaterialCommunityIcons name="shield" size={20} color="#34D399" />
              <Text style={[styles.navText, { color: '#34D399' }]}>الرئيسية</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <MaterialCommunityIcons name="clipboard-list" size={20} color="#475569" />
              <Text style={styles.navText}>السجلات</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate('NfcScan')}
            >
              <MaterialCommunityIcons name="credit-card" size={20} color="#475569" />
              <Text style={styles.navText}>مسح</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <MaterialCommunityIcons name="scale-balance" size={20} color="#475569" />
              <Text style={styles.navText}>القضايا</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <MaterialCommunityIcons name="account" size={20} color="#475569" />
              <Text style={styles.navText}>حسابي</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    paddingTop: 40,
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
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  connectionText: {
    fontSize: 9,
    color: '#10B981',
    fontWeight: '500',
  },
  deviceButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1E293B',
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
    color: '#F8FAFC',
  },
  badgeNumber: {
    fontSize: 10,
    color: '#64748B',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#34D399',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
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
    color: '#F8FAFC',
  },
  statLabel: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#64748B',
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
    backgroundColor: '#34D399',
  },
  secondaryAction: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  scansList: {
    gap: 8,
  },
  scanItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
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
    color: '#F1F5F9',
    fontWeight: '500',
  },
  scanTime: {
    fontSize: 10,
    color: '#475569',
  },
  scanAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2D3748',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNavContainer: {
    paddingHorizontal: 12,
    paddingBottom: 32,
    paddingTop: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    paddingVertical: 8,
  },
  navItem: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 12,
  },
  navText: {
    fontSize: 9,
    fontWeight: '500',
    color: '#475569',
  },
});

export default DashboardScreen;
