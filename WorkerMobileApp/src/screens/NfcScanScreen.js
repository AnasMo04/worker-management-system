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
        navigation.replace('WorkerDetails', { workerId: worker.id });
      } else {
        Alert.alert('فشل التحقق', 'لم يتم العثور على سجل مطابق لهذه البطاقة في قاعدة البيانات');
        setScanning(false);
        setProgress(0);
      }
    } catch (error) {
      Alert.alert('خطأ فني', 'حدث خطأ أثناء محاولة الوصول إلى سجلات النظام');
      setScanning(false);
      setProgress(0);
    }
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
              'محاكاة التحقق الرقمي',
              'يرجى إدخال المعرف يدوياً للمتابعة (أغراض العرض التقني)',
              [
                {
                  text: 'إلغاء العملية',
                  onPress: () => { setScanning(false); setProgress(0); },
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
            <MaterialCommunityIcons name="arrow-right" size={16} color="#94A3B8" />
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
              <MaterialCommunityIcons
                name={scanning ? "wifi" : "credit-card-outline"}
                size={56}
                color={scanning ? "#34D399" : "#334155"}
              />
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
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Flashlight toggle */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.flashButton}>
            <MaterialCommunityIcons name="flashlight" size={16} color="#64748B" />
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
    backgroundColor: '#0F172A',
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
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F8FAFC',
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
    borderColor: 'rgba(52, 211, 153, 0.2)',
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
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  mainCircleActive: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderColor: '#34D399',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
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
    backgroundColor: '#1E293B',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#34D399',
  },
  progressText: {
    fontSize: 10,
    color: '#475569',
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
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    marginBottom: 32,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '500',
  },
  startButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#34D399',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#EF4444',
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
    backgroundColor: '#1E293B',
  },
  flashText: {
    fontSize: 12,
    color: '#64748B',
  },
});

export default NfcScanScreen;
