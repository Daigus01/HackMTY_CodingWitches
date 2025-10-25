import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import UserDashboardScreen from '../screens/UserDashboardScreen';
import BankDashboardScreen from '../screens/BankDashboardScreen';
import ScanBillScreen from '../screens/ScanBillScreen';
import BillHistoryScreen from '../screens/BillHistoryScreen';
import CashbackHistoryScreen from '../screens/CashbackHistoryScreen';

export type RootStackParamList = {
  Login: undefined;
  UserTabs: undefined;
  BankTabs: undefined;
};

export type UserTabParamList = {
  Dashboard: undefined;
  ScanBill: undefined;
  BillHistory: undefined;
  Cashback: undefined;
};

export type BankTabParamList = {
  BankDashboard: undefined;
  AllUsers: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const UserTab = createBottomTabNavigator<UserTabParamList>();
const BankTab = createBottomTabNavigator<BankTabParamList>();

function UserTabNavigator() {
  return (
    <UserTab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({color, size}) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'ScanBill':
              iconName = 'camera-alt';
              break;
            case 'BillHistory':
              iconName = 'history';
              break;
            case 'Cashback':
              iconName = 'attach-money';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#E20714',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#E20714',
        },
        headerTintColor: '#fff',
      })}>
      <UserTab.Screen 
        name="Dashboard" 
        component={UserDashboardScreen}
        options={{title: 'Mi Dashboard'}}
      />
      <UserTab.Screen 
        name="ScanBill" 
        component={ScanBillScreen}
        options={{title: 'Escanear Recibo'}}
      />
      <UserTab.Screen 
        name="BillHistory" 
        component={BillHistoryScreen}
        options={{title: 'Historial'}}
      />
      <UserTab.Screen 
        name="Cashback" 
        component={CashbackHistoryScreen}
        options={{title: 'Cashback'}}
      />
    </UserTab.Navigator>
  );
}

function BankTabNavigator() {
  return (
    <BankTab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({color, size}) => {
          let iconName: string;

          switch (route.name) {
            case 'BankDashboard':
              iconName = 'dashboard';
              break;
            case 'AllUsers':
              iconName = 'people';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#E20714',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#E20714',
        },
        headerTintColor: '#fff',
      })}>
      <BankTab.Screen 
        name="BankDashboard" 
        component={BankDashboardScreen}
        options={{title: 'Dashboard Banorte'}}
      />
      <BankTab.Screen 
        name="AllUsers" 
        component={BankDashboardScreen}
        options={{title: 'Usuarios'}}
      />
    </BankTab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="UserTabs" component={UserTabNavigator} />
        <Stack.Screen name="BankTabs" component={BankTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
