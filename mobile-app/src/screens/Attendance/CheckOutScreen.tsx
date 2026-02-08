import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Image, TouchableOpacity, useColorScheme } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import * as attendanceService from '../../services/attendanceService';
import { useLocation } from '../../hooks/useLocation';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/colors';

export const CheckOutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const attendance = (route.params as any)?.attendance;

  const [step, setStep] = useState<'camera' | 'preview'>('camera');
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const { location, refreshLocation } = useLocation();

  const takeSelfie = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (photo) {
        setSelfieUri(photo.uri);
        setStep('preview');
      }
    }
  };

  const handleSubmit = async () => {
    if (!selfieUri) return;
    
    await refreshLocation();
    if (!location) {
      Alert.alert('Error', 'Unable to get location');
      return;
    }

    setSubmitting(true);
    try {
      await attendanceService.checkOut({
        attendanceId: attendance.id,
        latitude: location.latitude,
        longitude: location.longitude,
        selfie: selfieUri,
      });

      Alert.alert('Success', 'Check-out successful!', [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard' as never) },
      ]);
    } catch (error: any) {
      Alert.alert('Check-out Failed', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'camera') {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="front">
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
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

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={[styles.title, isDark && styles.titleDark]}>Preview Check-out Selfie</Text>
          {selfieUri && <Image source={{ uri: selfieUri }} style={styles.preview} resizeMode="cover" />}
          <Button title="Submit Check-out" onPress={handleSubmit} loading={submitting} disabled={submitting} size="large" style={styles.button} />
          <Button title="Retake" onPress={() => { setSelfieUri(null); setStep('camera'); }} variant="outline" size="large" />
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  containerDark: { backgroundColor: COLORS.backgroundDark },
  content: { flex: 1, padding: SPACING.md },
  card: { flex: 1 },
  title: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: SPACING.md, textAlign: 'center' },
  titleDark: { color: COLORS.textPrimaryDark },
  button: { marginBottom: SPACING.sm },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'space-between' },
  cameraHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, paddingTop: SPACING.xl },
  backButton: { padding: SPACING.sm },
  cameraTitle: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.white, marginLeft: SPACING.md },
  cameraFooter: { alignItems: 'center', paddingBottom: SPACING.xxl },
  captureButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center' },
  captureButtonInner: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.secondary },
  preview: { width: '100%', height: 400, borderRadius: 12, marginBottom: SPACING.md },
});
