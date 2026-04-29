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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.innerContainer}>
          <View style={styles.branding}>
            <View style={styles.logoSquare}>
              <Text style={styles.logoIcon}>🛡️</Text>
            </View>
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
              <TextInput
                style={styles.input}
                placeholder="أدخل اسم المستخدم"
                placeholderTextColor={Theme.colors.mutedForeground}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>كلمة المرور</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="أدخل كلمة المرور"
                  placeholderTextColor={Theme.colors.mutedForeground}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeIcon}>
                  <Text style={{fontSize: 18}}>{showPass ? '👁️' : '🕶️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Theme.dark.card} />
              ) : (
                <Text style={styles.buttonText}>تسجيل الدخول</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.orText}>أو</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity style={styles.biometricButton}>
              <Text style={styles.biometricIcon}>☝️</Text>
              <Text style={styles.biometricText}>الدخول بالبصمة</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2026 وزارة العمل والتأهيل - ليبيا</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.dark.background,
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
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Theme.dark.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Theme.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: Theme.colors.mutedForeground,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: Theme.dark.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  formHeader: {
    marginBottom: 24,
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'right',
  },
  loginSubtitle: {
    fontSize: 12,
    color: Theme.colors.mutedForeground,
    textAlign: 'right',
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: Theme.colors.mutedForeground,
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    height: 48,
    backgroundColor: '#0c1117',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#fff',
    textAlign: 'right',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  passwordContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#0c1117',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    color: '#fff',
    textAlign: 'right',
  },
  eyeIcon: {
    paddingHorizontal: 12,
  },
  button: {
    height: 48,
    backgroundColor: Theme.dark.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Theme.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: Theme.dark.card,
    fontSize: 15,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#1e293b',
  },
  orText: {
    marginHorizontal: 10,
    color: '#475569',
    fontSize: 11,
  },
  biometricButton: {
    height: 48,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  biometricIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
  biometricText: {
    color: Theme.colors.mutedForeground,
    fontSize: 14,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#334155',
  },
});

export default LoginScreen;
