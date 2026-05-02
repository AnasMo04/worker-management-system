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
import { useAuth } from '../context/AuthContext';
import theme from '../theme';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
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
              <MaterialCommunityIcons name="shield" size={40} color={theme.colors.background} />
            </View>
            <Text style={styles.logoTitle}>FLMS</Text>
            <Text style={styles.logoSubtitle}>Field Inspection App</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="account" size={16} color={theme.colors.textMuted} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="اسم المستخدم"
                placeholderTextColor={theme.colors.textDark}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="lock" size={16} color={theme.colors.textMuted} />
              </View>
              <TextInput
                style={[styles.input, { paddingLeft: 40 }]}
                placeholder="كلمة المرور"
                placeholderTextColor={theme.colors.textDark}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off" : "eye"}
                  size={16}
                  color={theme.colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
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
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="fingerprint" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.fingerprintButtonText}>الدخول بالبصمة</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Section */}
          <View style={styles.footer}>
            <MaterialCommunityIcons name="lock" size={12} color={theme.colors.textDark} />
            <Text style={styles.footerText}>وصول آمن – للمستخدمين المصرح لهم فقط</Text>
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
    padding: theme.spacing.xl,
    paddingTop: 56,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 48,
    marginBottom: theme.spacing.xxxl,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: theme.roundness.xl,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    letterSpacing: 1,
  },
  logoSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  formContainer: {
    flex: 1,
    gap: theme.spacing.lg,
  },
  inputWrapper: {
    position: 'relative',
    height: 48,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconContainer: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
  input: {
    flex: 1,
    paddingRight: 40,
    paddingLeft: 16,
    color: theme.colors.textPrimary,
    fontSize: 14,
    textAlign: 'right',
  },
  eyeButton: {
    position: 'absolute',
    left: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  loginButton: {
    height: 48,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.roundness.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  loginButtonText: {
    color: theme.colors.background,
    fontSize: 14,
    fontWeight: 'bold',
  },
  fingerprintButton: {
    height: 48,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  fingerprintButtonText: {
    color: theme.colors.textSlate300,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingBottom: theme.spacing.xxl,
  },
  footerText: {
    fontSize: 10,
    color: theme.colors.textDark,
  },
});

export default LoginScreen;
