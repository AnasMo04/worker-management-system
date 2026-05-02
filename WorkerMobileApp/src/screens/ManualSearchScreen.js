import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import theme from '../theme';
import workerService from '../api/workerService';

const ManualSearchScreen = ({ navigation }) => {
  const [uid, setUid] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    const sanitizedUid = uid.trim();
    if (!sanitizedUid) {
      Alert.alert('تنبيه', 'يرجى إدخال معرف البطاقة للمتابعة');
      return;
    }

    setLoading(true);
    try {
      const worker = await workerService.searchByNfcUid(sanitizedUid);
      if (worker && worker.id) {
        navigation.replace('WorkerDetails', { workerData: worker });
      } else {
        Alert.alert('فشل البحث', 'لم يتم العثور على سجل مطابق لهذا المعرف');
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء محاولة الاتصال بالنظام');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-right" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>بحث يدوي</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="card-search-outline" size={80} color={theme.colors.primary} />
          </View>

          <Text style={styles.title}>إدخال معرف البطاقة</Text>
          <Text style={styles.subtitle}>قم بكتابة أو لصق المعرف الرقمي للبطاقة الذكية (UID) لإجراء عملية التحقق</Text>

          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="identifier" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="مثال: 123456789"
              placeholderTextColor={theme.colors.textMuted}
              value={uid}
              onChangeText={setUid}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
            />
          </View>

          <TouchableOpacity
            style={[styles.searchButton, loading && { opacity: 0.7 }]}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.textContrast} />
            ) : (
              <>
                <MaterialCommunityIcons name="magnify" size={24} color={theme.colors.textContrast} />
                <Text style={styles.searchButtonText}>بدء عملية البحث</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    paddingTop: 60,
  },
  iconContainer: {
    marginBottom: 32,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  inputWrapper: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    width: '100%',
    height: 56,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    marginBottom: 24,
    elevation: 2,
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 16,
    textAlign: 'right',
  },
  searchButton: {
    width: '100%',
    height: 56,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    elevation: 6,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  searchButtonText: {
    color: theme.colors.textContrast,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ManualSearchScreen;
