import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import theme from '../theme';
import workerService from '../api/workerService';

const NfcScanScreen = ({ navigation }) => {
  const [scanning, setScanning] = useState(false);
  const [hasNfc, setHasNfc] = useState(null);

  useEffect(() => {
    const initNfc = async () => {
      try {
        // Critical: Start the manager first as per hardware detection requirements
        await NfcManager.start();

        // Then check if supported/enabled
        const supported = await NfcManager.isSupported();
        setHasNfc(supported);

      } catch (err) {
        console.warn('NFC initialization failed:', err);
        setHasNfc(false);
      }
    };

    initNfc();

    return () => {
      // Cleanup: release hardware resources when leaving screen
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  const resetScanState = () => {
    setScanning(false);
    // Explicitly stop any pending tech requests to prevent hanging
    NfcManager.cancelTechnologyRequest().catch(() => {});
  };

  const startScan = async () => {
    if (hasNfc === false) {
      Alert.alert('تنبيه', 'تقنية NFC غير متوفرة أو معطلة على هذا الجهاز');
      return;
    }

    setScanning(true);

    try {
      // Request NfcA technology specifically. This focuses on hardware UID reading
      // and bypasses the Android system's default unformatted/empty tag interceptor.
      await NfcManager.requestTechnology([NfcTech.NfcA]);

      const tag = await NfcManager.getTag();

      // Robust null check for the tag and its ID property to prevent crashes
      if (!tag || !tag.id) {
        throw new Error('TAG_NOT_FOUND');
      }

      console.log('NFC UID detected:', tag.id);

      // Call API using extracted hardware UID
      const worker = await workerService.searchByNfcUid(tag.id);

      if (worker && worker.id) {
        // Success: Navigate to details
        navigation.replace('WorkerDetails', { workerData: worker });
      } else {
        // ID valid but not in our database
        Alert.alert('سجل غير موجود', `معرف البطاقة (${tag.id}) غير مرتبطة بأي فرد في المنظومة.`);
        resetScanState();
      }

    } catch (ex) {
      // Safe error handling for null/undefined exceptions
      const errorStr = ex?.message || ex?.toString() || '';
      console.warn('NFC Scan Process Error:', errorStr);

      if (errorStr.includes('User cancelled') || errorStr.includes('cancelled')) {
        // Silent handle for user cancellation
        console.log('NFC Scan cancelled by user');
      } else {
        Alert.alert(
          'خطأ في المسح',
          'تعذر قراءة هوية البطاقة الرقمية. يرجى التأكد من تفعيل المستشعر وتقريب البطاقة من خلف الجهاز.'
        );
      }
      resetScanState();
    } finally {
      // Absolute final fallback to ensure hardware is released
      resetScanState();
    }
  };

  if (hasNfc === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 20, color: theme.colors.textSecondary }}>جاري تهيئة نظام التحقق...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-right" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>مسح بطاقة NFC</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.scanArea}>
          <View style={styles.circleContainer}>
            {scanning && (
              <View style={styles.pulseRingOne} />
            )}
            <View style={[
              styles.mainCircle,
              scanning ? styles.mainCircleActive : styles.mainCircleInactive
            ]}>
              {scanning ? (
                <ActivityIndicator size="large" color={theme.colors.primary} />
              ) : (
                <MaterialCommunityIcons
                  name="nfc"
                  size={70}
                  color={theme.colors.primary}
                />
              )}
            </View>
          </View>

          <Text style={styles.title}>
            {scanning ? "جاري المطابقة..." : "ضع البطاقة خلف الجهاز"}
          </Text>
          <Text style={styles.subtitle}>
            {scanning
              ? "يرجى الحفاظ على استقرار البطاقة لإتمام القراءة"
              : "تأكد من تفعيل خاصية NFC في الإعدادات لبدء التحقق الميداني"}
          </Text>

          {/* NFC Status Indicator */}
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: hasNfc ? theme.colors.success : theme.colors.danger }]} />
            <Text style={[styles.statusText, { color: hasNfc ? theme.colors.success : theme.colors.danger }]}>
               {hasNfc ? "نظام المسح جاهز" : "المستشعر غير متوفر"}
            </Text>
          </View>

          {!scanning ? (
            <TouchableOpacity
              style={styles.startButton}
              onPress={startScan}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="broadcast" size={24} color={theme.colors.textContrast} style={{marginLeft: 12}} />
              <Text style={styles.startButtonText}>بدء عملية التحقق</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={resetScanState}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>إلغاء العملية</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Informational help */}
        <View style={styles.footer}>
           <TouchableOpacity style={styles.helpButton}>
              <MaterialCommunityIcons name="information-outline" size={18} color={theme.colors.textSecondary} />
              <Text style={styles.helpText}>مكان وضع البطاقة قد يختلف حسب نوع الجهاز</Text>
           </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },
  scanArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContainer: {
    position: 'relative',
    marginBottom: 40,
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRingOne: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 4,
    borderColor: theme.colors.primaryTransparent,
  },
  mainCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    elevation: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  mainCircleActive: {
    backgroundColor: theme.colors.primaryTransparent,
    borderColor: theme.colors.primary,
  },
  mainCircleInactive: {},
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  statusBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: theme.colors.successTransparent,
    borderWidth: 1,
    borderColor: theme.colors.success,
    marginBottom: 40,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.success,
  },
  statusText: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: 'bold',
  },
  startButton: {
    width: '100%',
    height: 60,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startButtonText: {
    color: theme.colors.textContrast,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    width: '100%',
    height: 60,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  cancelButtonText: {
    color: theme.colors.danger,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  helpButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  helpText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default NfcScanScreen;
