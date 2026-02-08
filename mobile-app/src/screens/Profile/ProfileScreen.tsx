import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/colors';

export const ProfileScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.content}>
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={COLORS.white} />
          </View>
          <Text style={[styles.name, isDark && styles.nameDark]}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={[styles.email, isDark && styles.emailDark]}>{user?.email}</Text>
        </Card>

        <Card style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="person-outline" size={24} color={COLORS.primary} />
            <Text style={[styles.menuText, isDark && styles.menuTextDark]}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings-outline" size={24} color={COLORS.primary} />
            <Text style={[styles.menuText, isDark && styles.menuTextDark]}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
            <Text style={[styles.menuText, isDark && styles.menuTextDark]}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </Card>

        <Button title="Logout" onPress={handleLogout} variant="danger" size="large" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  containerDark: { backgroundColor: COLORS.backgroundDark },
  content: { padding: SPACING.md },
  profileCard: { alignItems: 'center', marginBottom: SPACING.md },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  name: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.textPrimary },
  nameDark: { color: COLORS.textPrimaryDark },
  email: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginTop: SPACING.xs },
  emailDark: { color: COLORS.textSecondaryDark },
  menuCard: { marginBottom: SPACING.md },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuText: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.textPrimary, marginLeft: SPACING.md },
  menuTextDark: { color: COLORS.textPrimaryDark },
});
