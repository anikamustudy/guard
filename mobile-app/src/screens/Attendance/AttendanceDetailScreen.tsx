import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { format } from 'date-fns';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { SelfiePreview } from '../../components/SelfiePreview';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import * as attendanceService from '../../services/attendanceService';
import { Attendance } from '../../types';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/colors';

export const AttendanceDetailScreen = () => {
  const route = useRoute();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const id = (route.params as any)?.id;
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetail();
  }, []);

  const loadDetail = async () => {
    try {
      const data = await attendanceService.getAttendanceById(id);
      setAttendance(data);
    } catch (error) {
      console.error('Failed to load detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!attendance) return <Text>Not found</Text>;

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.content}>
        <Card>
          <StatusBadge status={attendance.status} />
          <Text style={[styles.date, isDark && styles.dateDark]}>
            {format(new Date(attendance.shift?.date || ''), 'MMMM dd, yyyy')}
          </Text>
          {attendance.checkInTime && <Text style={[styles.info, isDark && styles.infoDark]}>Check-in: {format(new Date(attendance.checkInTime), 'h:mm a')}</Text>}
          {attendance.checkOutTime && <Text style={[styles.info, isDark && styles.infoDark]}>Check-out: {format(new Date(attendance.checkOutTime), 'h:mm a')}</Text>}
          {attendance.checkInSelfie && (
            <View style={styles.selfieContainer}>
              <Text style={[styles.label, isDark && styles.labelDark]}>Check-in Selfie</Text>
              <SelfiePreview uri={attendance.checkInSelfie} size="large" />
            </View>
          )}
          {attendance.checkOutSelfie && (
            <View style={styles.selfieContainer}>
              <Text style={[styles.label, isDark && styles.labelDark]}>Check-out Selfie</Text>
              <SelfiePreview uri={attendance.checkOutSelfie} size="large" />
            </View>
          )}
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  containerDark: { backgroundColor: COLORS.backgroundDark },
  content: { padding: SPACING.md },
  date: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.textPrimary, marginTop: SPACING.md },
  dateDark: { color: COLORS.textPrimaryDark },
  info: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginTop: SPACING.sm },
  infoDark: { color: COLORS.textSecondaryDark },
  selfieContainer: { marginTop: SPACING.lg },
  label: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  labelDark: { color: COLORS.textPrimaryDark },
});
