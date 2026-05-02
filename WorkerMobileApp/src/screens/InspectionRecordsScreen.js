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
import { formatDate, formatTime } from '../utils/format';

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
        <View style={styles.resultBadge}>
           <Text style={styles.logResult}>{item.Result}</Text>
        </View>
        <Text style={styles.logDate}>{formatDate(item.Scan_Time)} {formatTime(item.Scan_Time)}</Text>
      </View>
      <View style={styles.logBody}>
         <Text style={styles.workerName}>{item.Worker?.Full_Name}</Text>
         <Text style={styles.passportNumber}>{item.Worker?.Passport_Number}</Text>
         {item.Note && (
           <View style={styles.noteBox}>
              <Text style={styles.note}>{item.Note}</Text>
           </View>
         )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-right" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>سجلات التفتيش الميدانية</Text>
        <View style={{ width: 40 }} />
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
               <MaterialCommunityIcons name="clipboard-off-outline" size={60} color={theme.colors.textMuted} />
               <Text style={styles.emptyText}>لا توجد سجلات تفتيش مسجلة باسمك حالياً</Text>
            </View>
          }
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
    paddingBottom: 12,
    marginBottom: 12,
  },
  resultBadge: {
    backgroundColor: theme.colors.successTransparent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  logResult: {
    color: theme.colors.success,
    fontWeight: 'bold',
    fontSize: 11,
  },
  logDate: {
    color: theme.colors.textSecondary,
    fontSize: 11,
  },
  logBody: {
    alignItems: 'flex-end',
  },
  workerName: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  passportNumber: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  noteBox: {
    backgroundColor: theme.colors.surfaceLight,
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    width: '100%',
  },
  note: {
    color: theme.colors.textDark,
    fontSize: 12,
    textAlign: 'right',
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
    gap: 16,
  },
  emptyText: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default InspectionRecordsScreen;
