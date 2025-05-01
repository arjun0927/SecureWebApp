import { View, Text, StatusBar } from 'react-native'
import React from 'react'
import AppNavigator from './src/AppNavigator'
import { GlobalProvider } from './src/Context/GlobalContext'

const App = () => {
  return (
    <GlobalProvider>
       <StatusBar
        backgroundColor="#FEFEFF" 
        barStyle="dark-content"  
      />
      <AppNavigator />
    </GlobalProvider>
  )
}

export default App