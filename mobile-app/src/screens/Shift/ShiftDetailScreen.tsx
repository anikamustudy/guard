import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { LocationMap } from '../../components/LocationMap';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import * as shiftService from '../../services/shiftService';
import { Shift } from '../../types';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/colors';

export const ShiftDetailScreen = () => {
  const route = useRoute();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const id = (route.params as any)?.id;
  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetail();
  }, []);

  const loadDetail = async () => {
    try {
      const data = await shiftService.getShiftById(id);
      setShift(data);
    } catch (error) {
      console.error('Failed to load shift:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!shift) return <Text>Not found</Text>;

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.content}>
        <Card>
          <View style={styles.header}>
            <StatusBadge status={shift.status} />
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
              {format(new Date(shift.date), 'EEEE, MMMM dd, yyyy')}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
              {format(new Date(`${shift.date}T${shift.startTime}`), 'h:mm a')} - {format(new Date(`${shift.date}T${shift.endTime}`), 'h:mm a')}
            </Text>
          </View>

          {shift.location && (
            <>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color={COLORS.primary} />
                <View style={styles.locationInfo}>
                  <Text style={[styles.locationName, isDark && styles.locationNameDark]}>
                    {shift.location.name}
                  </Text>
                  <Text style={[styles.locationAddress, isDark && styles.locationAddressDark]}>
                    {shift.location.address}
                  </Text>
                </View>
              </View>

              <View style={styles.mapContainer}>
                <LocationMap
                  targetLocation={{
                    latitude: shift.location.latitude,
                    longitude: shift.location.longitude,
                  }}
                  radius={shift.location.radius}
                  showCircle={true}
                />
              </View>
            </>
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
  header: { marginBottom: SPACING.md },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md },
  infoText: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary, marginLeft: SPACING.sm, flex: 1 },
  infoTextDark: { color: COLORS.textPrimaryDark },
  locationInfo: { flex: 1, marginLeft: SPACING.sm },
  locationName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textPrimary },
  locationNameDark: { color: COLORS.textPrimaryDark },
  locationAddress: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  locationAddressDark: { color: COLORS.textSecondaryDark },
  mapContainer: { marginTop: SPACING.md },
});
