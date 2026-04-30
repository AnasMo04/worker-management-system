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
import { useAuth } from '../context/AuthContext';
import theme from '../theme';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.innerContainer}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Text style={styles.logoIcon}>🛡️</Text>
            </View>
            <Text style={styles.logoTitle}>FLMS</Text>
            <Text style={styles.logoSubtitle}>تطبيق التفتيش الميداني</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="اسم المستخدم"
                placeholderTextColor={theme.colors.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
              <Text style={styles.inputIcon}>👤</Text>
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { paddingLeft: 45 }]}
                placeholder="كلمة المرور"
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Text style={styles.inputIcon}>🔒</Text>
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={{ fontSize: 16 }}>{showPassword ? '👁️' : '🕶️'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.background} />
              ) : (
                <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fingerprintButton}
              onPress={() => Alert.alert('معلومات', 'خاصية البصمة ستكون متاحة قريباً')}
            >
              <Text style={styles.fingerprintIcon}>🖐️</Text>
              <Text style={styles.fingerprintButtonText}>الدخول بالبصمة</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Section */}
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <Text style={styles.footerLockIcon}>🔒</Text>
              <Text style={styles.footerText}>وصول آمن – للمستخدمين المصرح لهم فقط</Text>
            </View>
          </View>
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
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 40,
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    letterSpacing: 1,
  },
  logoSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  formContainer: {
    width: '100%',
    gap: 16,
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingRight: 45,
    paddingLeft: 16,
    color: theme.colors.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    textAlign: 'right',
  },
  inputIcon: {
    position: 'absolute',
    right: 14,
    top: 15,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  eyeIcon: {
    position: 'absolute',
    left: 14,
    top: 15,
  },
  loginButton: {
    width: '100%',
    height: 52,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  loginButtonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  fingerprintButton: {
    width: '100%',
    height: 52,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    marginTop: 4,
    gap: 8,
  },
  fingerprintIcon: {
    fontSize: 20,
  },
  fingerprintButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerLockIcon: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    opacity: 0.5,
  },
  footerText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    opacity: 0.5,
  },
});

export default LoginScreen;
