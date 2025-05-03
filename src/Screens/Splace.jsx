import { StatusBar, StyleSheet, Text, View, Image, ImageBackground } from 'react-native';
import React, { useEffect } from 'react';
import SplaceSvg from '../assets/Svgs/SplaceSvg';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Splace = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('OnboardScreen');
    }, 2000);

    return () => clearTimeout(timer); // Clean up timer
  }, [navigation]);
  const getToken = async () => {
    const data = await AsyncStorage.getItem('loginInfo');
    const parsedData = JSON.parse(data);
    const { role, token } = parsedData
    if (token && role === 'USER') {
      navigation.replace('UserMainScreen');
    }
    if (token && role === 'ADMIN') {
      navigation.replace('BottomNavigation');
    }
  }
  useEffect(() => {
    getToken();
  }, []);
  return (
    <ImageBackground
      source={require('../assets/images/splaceBackground.png')} // Replace with your image path
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.content}>
        <SplaceSvg />
        <Text style={styles.text}>Secure WebApp</Text>
      </View>

      <View style={styles.bottomContainer}>
        <Image source={require('../assets/images/ceoitbox.png')} style={styles.img} />
        <Text style={styles.logoText}>Powered by Ceoitbox</Text>
      </View>
    </ImageBackground>
  );
};

export default Splace;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Vertically centers content
    alignItems: 'center',     // Horizontally centers content
  },
  content: {
    width: '50%',
    justifyContent: 'center', // Center elements vertically
    alignItems: 'center',     // Center elements horizontally
  },
  text: {
    fontSize: 40,
    textAlign: 'center',
    color: '#1C390E',
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    letterSpacing: 0.516,
  },
  bottomContainer: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
  },
  img: {
    width: 28,
    height: 29,
  },
  logoText: {
    fontSize: 14,
    color: '#222327',
    fontFamily: 'Poppins-Medium',
    letterSpacing: 0.516,
  },
});
