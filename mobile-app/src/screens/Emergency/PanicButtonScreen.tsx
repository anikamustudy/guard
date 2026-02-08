import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  useColorScheme,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/Card';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useLocation } from '../../hooks/useLocation';
import * as emergencyService from '../../services/emergencyService';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/colors';

export const PanicButtonScreen = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [sending, setSending] = useState(false);
  const { location, refreshLocation } = useLocation();
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePanicPress = () => {
    Alert.alert(
      'Emergency Alert',
      'This will send an emergency alert to all supervisors and admins with your current location. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: sendEmergencyAlert,
        },
      ]
    );
  };

  const sendEmergencyAlert = async () => {
    setSending(true);
    
    try {
      let currentLocation = location;
      if (!currentLocation) {
        await refreshLocation();
        currentLocation = location;
      }

      if (!currentLocation) {
        throw new Error('Unable to get your location');
      }

      await emergencyService.sendEmergencyAlert({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        alertType: 'panic',
        message: 'Emergency panic button pressed',
      });

      Alert.alert(
        'Alert Sent',
        'Emergency alert has been sent successfully. Help is on the way.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Failed to Send Alert', error.message);
    } finally {
      setSending(false);
    }
  };

  if (sending) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <LoadingSpinner fullScreen text="Sending emergency alert..." />
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.header}>
            <Ionicons name="alert-circle" size={64} color={COLORS.danger} />
            <Text style={[styles.title, isDark && styles.titleDark]}>
              Emergency Alert
            </Text>
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
              Press the button below if you need immediate assistance
            </Text>
          </View>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={styles.panicButton}
              onPress={handlePanicPress}
              activeOpacity={0.8}
            >
              <Text style={styles.panicButtonText}>PANIC</Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
                Sends your GPS location
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
                Alerts all supervisors
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
                Help dispatched immediately
              </Text>
            </View>
          </View>

          <View style={styles.warningContainer}>
            <Ionicons name="warning" size={20} color={COLORS.warning} />
            <Text style={[styles.warningText, isDark && styles.warningTextDark]}>
              Only use in genuine emergencies
            </Text>
          </View>
        </Card>
      </View>
    </View>
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
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  titleDark: {
    color: COLORS.textPrimaryDark,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  subtitleDark: {
    color: COLORS.textSecondaryDark,
  },
  panicButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.danger,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: SPACING.xl,
  },
  panicButtonText: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  infoContainer: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  infoTextDark: {
    color: COLORS.textPrimaryDark,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    padding: SPACING.md,
    borderRadius: 8,
  },
  warningText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  warningTextDark: {
    color: COLORS.warning,
  },
});
