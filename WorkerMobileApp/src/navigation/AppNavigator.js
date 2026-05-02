import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import theme from '../theme';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import WorkerDetailsScreen from '../screens/WorkerDetailsScreen';
import NfcScanScreen from '../screens/NfcScanScreen';
import InspectionRecordsScreen from '../screens/InspectionRecordsScreen';
import CasesScreen from '../screens/CasesScreen';
import LogInspectionScreen from '../screens/LogInspectionScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background }
      }}
    >
      {user ? (
        <>
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
          />
          <Stack.Screen
            name="NfcScan"
            component={NfcScanScreen}
          />
          <Stack.Screen
            name="WorkerDetails"
            component={WorkerDetailsScreen}
          />
          <Stack.Screen
            name="InspectionRecords"
            component={InspectionRecordsScreen}
          />
          <Stack.Screen
            name="Cases"
            component={CasesScreen}
          />
          <Stack.Screen
            name="LogInspection"
            component={LogInspectionScreen}
          />
        </>
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
