import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Text, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import * as attendanceService from '../../services/attendanceService';
import { Attendance } from '../../types';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/colors';

export const AttendanceHistoryScreen = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await attendanceService.getAttendanceHistory(1, 50);
      setAttendance(response.data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading history..." />;

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <FlatList
        data={attendance}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => (navigation as any).navigate('AttendanceDetail', { id: item.id })}>
            <Card style={styles.card}>
              <View style={styles.header}>
                <Text style={[styles.date, isDark && styles.dateDark]}>
                  {format(new Date(item.shift?.date || ''), 'MMM dd, yyyy')}
                </Text>
                <StatusBadge status={item.status} />
              </View>
              {item.checkInTime && <Text style={[styles.time, isDark && styles.timeDark]}>In: {format(new Date(item.checkInTime), 'h:mm a')}</Text>}
              {item.checkOutTime && <Text style={[styles.time, isDark && styles.timeDark]}>Out: {format(new Date(item.checkOutTime), 'h:mm a')}</Text>}
            </Card>
          </TouchableOpacity>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  containerDark: { backgroundColor: COLORS.backgroundDark },
  list: { padding: SPACING.md },
  card: { marginBottom: SPACING.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  date: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textPrimary },
  dateDark: { color: COLORS.textPrimaryDark },
  time: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 4 },
  timeDark: { color: COLORS.textSecondaryDark },
});
