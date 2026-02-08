import React, { useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { format } from 'date-fns';
import { Card } from '../../components/Card';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useNotifications } from '../../hooks/useNotifications';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/colors';

export const NotificationsScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { notifications, isLoading, refreshNotifications, markAsRead } = useNotifications();

  useEffect(() => {
    refreshNotifications();
  }, []);

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => markAsRead(item.id)}>
            <Card style={styles.card}>
              <Text style={[styles.title, isDark && styles.titleDark]}>{item.title}</Text>
              <Text style={[styles.message, isDark && styles.messageDark]}>{item.message}</Text>
              <Text style={[styles.date, isDark && styles.dateDark]}>
                {format(new Date(item.createdAt), 'MMM dd, yyyy h:mm a')}
              </Text>
            </Card>
          </TouchableOpacity>
        )}
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
  unreadCard: { borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  title: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  titleDark: { color: COLORS.textPrimaryDark },
  message: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  messageDark: { color: COLORS.textSecondaryDark },
  date: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  dateDark: { color: COLORS.textSecondaryDark },
});
