import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/colors';

interface StatusBadgeProps {
  status: 'present' | 'late' | 'absent' | 'on_leave' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getStatusColor = () => {
    switch (status) {
      case 'present':
      case 'completed':
        return COLORS.success;
      case 'late':
      case 'ongoing':
        return COLORS.warning;
      case 'absent':
      case 'cancelled':
        return COLORS.error;
      case 'on_leave':
      case 'scheduled':
        return COLORS.info;
      default:
        return COLORS.gray500;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'late':
        return 'Late';
      case 'absent':
        return 'Absent';
      case 'on_leave':
        return 'On Leave';
      case 'scheduled':
        return 'Scheduled';
      case 'ongoing':
        return 'Ongoing';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const backgroundColor = getStatusColor();

  return (
    <View style={[styles.badge, { backgroundColor: backgroundColor + '20' }]}>
      <View style={[styles.dot, { backgroundColor }]} />
      <Text style={[styles.text, { color: backgroundColor }]}>{getStatusText()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  text: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
});
