import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface MapComponentProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{ lat: number; lng: number; label?: string; info?: string }>;
  onMapClick?: (lat: number, lng: number) => void;
  height?: string;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  center = { lat: 40.7128, lng: -74.006 },
  zoom = 12,
  markers = [],
  onMapClick,
  height = '400px',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API key is not set');
      return;
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
    });

    loader.load().then(() => {
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      const newMap = new google.maps.Map(mapRef.current, {
        center,
        zoom,
      });

      if (onMapClick) {
        newMap.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            onMapClick(e.latLng.lat(), e.latLng.lng());
          }
        });
      }

      setMap(newMap);
    }
  }, [isLoaded, map, center, zoom, onMapClick]);

  useEffect(() => {
    if (map) {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      markers.forEach((markerData) => {
        const marker = new google.maps.Marker({
          position: { lat: markerData.lat, lng: markerData.lng },
          map,
          label: markerData.label,
        });

        if (markerData.info) {
          const infoWindow = new google.maps.InfoWindow({
            content: markerData.info,
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });
        }

        markersRef.current.push(marker);
      });

      if (markers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        markers.forEach((marker) => {
          bounds.extend({ lat: marker.lat, lng: marker.lng });
        });
        map.fitBounds(bounds);
      }
    }
  }, [map, markers]);

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Google Maps API key not configured
        </p>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      style={{ height }}
      className="w-full rounded-lg border border-gray-300 dark:border-gray-600"
    />
  );
};
