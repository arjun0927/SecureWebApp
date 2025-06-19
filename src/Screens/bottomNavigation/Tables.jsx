import { BackHandler, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import TableScreen from './TableScreen';
import { useNavigation } from '@react-navigation/native';

const stack = createNativeStackNavigator();

const Tables = () => {

  return (
    <stack.Navigator>
      <stack.Screen 
        name='TableScreen' 
        component={TableScreen} 
        options={{
          headerShown: false,
        }}
      />
    </stack.Navigator>
  )
}

export default Tables