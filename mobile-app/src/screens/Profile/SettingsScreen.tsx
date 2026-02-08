import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, useColorScheme } from 'react-native';
import { Card } from '../../components/Card';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/colors';

export const SettingsScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [locationEnabled, setLocationEnabled] = React.useState(true);

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.content}>
        <Card>
          <View style={styles.settingItem}>
            <Text style={[styles.settingText, isDark && styles.settingTextDark]}>Push Notifications</Text>
            <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
          </View>
          <View style={styles.settingItem}>
            <Text style={[styles.settingText, isDark && styles.settingTextDark]}>Location Services</Text>
            <Switch value={locationEnabled} onValueChange={setLocationEnabled} />
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  containerDark: { backgroundColor: COLORS.backgroundDark },
  content: { padding: SPACING.md },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  settingText: { fontSize: FONT_SIZES.md, color: COLORS.textPrimary },
  settingTextDark: { color: COLORS.textPrimaryDark },
});
