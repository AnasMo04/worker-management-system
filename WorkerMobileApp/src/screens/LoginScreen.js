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
  SafeAreaView,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import { Theme } from '../theme';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('خطأ', 'يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
    } catch (error) {
      Alert.alert('فشل تسجيل الدخول', error.message || 'حدث خطأ ما');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={Theme.gradients.login}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.flex}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.flex}
          >
            <View style={styles.innerContainer}>
              <View style={styles.branding}>
                <LinearGradient
                  colors={['#38d4c8', '#38948a']}
                  style={styles.logoSquare}
                >
                  <Icon name="shield-check" size={40} color={Theme.dark.background} />
                </LinearGradient>
                <Text style={styles.title}>منظومة إدارة العمالة الوافدة</Text>
                <Text style={styles.subtitle}>النظام الوطني الموحد لمتابعة شؤون العمالة</Text>
              </View>

              <View style={styles.formCard}>
                <View style={styles.formHeader}>
                  <Text style={styles.loginTitle}>تسجيل الدخول</Text>
                  <Text style={styles.loginSubtitle}>أدخل بيانات الاعتماد للوصول إلى المنظومة</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>اسم المستخدم</Text>
                  <View style={styles.inputWrapper}>
                    <Icon name="account-outline" size={20} color={Theme.colors.mutedForeground} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="اسم المستخدم"
                      placeholderTextColor="#475569"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>كلمة المرور</Text>
                  <View style={styles.inputWrapper}>
                    <Icon name="lock-outline" size={20} color={Theme.colors.mutedForeground} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="كلمة المرور"
                      placeholderTextColor="#475569"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPass}
                    />
                    <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeIcon}>
                      <Icon name={showPass ? "eye-off-outline" : "eye-outline"} size={20} color={Theme.colors.mutedForeground} />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#38d4c8', '#38948a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color={Theme.dark.background} />
                    ) : (
                      <Text style={styles.buttonText}>تسجيل الدخول</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.line} />
                  <Text style={styles.orText}>أو</Text>
                  <View style={styles.line} />
                </View>

                <TouchableOpacity style={styles.biometricButton}>
                  <Icon name="fingerprint" size={24} color={Theme.colors.mutedForeground} style={{ marginLeft: 10 }} />
                  <Text style={styles.biometricText}>الدخول بالبصمة</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>© 2026 وزارة العمل والتأهيل - ليبيا</Text>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  branding: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoSquare: {
    width: 72,
    height: 72,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...Theme.shadows.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#151a21e6', // Translucent card
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#1e293b',
    ...Theme.shadows.lg,
  },
  formHeader: {
    marginBottom: 28,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'right',
  },
  loginSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'right',
    marginTop: 6,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 8,
    textAlign: 'right',
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#0c1117',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#fff',
    textAlign: 'right',
    fontSize: 14,
    paddingRight: 8,
  },
  inputIcon: {
    opacity: 0.5,
  },
  eyeIcon: {
    paddingHorizontal: 8,
  },
  button: {
    height: 52,
    borderRadius: 14,
    marginTop: 12,
    overflow: 'hidden',
    ...Theme.shadows.md,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#0c1117',
    fontSize: 16,
    fontWeight: '800',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#1e293b',
  },
  orText: {
    marginHorizontal: 12,
    color: '#475569',
    fontSize: 12,
  },
  biometricButton: {
    height: 52,
    backgroundColor: '#151a21',
    borderRadius: 14,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  biometricText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#475569',
  },
});

export default LoginScreen;
