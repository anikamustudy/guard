import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  useColorScheme,
  TouchableOpacity,
  Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { LocationMap } from '../../components/LocationMap';
import { useLocation } from '../../hooks/useLocation';
import { useCamera } from '../../hooks/useCamera';
import * as attendanceService from '../../services/attendanceService';
import { Shift } from '../../types';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/colors';
import { formatDistance } from '../../utils/geolocation';

export const CheckInScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const shift = (route.params as any)?.shift as Shift;

  const [step, setStep] = useState<'location' | 'camera' | 'preview'>('location');
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const {
    location,
    isLoading: locationLoading,
    hasPermission: hasLocationPermission,
    requestPermission: requestLocationPermission,
    refreshLocation,
    calculateDistance,
    isWithinGeofence,
  } = useLocation();

  const { hasPermission: hasCameraPermission, requestPermission: requestCameraPermission } = useCamera();

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    if (!hasLocationPermission) {
      const granted = await requestLocationPermission();
      if (!granted) {
        Alert.alert('Permission Required', 'Location permission is required for check-in');
        navigation.goBack();
        return;
      }
    }
    await refreshLocation();
  };

  const handleLocationVerified = async () => {
    if (!location || !shift.location) return;

    const distance = calculateDistance({
      latitude: shift.location.latitude,
      longitude: shift.location.longitude,
    });

    if (distance === null || !isWithinGeofence({
      latitude: shift.location.latitude,
      longitude: shift.location.longitude,
    }, shift.location.radius)) {
      Alert.alert(
        'Outside Geofence',
        `You are ${formatDistance(distance || 0)} away from the duty location. Please move closer to check in.`,
        [{ text: 'Retry', onPress: refreshLocation }, { text: 'Cancel', onPress: () => navigation.goBack() }]
      );
      return;
    }

    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Required', 'Camera permission is required for selfie');
        return;
      }
    }

    setStep('camera');
  };

  const takeSelfie = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (photo) {
        setSelfieUri(photo.uri);
        setStep('preview');
      }
    }
  };

  const retakeSelfie = () => {
    setSelfieUri(null);
    setStep('camera');
  };

  const handleSubmit = async () => {
    if (!location || !selfieUri) return;

    setSubmitting(true);
    try {
      await attendanceService.checkIn({
        shiftId: shift.id,
        latitude: location.latitude,
        longitude: location.longitude,
        selfie: selfieUri,
      });

      Alert.alert('Success', 'Check-in successful!', [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard' as never) },
      ]);
    } catch (error: any) {
      Alert.alert('Check-in Failed', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'location') {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Text style={[styles.title, isDark && styles.titleDark]}>Verify Location</Text>
            
            {locationLoading ? (
              <LoadingSpinner text="Getting your location..." />
            ) : location && shift.location ? (
              <>
                <View style={styles.mapContainer}>
                  <LocationMap
                    currentLocation={location}
                    targetLocation={{
                      latitude: shift.location.latitude,
                      longitude: shift.location.longitude,
                    }}
                    radius={shift.location.radius}
                  />
                </View>

                <View style={styles.distanceInfo}>
                  <Ionicons name="navigate-outline" size={24} color={COLORS.primary} />
                  <Text style={[styles.distanceText, isDark && styles.distanceTextDark]}>
                    Distance: {formatDistance(calculateDistance({
                      latitude: shift.location.latitude,
                      longitude: shift.location.longitude,
                    }) || 0)}
                  </Text>
                </View>

                <Button
                  title="Continue to Selfie"
                  onPress={handleLocationVerified}
                  size="large"
                  style={styles.button}
                />
                <Button
                  title="Refresh Location"
                  onPress={refreshLocation}
                  variant="outline"
                  size="large"
                />
              </>
            ) : (
              <Text>Unable to get location</Text>
            )}
          </Card>
        </View>
      </View>
    );
  }

  if (step === 'camera') {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity onPress={() => setStep('location')} style={styles.backButton}>
                <Ionicons name="arrow-back" size={28} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.cameraTitle}>Take Selfie</Text>
            </View>

            <View style={styles.cameraFooter}>
              <TouchableOpacity onPress={takeSelfie} style={styles.captureButton}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  if (step === 'preview' && selfieUri) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Text style={[styles.title, isDark && styles.titleDark]}>Preview Selfie</Text>

            <Image source={{ uri: selfieUri }} style={styles.preview} resizeMode="cover" />

            <Button
              title="Submit Check-in"
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting}
              size="large"
              style={styles.button}
            />
            <Button
              title="Retake"
              onPress={retakeSelfie}
              variant="outline"
              size="large"
            />
          </Card>
        </View>
      </View>
    );
  }

  return null;
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
  },
  card: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  titleDark: {
    color: COLORS.textPrimaryDark,
  },
  mapContainer: {
    marginBottom: SPACING.md,
  },
  distanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  distanceText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  distanceTextDark: {
    color: COLORS.textPrimaryDark,
  },
  button: {
    marginBottom: SPACING.sm,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingTop: SPACING.xl,
  },
  backButton: {
    padding: SPACING.sm,
  },
  cameraTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: SPACING.md,
  },
  cameraFooter: {
    alignItems: 'center',
    paddingBottom: SPACING.xxl,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
  },
  preview: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
});
