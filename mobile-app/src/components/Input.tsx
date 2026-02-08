import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  style,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const shouldShowPasswordToggle = secureTextEntry;
  const isSecure = secureTextEntry && !isPasswordVisible;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
      )}
      <View
        style={[
          styles.inputContainer,
          isDark && styles.inputContainerDark,
          error && styles.inputContainerError,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={isDark ? COLORS.gray400 : COLORS.gray500}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            isDark && styles.inputDark,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || shouldShowPasswordToggle) && styles.inputWithRightIcon,
            style,
          ]}
          placeholderTextColor={isDark ? COLORS.gray500 : COLORS.gray400}
          secureTextEntry={isSecure}
          {...props}
        />
        {shouldShowPasswordToggle && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.rightIcon}>
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={isDark ? COLORS.gray400 : COLORS.gray500}
            />
          </TouchableOpacity>
        )}
        {rightIcon && !shouldShowPasswordToggle && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Ionicons
              name={rightIcon}
              size={20}
              color={isDark ? COLORS.gray400 : COLORS.gray500}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  labelDark: {
    color: COLORS.textPrimaryDark,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    minHeight: 48,
  },
  inputContainerDark: {
    backgroundColor: COLORS.surfaceDark,
    borderColor: COLORS.borderDark,
  },
  inputContainerError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  inputDark: {
    color: COLORS.textPrimaryDark,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  leftIcon: {
    marginLeft: SPACING.md,
  },
  rightIcon: {
    padding: SPACING.md,
  },
  error: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
});
