import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../theme';

const variantStyles = {
  active: { bg: Theme.colors.success + '26', text: Theme.colors.success, border: Theme.colors.success + '4D' },
  suspended: { bg: Theme.colors.warning + '26', text: Theme.colors.warning, border: Theme.colors.warning + '4D' },
  expired: { bg: Theme.colors.muted, text: Theme.colors.mutedForeground, border: Theme.colors.border },
  runaway: { bg: Theme.colors.destructive + '26', text: Theme.colors.destructive, border: Theme.colors.destructive + '4D' },
  default: { bg: Theme.colors.muted, text: Theme.colors.mutedForeground, border: Theme.colors.border },
};

const arabicLabels = {
  active: "نشط",
  suspended: "موقوف",
  expired: "منتهي",
  runaway: "هارب",
};

export const StatusBadge = ({ variant, label, style }) => {
  const v = variant?.toLowerCase();
  const theme = variantStyles[v] || variantStyles.default;

  return (
    <View style={[
      styles.badge,
      { backgroundColor: theme.bg, borderColor: theme.border },
      style
    ]}>
      <Text style={[styles.text, { color: theme.text }]}>
        {label || arabicLabels[v] || variant}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
  },
});
