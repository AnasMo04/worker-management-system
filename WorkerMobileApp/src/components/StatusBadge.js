import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const variantStyles = {
  active: { bg: 'rgba(21, 128, 61, 0.15)', text: '#15803d', border: 'rgba(21, 128, 61, 0.2)' },
  suspended: { bg: 'rgba(217, 119, 6, 0.15)', text: '#d97706', border: 'rgba(217, 119, 6, 0.2)' },
  expired: { bg: 'rgba(100, 116, 139, 0.15)', text: '#64748b', border: 'rgba(100, 116, 139, 0.2)' },
  runaway: { bg: 'rgba(220, 38, 38, 0.15)', text: '#dc2626', border: 'rgba(220, 38, 38, 0.2)' },
  default: { bg: 'rgba(148, 163, 184, 0.15)', text: '#64748b', border: 'rgba(148, 163, 184, 0.2)' },
};

const arabicLabels = {
  active: "نشط",
  suspended: "موقوف",
  expired: "منتهي",
  runaway: "هارب",
};

export const StatusBadge = ({ variant, label, style }) => {
  const theme = variantStyles[variant?.toLowerCase()] || variantStyles.default;

  return (
    <View style={[
      styles.badge,
      { backgroundColor: theme.bg, borderColor: theme.border },
      style
    ]}>
      <Text style={[styles.text, { color: theme.text }]}>
        {label || arabicLabels[variant?.toLowerCase()] || variant}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
