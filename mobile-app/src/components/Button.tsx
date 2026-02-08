import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  useColorScheme,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/colors';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BORDER_RADIUS.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size
    switch (size) {
      case 'small':
        baseStyle.paddingVertical = SPACING.sm;
        baseStyle.paddingHorizontal = SPACING.md;
        baseStyle.minHeight = 36;
        break;
      case 'large':
        baseStyle.paddingVertical = SPACING.md + 4;
        baseStyle.paddingHorizontal = SPACING.lg;
        baseStyle.minHeight = 56;
        break;
      default:
        baseStyle.paddingVertical = SPACING.md;
        baseStyle.paddingHorizontal = SPACING.lg;
        baseStyle.minHeight = 48;
    }

    // Variant
    switch (variant) {
      case 'secondary':
        baseStyle.backgroundColor = COLORS.secondary;
        break;
      case 'danger':
        baseStyle.backgroundColor = COLORS.danger;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 2;
        baseStyle.borderColor = COLORS.primary;
        break;
      default:
        baseStyle.backgroundColor = COLORS.primary;
    }

    // Disabled
    if (disabled || loading) {
      baseStyle.opacity = 0.5;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      color: COLORS.white,
    };

    switch (size) {
      case 'small':
        baseStyle.fontSize = FONT_SIZES.sm;
        break;
      case 'large':
        baseStyle.fontSize = FONT_SIZES.lg;
        break;
      default:
        baseStyle.fontSize = FONT_SIZES.md;
    }

    if (variant === 'outline') {
      baseStyle.color = COLORS.primary;
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.white} />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({});
