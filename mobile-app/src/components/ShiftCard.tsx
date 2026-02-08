import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Shift } from '../types';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import { COLORS, SPACING, FONT_SIZES } from '../constants/colors';

interface ShiftCardProps {
  shift: Shift;
  onPress?: () => void;
}

export const ShiftCard: React.FC<ShiftCardProps> = ({ shift, onPress }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const shiftDate = format(new Date(shift.date), 'MMM dd, yyyy');
  const startTime = format(new Date(`${shift.date}T${shift.startTime}`), 'h:mm a');
  const endTime = format(new Date(`${shift.date}T${shift.endTime}`), 'h:mm a');

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={isDark ? COLORS.textSecondaryDark : COLORS.textSecondary}
            />
            <Text style={[styles.date, isDark && styles.dateDark]}>{shiftDate}</Text>
          </View>
          <StatusBadge status={shift.status} />
        </View>

        <View style={styles.timeContainer}>
          <View style={styles.timeItem}>
            <Ionicons
              name="time-outline"
              size={18}
              color={isDark ? COLORS.textSecondaryDark : COLORS.textSecondary}
            />
            <Text style={[styles.timeText, isDark && styles.timeTextDark]}>
              {startTime} - {endTime}
            </Text>
          </View>
        </View>

        {shift.location && (
          <View style={styles.locationContainer}>
            <Ionicons
              name="location-outline"
              size={18}
              color={isDark ? COLORS.textSecondaryDark : COLORS.textSecondary}
            />
            <View style={styles.locationText}>
              <Text style={[styles.locationName, isDark && styles.locationNameDark]}>
                {shift.location.name}
              </Text>
              <Text style={[styles.locationAddress, isDark && styles.locationAddressDark]}>
                {shift.location.address}
              </Text>
            </View>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
  },
  dateDark: {
    color: COLORS.textPrimaryDark,
  },
  timeContainer: {
    marginBottom: SPACING.sm,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  timeTextDark: {
    color: COLORS.textSecondaryDark,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationText: {
    flex: 1,
    marginLeft: SPACING.xs,
  },
  locationName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  locationNameDark: {
    color: COLORS.textPrimaryDark,
  },
  locationAddress: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  locationAddressDark: {
    color: COLORS.textSecondaryDark,
  },
});
