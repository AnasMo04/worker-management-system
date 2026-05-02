import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from 'react-native-geolocation-service';
import fieldLogService from '../api/fieldLogService';
import theme from '../theme';

const LogInspectionScreen = ({ route, navigation }) => {
  const { worker } = route.params;
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('صالح');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState(null);

  const results = ['صالح', 'مخالفة', 'منتهي', 'موقوف', 'غير معروف'];

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization('whenInUse');
      getCurrentLocation();
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getCurrentLocation();
      } else {
        Alert.alert('تنبيه', 'يجب السماح بالوصول للموقع لتسجيل الإحداثيات الميدانية');
      }
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation(position.coords);
      },
      (error) => {
        console.error(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await fieldLogService.logInspection({
        Worker_ID: worker.id,
        Result: result,
        Note: notes,
        GPS_Lat: location?.latitude,
        GPS_Lon: location?.longitude,
        Location_Text: location ? `Lat: ${location.latitude}, Lon: ${location.longitude}` : 'Location unavailable'
      });
      Alert.alert('نجاح', 'تم إرسال تقرير التفتيش بنجاح', [
        { text: 'موافق', onPress: () => navigation.navigate('Dashboard') }
      ]);
    } catch (error) {
      Alert.alert('فشل', 'حدث خطأ أثناء إرسال التقرير');
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
        <Text style={styles.headerTitle}>تقرير تفتيش ميداني</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} bounces={false}>
        <View style={styles.workerIdentity}>
           <View style={styles.avatarMini}>
              <MaterialCommunityIcons name="account-search" size={30} color={theme.colors.primary} />
           </View>
           <View style={styles.workerInfoRow}>
              <Text style={styles.workerName}>{worker.Full_Name}</Text>
              <Text style={styles.workerPassport}>{worker.Passport_Number}</Text>
           </View>
        </View>

        <View style={styles.formContainer}>
           <Text style={styles.label}>حالة المطابقة / النتيجة</Text>
           <View style={styles.resultGrid}>
              {results.map((res) => (
                <TouchableOpacity
                  key={res}
                  style={[styles.resultCard, result === res && styles.resultCardActive]}
                  onPress={() => setResult(res)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={result === res ? "check-circle" : "circle-outline"}
                    size={16}
                    color={result === res ? theme.colors.primary : theme.colors.textMuted}
                  />
                  <Text style={[styles.resultLabel, result === res && styles.resultLabelActive]}>{res}</Text>
                </TouchableOpacity>
              ))}
           </View>

           <Text style={styles.label}>ملاحظات الضابط الميدانية</Text>
           <TextInput
             style={styles.inputArea}
             placeholder="يرجى كتابة أي ملاحظات إضافية عن حالة العامل أو الموقع..."
             placeholderTextColor={theme.colors.textMuted}
             multiline
             numberOfLines={5}
             value={notes}
             onChangeText={setNotes}
             textAlignVertical="top"
           />

           <View style={styles.locationBox}>
              <View style={[styles.locIndicator, { backgroundColor: location ? theme.colors.success : theme.colors.warning }]}>
                 <MaterialCommunityIcons name={location ? "map-marker-check" : "map-marker-radius"} size={18} color={theme.colors.textContrast} />
              </View>
              <View style={styles.locInfo}>
                 <Text style={styles.locTitle}>{location ? 'الإحداثيات الجغرافية الملتقطة' : 'جاري تحديد الموقع...'}</Text>
                 <Text style={styles.locCoords}>{location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : 'يتم الآن الاتصال بالأقمار الصناعية...'}</Text>
              </View>
           </View>

           <TouchableOpacity
            style={[styles.submitButton, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
           >
             {loading ? <ActivityIndicator color={theme.colors.textContrast} /> : <Text style={styles.submitButtonText}>إرسال التقرير الموثق</Text>}
           </TouchableOpacity>
        </View>
        <View style={{height: 40}} />
      </ScrollView>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  container: {
    flex: 1,
  },
  workerIdentity: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 24,
    backgroundColor: theme.colors.surface,
    marginBottom: 16,
    elevation: 2,
    gap: 16,
  },
  avatarMini: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primaryTransparent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workerInfoRow: {
    alignItems: 'flex-end',
  },
  workerName: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  workerPassport: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  formContainer: {
    padding: 20,
  },
  label: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'right',
  },
  resultGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 32,
  },
  resultCard: {
    width: '31%',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 1,
    gap: 8,
  },
  resultCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryTransparent,
  },
  resultLabel: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  resultLabelActive: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  inputArea: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    color: theme.colors.textPrimary,
    fontSize: 14,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 140,
    marginBottom: 32,
    elevation: 1,
  },
  locationBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 40,
    elevation: 2,
    gap: 16,
  },
  locIndicator: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  locInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  locTitle: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  locCoords: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonText: {
    color: theme.colors.textContrast,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LogInspectionScreen;
