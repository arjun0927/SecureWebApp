import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import UserIconSvg from '../../assets/Svgs/UserIconSvg'; // Verify this import
import TableIcon from '../../assets/Svgs/TableIcon'; // Import TableIcon
import { responsiveFontSize, responsiveHeight } from 'react-native-responsive-dimensions';

const CustomTabBarButton = (props) => {
  const RouteName = props.currentRoute || ''; // Use `currentRoute` directly

  const focused = props.accessibilityState?.selected;

  // Map your icons based on the route
  const Icons = {
    Users: (focused) => (
      <UserIconSvg strokeColor={focused ? 'white' : 'black'} strokeWidth={1.5} />
    ),
    Tables: (focused) => (
      <TableIcon fillColor={focused ? 'white' : '#222327'} strokeColor={focused ? '#2F3033' : 'white'} />
    ),
  };

  return (
    <TouchableOpacity
      {...props}
      style={[styles.btn, focused && styles.activeBtn]}
      activeOpacity={0.7}
    >
      {/* Render the icon based on route */}
      {Icons[RouteName] ? Icons[RouteName](focused) : null}
      <Text style={[styles.tabText, { color: focused ? 'white' : 'black' }]}>
        {RouteName || 'Tab'}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomTabBarButton;

const styles = StyleSheet.create({
  btn: {
    height: responsiveHeight(5), 
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginHorizontal: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 0, // Remove extra padding if needed
    backgroundColor: 'white', // Default background
  },
  activeBtn: {
    backgroundColor: '#2f3033', // Background when active
  },
  tabText: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: 'Poppins-Medium',
    marginLeft: 10,
  },
});
