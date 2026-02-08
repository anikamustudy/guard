import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { BORDER_RADIUS } from '../constants/colors';

interface SelfiePreviewProps {
  uri: string;
  size?: 'small' | 'medium' | 'large';
}

export const SelfiePreview: React.FC<SelfiePreviewProps> = ({ uri, size = 'medium' }) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 80, height: 80 };
      case 'large':
        return { width: 200, height: 200 };
      default:
        return { width: 120, height: 120 };
    }
  };

  const dimensions = getSize();

  return (
    <View style={[styles.container, dimensions]}>
      <Image source={{ uri }} style={styles.image} resizeMode="cover" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
