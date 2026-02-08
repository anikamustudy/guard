import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { Coordinates } from '../types';
import { COLORS } from '../constants/colors';

interface LocationMapProps {
  currentLocation?: Coordinates;
  targetLocation: Coordinates;
  radius?: number;
  showCircle?: boolean;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  currentLocation,
  targetLocation,
  radius = 100,
  showCircle = true,
}) => {
  const region = {
    latitude: currentLocation?.latitude || targetLocation.latitude,
    longitude: currentLocation?.longitude || targetLocation.longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* Target Location Marker */}
        <Marker
          coordinate={targetLocation}
          title="Duty Location"
          pinColor={COLORS.primary}
        />

        {/* Geofence Circle */}
        {showCircle && (
          <Circle
            center={targetLocation}
            radius={radius}
            strokeColor={COLORS.primary}
            fillColor={COLORS.primary + '30'}
            strokeWidth={2}
          />
        )}

        {/* Current Location Marker */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Your Location"
            pinColor={COLORS.success}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
