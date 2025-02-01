import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Tables from './Tables';
import Users from './Users';
import CustomTabBarButton from './CustomTabBarButton';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: styles.tabBar,
        tabBarButton: (props) => (
          <CustomTabBarButton {...props} currentRoute={route.name} />
        ),
      })}
      initialRouteName="Tables"
    >

      <Tab.Screen name="Tables" component={Tables} />
      <Tab.Screen name="Users" component={Users} />
    </Tab.Navigator>

  );
};

export default TabNavigator;

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    backgroundColor: '#fff',
    position: 'relative', // Position the tab bar
    flexDirection: 'row', // This ensures the tab bar is a row
    justifyContent: 'space-evenly', // Distribute tab items evenly
    alignItems: 'center', // Center items vertically
  },
});


