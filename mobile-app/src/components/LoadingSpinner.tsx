import React from 'react';
import { ActivityIndicator, View, StyleSheet, Text, useColorScheme } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants/colors';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color,
  text,
  fullScreen = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const spinnerColor = color || COLORS.primary;

  const content = (
    <View style={styles.content}>
      <ActivityIndicator size={size} color={spinnerColor} />
      {text && (
        <Text style={[styles.text, isDark && styles.textDark]}>{text}</Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, isDark && styles.fullScreenDark]}>
        {content}
      </View>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  fullScreenDark: {
    backgroundColor: COLORS.backgroundDark,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  textDark: {
    color: COLORS.textSecondaryDark,
  },
});
