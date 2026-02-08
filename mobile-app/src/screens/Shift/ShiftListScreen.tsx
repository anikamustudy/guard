import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ShiftCard } from '../../components/ShiftCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import * as shiftService from '../../services/shiftService';
import { Shift } from '../../types';
import { COLORS, SPACING } from '../../constants/colors';

export const ShiftListScreen = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    try {
      const response = await shiftService.getMyShifts(1, 50);
      setShifts(response.data);
    } catch (error) {
      console.error('Failed to load shifts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading shifts..." />;

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <FlatList
        data={shifts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ShiftCard
            shift={item}
            onPress={() => (navigation as any).navigate('ShiftDetail', { id: item.id })}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadShifts} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  containerDark: { backgroundColor: COLORS.backgroundDark },
  list: { padding: SPACING.md },
});
