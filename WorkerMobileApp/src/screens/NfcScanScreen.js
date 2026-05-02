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
import theme from '../theme';
import workerService from '../api/workerService';

const NfcScanScreen = ({ navigation }) => {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleScanComplete = async (uid) => {
    try {
      const worker = await workerService.searchByNfcUid(uid);
      if (worker && worker.id) {
        navigation.replace('WorkerDetails', { workerData: worker });
      } else {
        Alert.alert('فشل التحقق', 'لم يتم العثور على سجل مطابق لهذه البطاقة في قاعدة البيانات المركزية');
        resetScan();
      }
    } catch (error) {
      Alert.alert('خطأ فني', error.message || 'حدث خطأ أثناء محاولة الوصول إلى سجلات النظام');
      resetScan();
    }
  };

  const resetScan = () => {
    setScanning(false);
    setProgress(0);
  };

  const startScan = () => {
    setScanning(true);
    setProgress(0);
  };

  useEffect(() => {
    if (!scanning) return;

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            Alert.alert(
              'نظام التحقق الميداني',
              'يرجى إدخال المعرف يدوياً أو اختيار هوية محاكاة للمتابعة',
              [
                {
                  text: 'إلغاء العملية',
                  onPress: () => resetScan(),
                  style: 'cancel'
                },
                {
                  text: 'تأكيد الهوية (محاكاة)',
                  onPress: () => handleScanComplete('123456789')
                }
              ]
            );
          }, 300);
          return 100;
        }
        return p + 4;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [scanning]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.innerContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-right" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>مسح بطاقة NFC</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Scan Area */}
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
                  name="credit-card-outline"
                  size={56}
                  color={theme.colors.border}
                />
              )}
            </View>
          </View>

          <Text style={styles.title}>
            {scanning ? "جاري القراءة..." : "ضع البطاقة على الجهاز"}
          </Text>
          <Text style={styles.subtitle}>
            {scanning
              ? "يرجى عدم تحريك البطاقة حتى اكتمال القراءة"
              : "تأكد من تفعيل NFC في إعدادات الجهاز"}
          </Text>

          {scanning && (
            <View style={styles.progressSection}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
          )}

          {/* NFC Status */}
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>NFC جاهز</Text>
          </View>

          {!scanning ? (
            <TouchableOpacity
              style={styles.startButton}
              onPress={startScan}
              activeOpacity={0.8}
            >
              <Text style={styles.startButtonText}>بدء المسح</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={resetScan}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Flashlight toggle */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.flashButton}>
            <MaterialCommunityIcons name="flashlight" size={16} color={theme.colors.textMuted} />
            <Text style={styles.flashText}>الإضاءة</Text>
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
  innerContainer: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
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
  scanArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  circleContainer: {
    position: 'relative',
    marginBottom: 32,
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRingOne: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: theme.colors.pulseTransparent,
  },
  mainCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  mainCircleInactive: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  mainCircleActive: {
    backgroundColor: theme.colors.primaryTransparent,
    borderColor: theme.colors.primary,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  progressSection: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 24,
  },
  progressTrack: {
    height: 6,
    backgroundColor: theme.colors.surface,
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  progressText: {
    fontSize: 10,
    color: theme.colors.textDark,
    textAlign: 'center',
    marginTop: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: theme.colors.successTransparent,
    borderWidth: 1,
    borderColor: theme.colors.borderTransparent,
    marginBottom: 32,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
  },
  statusText: {
    fontSize: 10,
    color: theme.colors.success,
    fontWeight: '500',
  },
  startButton: {
    width: '100%',
    height: 48,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    color: theme.colors.background,
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelButton: {
    width: '100%',
    height: 48,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  flashButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  flashText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
});

export default NfcScanScreen;
