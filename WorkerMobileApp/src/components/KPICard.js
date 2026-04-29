import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient'; // Needs installation if real project

const gradients = {
  'kpi-gradient-1': ['#1e40af', '#1e3a8a'], // blue-800 to blue-900
  'kpi-gradient-2': ['#0d9488', '#0f766e'], // teal-600 to teal-700
  'kpi-gradient-3': ['#d97706', '#b45309'], // amber-600 to amber-700
  'kpi-gradient-4': ['#dc2626', '#b91c1c'], // red-600 to red-700
};

export const KPICard = ({ title, value, icon, gradient, change }) => {
  const colors = gradients[gradient] || ['#4b5563', '#374151'];

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
    fontSize: 14,
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
    fontSize: 12,
    opacity: 0.75,
    marginTop: 4,
  },
  iconContainer: {
    opacity: 0.8,
  },
});
