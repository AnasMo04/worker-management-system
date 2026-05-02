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
      Alert.alert('خطأ فني', 'حدث خطأ أثناء محاولة الوصول إلى سجلات النظام');
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
              'يرجى تقريب البطاقة من الجهاز أو اختيار محاكاة للمتابعة',
              [
                {
                  text: 'إلغاء',
                  onPress: () => resetScan(),
                  style: 'cancel'
                },
                {
                  text: 'تأكيد (محاكاة)',
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
            {scanning ? "جاري قراءة البيانات..." : "ضع البطاقة على الجهاز"}
          </Text>
          <Text style={styles.subtitle}>
            {scanning
              ? "يرجى الحفاظ على ثبات البطاقة حتى اكتمال القراءة"
              : "تأكد من تفعيل NFC في إعدادات الجهاز ثم قرب البطاقة من خلف الهاتف"}
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
            <Text style={styles.statusText}>المستشعر جاهز</Text>
          </View>

          {!scanning ? (
            <TouchableOpacity
              style={styles.startButton}
              onPress={startScan}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="broadcast" size={24} color={theme.colors.textContrast} style={{marginLeft: 12}} />
              <Text style={styles.startButtonText}>بدء عملية المسح</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={resetScan}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>إلغاء العملية</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Help section */}
        <View style={styles.footer}>
           <TouchableOpacity style={styles.helpButton}>
              <MaterialCommunityIcons name="help-circle-outline" size={18} color={theme.colors.textSecondary} />
              <Text style={styles.helpText}>كيفية مسح البطاقة؟</Text>
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
  progressSection: {
    width: '100%',
    marginBottom: 32,
  },
  progressTrack: {
    height: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
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
  },
});

export default NfcScanScreen;
