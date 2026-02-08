import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { LocationMap } from '../../components/LocationMap';
import * as shiftService from '../../services/shiftService';
import * as attendanceService from '../../services/attendanceService';
import { Shift, Attendance } from '../../types';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/colors';

export const DashboardScreen = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();

  const [todayShift, setTodayShift] = useState<Shift | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [shift, attendance] = await Promise.all([
        shiftService.getTodayShift(),
        attendanceService.getTodayAttendance(),
      ]);
      setTodayShift(shift);
      setTodayAttendance(attendance);
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleCheckIn = () => {
    if (!todayShift) {
      Alert.alert('No Shift', 'You don\'t have a shift scheduled for today');
      return;
    }
    (navigation as any).navigate('CheckIn', { shift: todayShift });
  };

  const handleCheckOut = () => {
    if (!todayAttendance) {
      Alert.alert('Not Checked In', 'You need to check in first');
      return;
    }
    (navigation as any).navigate('CheckOut', { attendance: todayAttendance });
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading dashboard..." />;
  }

  const hasCheckedIn = todayAttendance && todayAttendance.checkInTime;
  const hasCheckedOut = todayAttendance && todayAttendance.checkOutTime;
  const canCheckIn = todayShift && !hasCheckedIn;
  const canCheckOut = hasCheckedIn && !hasCheckedOut;

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, isDark && styles.greetingDark]}>
              Hello, {user?.firstName}!
            </Text>
            <Text style={[styles.date, isDark && styles.dateDark]}>
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>
        </View>

        {/* Today's Shift */}
        {todayShift ? (
          <Card style={styles.shiftCard}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
                Today's Shift
              </Text>
              <StatusBadge status={todayShift.status} />
            </View>

            {todayShift.location && (
              <>
                <View style={styles.shiftInfo}>
                  <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                  <Text style={[styles.shiftText, isDark && styles.shiftTextDark]}>
                    {format(new Date(`${todayShift.date}T${todayShift.startTime}`), 'h:mm a')} - 
                    {format(new Date(`${todayShift.date}T${todayShift.endTime}`), 'h:mm a')}
                  </Text>
                </View>

                <View style={styles.shiftInfo}>
                  <Ionicons name="location-outline" size={20} color={COLORS.primary} />
                  <View style={styles.locationInfo}>
                    <Text style={[styles.locationName, isDark && styles.locationNameDark]}>
                      {todayShift.location.name}
                    </Text>
                    <Text style={[styles.locationAddress, isDark && styles.locationAddressDark]}>
                      {todayShift.location.address}
                    </Text>
                  </View>
                </View>

                <View style={styles.mapContainer}>
                  <LocationMap
                    targetLocation={{
                      latitude: todayShift.location.latitude,
                      longitude: todayShift.location.longitude,
                    }}
                    radius={todayShift.location.radius}
                  />
                </View>
              </>
            )}
          </Card>
        ) : (
          <Card style={styles.noShiftCard}>
            <Ionicons name="calendar-outline" size={48} color={COLORS.gray400} />
            <Text style={[styles.noShiftText, isDark && styles.noShiftTextDark]}>
              No shift scheduled for today
            </Text>
          </Card>
        )}

        {/* Check-in/Check-out Actions */}
        <View style={styles.actionsCard}>
          {canCheckIn && (
            <Button
              title="CHECK IN"
              onPress={handleCheckIn}
              variant="primary"
              size="large"
              style={styles.actionButton}
            />
          )}

          {canCheckOut && (
            <Button
              title="CHECK OUT"
              onPress={handleCheckOut}
              variant="secondary"
              size="large"
              style={styles.actionButton}
            />
          )}

          {hasCheckedOut && (
            <Card style={styles.completedCard}>
              <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />
              <Text style={[styles.completedText, isDark && styles.completedTextDark]}>
                Shift Completed
              </Text>
            </Card>
          )}
        </View>

        {/* Attendance Status */}
        {todayAttendance && (
          <Card style={styles.attendanceCard}>
            <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
              Attendance Status
            </Text>

            {todayAttendance.checkInTime && (
              <View style={styles.statusItem}>
                <Ionicons name="enter-outline" size={20} color={COLORS.success} />
                <Text style={[styles.statusLabel, isDark && styles.statusLabelDark]}>
                  Checked In:
                </Text>
                <Text style={[styles.statusValue, isDark && styles.statusValueDark]}>
                  {format(new Date(todayAttendance.checkInTime), 'h:mm a')}
                </Text>
              </View>
            )}

            {todayAttendance.checkOutTime && (
              <View style={styles.statusItem}>
                <Ionicons name="exit-outline" size={20} color={COLORS.warning} />
                <Text style={[styles.statusLabel, isDark && styles.statusLabelDark]}>
                  Checked Out:
                </Text>
                <Text style={[styles.statusValue, isDark && styles.statusValueDark]}>
                  {format(new Date(todayAttendance.checkOutTime), 'h:mm a')}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => (navigation as any).navigate('AttendanceHistory')}
          >
            <Ionicons name="calendar" size={24} color={COLORS.primary} />
            <Text style={[styles.quickActionText, isDark && styles.quickActionTextDark]}>
              History
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => (navigation as any).navigate('ShiftList')}
          >
            <Ionicons name="time" size={24} color={COLORS.primary} />
            <Text style={[styles.quickActionText, isDark && styles.quickActionTextDark]}>
              Shifts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => (navigation as any).navigate('PanicButton')}
          >
            <Ionicons name="alert-circle" size={24} color={COLORS.danger} />
            <Text style={[styles.quickActionText, isDark && styles.quickActionTextDark]}>
              Emergency
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  containerDark: {
    backgroundColor: COLORS.backgroundDark,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  greetingDark: {
    color: COLORS.textPrimaryDark,
  },
  date: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  dateDark: {
    color: COLORS.textSecondaryDark,
  },
  shiftCard: {
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  cardTitleDark: {
    color: COLORS.textPrimaryDark,
  },
  shiftInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  shiftText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  shiftTextDark: {
    color: COLORS.textPrimaryDark,
  },
  locationInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  locationName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  locationNameDark: {
    color: COLORS.textPrimaryDark,
  },
  locationAddress: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  locationAddressDark: {
    color: COLORS.textSecondaryDark,
  },
  mapContainer: {
    marginTop: SPACING.md,
  },
  noShiftCard: {
    alignItems: 'center',
    padding: SPACING.xl,
    marginBottom: SPACING.md,
  },
  noShiftText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  noShiftTextDark: {
    color: COLORS.textSecondaryDark,
  },
  actionsCard: {
    marginBottom: SPACING.md,
  },
  actionButton: {
    marginBottom: SPACING.sm,
  },
  completedCard: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  completedText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.success,
    marginTop: SPACING.sm,
  },
  completedTextDark: {
    color: COLORS.success,
  },
  attendanceCard: {
    marginBottom: SPACING.md,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  statusLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  statusLabelDark: {
    color: COLORS.textSecondaryDark,
  },
  statusValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
  },
  statusValueDark: {
    color: COLORS.textPrimaryDark,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  quickActionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  quickActionTextDark: {
    color: COLORS.textPrimaryDark,
  },
});
