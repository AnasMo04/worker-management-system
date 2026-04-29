import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../theme';

const gradients = {
  'kpi-gradient-1': Theme.gradients.kpi1,
  'kpi-gradient-2': Theme.gradients.kpi2,
  'kpi-gradient-3': Theme.gradients.kpi3,
  'kpi-gradient-4': Theme.gradients.kpi4,
};

export const KPICard = ({ title, value, icon, gradient, change }) => {
  const colors = gradients[gradient] || [Theme.colors.muted, Theme.colors.muted];

  return (
    <View style={[styles.card, { backgroundColor: colors[0] }]}>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{value}</Text>
          {change && <Text style={styles.change}>{change}</Text>}
        </View>
        <View style={styles.iconContainer}>
          {icon}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flex: 1,
    marginHorizontal: 4,
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
    opacity: 0.85,
    marginBottom: 4,
  },
  value: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  change: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.75,
    marginTop: 4,
  },
  iconContainer: {
    opacity: 0.8,
  },
});
