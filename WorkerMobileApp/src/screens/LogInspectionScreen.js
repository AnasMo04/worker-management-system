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
  const [dropdownOpen, setDocsDropdownOpen] = useState(false);

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
        Alert.alert('تنبيه', 'يجب السماح بالوصول للموقع لتسجيل الإحداثيات');
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
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-right" size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تسجيل تفتيش ميداني</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.workerBrief}>
           <Text style={styles.workerName}>{worker.Full_Name}</Text>
           <Text style={styles.workerPassport}>{worker.Passport_Number}</Text>
        </View>

        <View style={styles.form}>
           <Text style={styles.label}>نتيجة التفتيش</Text>
           <View style={styles.dropdownContainer}>
              {results.map((res) => (
                <TouchableOpacity
                  key={res}
                  style={[styles.resultOption, result === res && styles.resultOptionActive]}
                  onPress={() => setResult(res)}
                >
                  <Text style={[styles.resultText, result === res && styles.resultTextActive]}>{res}</Text>
                </TouchableOpacity>
              ))}
           </View>

           <Text style={styles.label}>ملاحظات إضافية</Text>
           <TextInput
             style={styles.textArea}
             placeholder="أدخل ملاحظات التفتيش هنا..."
             placeholderTextColor={theme.colors.textDark}
             multiline
             numberOfLines={4}
             value={notes}
             onChangeText={setNotes}
           />

           <View style={styles.locationBrief}>
              <MaterialCommunityIcons
                name={location ? "map-marker-check" : "map-marker-alert"}
                size={20}
                color={location ? theme.colors.success : theme.colors.warning}
              />
              <Text style={styles.locationText}>
                {location ? `إحداثيات الموقع الملتقطة: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'جاري جلب إحداثيات الموقع...'}
              </Text>
           </View>

           <TouchableOpacity
            style={[styles.submitBtn, loading && {opacity: 0.7}]}
            onPress={handleSubmit}
            disabled={loading}
           >
             {loading ? <ActivityIndicator color={theme.colors.background} /> : <Text style={styles.submitBtnText}>إرسال تقرير</Text>}
           </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
  container: {
    flex: 1,
  },
  workerBrief: {
    padding: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  workerName: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  workerPassport: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  form: {
    padding: 20,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'right',
  },
  dropdownContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  resultOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  resultOptionActive: {
    backgroundColor: theme.colors.primaryTransparent,
    borderColor: theme.colors.primary,
  },
  resultText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  resultTextActive: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  textArea: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    color: theme.colors.textPrimary,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  locationBrief: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  locationText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    flex: 1,
    textAlign: 'right',
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LogInspectionScreen;
