import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Theme } from '../theme';

const gradients = {
  'kpi-gradient-1': Theme.gradients.kpi1,
  'kpi-gradient-2': Theme.gradients.kpi2,
  'kpi-gradient-3': Theme.gradients.kpi3,
  'kpi-gradient-4': Theme.gradients.kpi4,
};

export const KPICard = ({ title, value, iconName, gradient, change }) => {
  const colors = gradients[gradient] || [Theme.colors.muted, Theme.colors.muted];

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{value}</Text>
          {change && <Text style={styles.change}>{change}</Text>}
        </View>
        <View style={styles.iconContainer}>
          <Icon name={iconName} size={32} color="#ffffff" style={{ opacity: 0.8 }} />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Theme.borderRadius.lg,
    padding: 16,
    marginBottom: 12,
    flex: 1,
    marginHorizontal: 4,
    ...Theme.shadows.md,
  },
  container: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'flex-end',
  },
  title: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.85,
    marginBottom: 4,
  },
  value: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  change: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.75,
    marginTop: 4,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
