import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { COLORS } from '../constants/colors';

// Auth Screens
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';

// Main Screens
import { DashboardScreen } from '../screens/Main/DashboardScreen';

// Attendance Screens
import { CheckInScreen } from '../screens/Attendance/CheckInScreen';
import { CheckOutScreen } from '../screens/Attendance/CheckOutScreen';
import { AttendanceHistoryScreen } from '../screens/Attendance/AttendanceHistoryScreen';
import { AttendanceDetailScreen } from '../screens/Attendance/AttendanceDetailScreen';

// Shift Screens
import { ShiftListScreen } from '../screens/Shift/ShiftListScreen';
import { ShiftDetailScreen } from '../screens/Shift/ShiftDetailScreen';

// Emergency Screens
import { PanicButtonScreen } from '../screens/Emergency/PanicButtonScreen';

// Profile Screens
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { SettingsScreen } from '../screens/Profile/SettingsScreen';

// Notifications Screens
import { NotificationsScreen } from '../screens/Notifications/NotificationsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const DashboardStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DashboardMain"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen
        name="CheckIn"
        component={CheckInScreen}
        options={{ title: 'Check In' }}
      />
      <Stack.Screen
        name="CheckOut"
        component={CheckOutScreen}
        options={{ title: 'Check Out' }}
      />
      <Stack.Screen
        name="PanicButton"
        component={PanicButtonScreen}
        options={{ title: 'Emergency', headerStyle: { backgroundColor: COLORS.danger }, headerTintColor: COLORS.white }}
      />
    </Stack.Navigator>
  );
};

const AttendanceStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AttendanceHistoryMain"
        component={AttendanceHistoryScreen}
        options={{ title: 'Attendance History' }}
      />
      <Stack.Screen
        name="AttendanceDetail"
        component={AttendanceDetailScreen}
        options={{ title: 'Attendance Details' }}
      />
    </Stack.Navigator>
  );
};

const ShiftStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ShiftListMain"
        component={ShiftListScreen}
        options={{ title: 'My Shifts' }}
      />
      <Stack.Screen
        name="ShiftDetail"
        component={ShiftDetailScreen}
        options={{ title: 'Shift Details' }}
      />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
    </Stack.Navigator>
  );
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'AttendanceHistory') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'ShiftList') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray500,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="AttendanceHistory"
        component={AttendanceStack}
        options={{ title: 'History' }}
      />
      <Tab.Screen
        name="ShiftList"
        component={ShiftStack}
        options={{ title: 'Shifts' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading..." />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};
