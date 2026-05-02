import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import fieldLogService from '../api/fieldLogService';
import theme from '../theme';

const InspectionRecordsScreen = ({ navigation }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await fieldLogService.getMyLogs();
      setLogs(data);
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'فشل في تحميل سجلات التفتيش');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.logCard}>
      <View style={styles.logHeader}>
        <Text style={styles.logResult}>{item.Result}</Text>
        <Text style={styles.logDate}>{new Date(item.Scan_Time).toLocaleString('ar-SA')}</Text>
      </View>
      <Text style={styles.workerName}>{item.Worker?.Full_Name}</Text>
      <Text style={styles.passportNumber}>{item.Worker?.Passport_Number}</Text>
      {item.Note && <Text style={styles.note}>{item.Note}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-right" size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>سجلات التفتيش</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={logs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>لا توجد سجلات تفتيش حالياً</Text>}
        />
      )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
  },
  logCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  logResult: {
    color: theme.colors.success,
    fontWeight: 'bold',
    fontSize: 12,
  },
  logDate: {
    color: theme.colors.textMuted,
    fontSize: 10,
  },
  workerName: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  passportNumber: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  note: {
    color: theme.colors.textMuted,
    fontSize: 11,
    textAlign: 'right',
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyText: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default InspectionRecordsScreen;
