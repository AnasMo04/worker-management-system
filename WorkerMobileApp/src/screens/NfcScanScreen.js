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
        Alert.alert('فشل التحقق', 'لم يتم العثور على سجل مطابق لهذه البطاقة في قاعدة البيانات المركزية');
        setScanning(false);
        setProgress(0);
      }
    } catch (error) {
      Alert.alert('خطأ فني', 'حدث خطأ أثناء محاولة الوصول إلى سجلات النظام المشفرة');
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
        return p + 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [scanning]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
           <MaterialCommunityIcons name="close" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>التحقق الميداني (NFC)</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.scanTargetContainer}>
          <View style={[styles.scanCircle, scanning && styles.scanCircleActive]}>
            {scanning ? (
              <MaterialCommunityIcons name="broadcast" size={80} color={theme.colors.primary} />
            ) : (
               <MaterialCommunityIcons name="nfc" size={80} color={theme.colors.textSecondary} style={{opacity: 0.3}} />
            )}
          </View>

          {scanning && (
             <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
             </View>
          )}
        </View>

        <View style={styles.instructionContainer}>
          <Text style={styles.title}>
            {scanning ? 'جاري قراءة البيانات الرقمية...' : 'جاهز للمسح الميداني'}
          </Text>
          <Text style={styles.subtitle}>
            {scanning
              ? 'يرجى الحفاظ على استقرار البطاقة خلف الجهاز لإتمام عملية القراءة'
              : 'قم بتقريب بطاقة العامل من منطقة مستشعر NFC خلف الهاتف لبدء المطابقة الرقمية'}
          </Text>
        </View>

        <View style={styles.statusIndicator}>
           <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.success} />
           <Text style={styles.statusText}>نظام الاستشعار نشط ومؤمن</Text>
        </View>

        {!scanning && (
          <TouchableOpacity style={styles.startBtn} onPress={startScan} activeOpacity={0.8}>
            <MaterialCommunityIcons name="radar" size={20} color={theme.colors.background} style={{marginLeft: 10}} />
            <Text style={styles.startBtnText}>بدء عملية التحقق</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
         <MaterialCommunityIcons name="shield-lock-outline" size={14} color={theme.colors.textSecondary} style={{opacity: 0.4, marginBottom: 4}} />
         <Text style={styles.footerText}>نظام التفتيش الموحد - FLMS v2.0</Text>
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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  backBtn: {
    padding: 5,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  scanTargetContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  scanCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanCircleActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(52, 211, 153, 0.05)',
  },
  progressContainer: {
    width: 200,
    height: 4,
    backgroundColor: theme.colors.surface,
    borderRadius: 2,
    marginTop: 30,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  instructionContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  statusIndicator: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: theme.colors.successSurface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: 40,
  },
  statusText: {
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: '600',
  },
  startBtn: {
    width: '100%',
    height: 54,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startBtnText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    opacity: 0.5,
  },
});

export default NfcScanScreen;
