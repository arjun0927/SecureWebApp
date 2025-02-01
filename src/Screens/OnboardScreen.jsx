import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { data } from '../constants/onboardData';
import HeaderSvg from '../assets/Svgs/HeaderSvg';

const Onboard = () => {
  const navigation = useNavigation();
  const sliderRef = useRef(null);
  const timerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dotAnimations] = useState([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]); // Animated values for each fill bar

  const handleNextScreen = (index) => {
    if (index < data.length - 1) {
      sliderRef.current?.goToSlide(index + 1, true);
    } else {
      navigation.replace('UserPermission');
    }
  };

  useEffect(() => {
    let activeIndex = 0;

    timerRef.current = setInterval(() => {
      if (activeIndex < data.length - 1) {
        handleNextScreen(activeIndex);
        activeIndex++;
      } else {
        clearInterval(timerRef.current);
        navigation.replace('UserPermission');
      }
    }, 2000);

    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={1}
        onPress={() => {
          clearInterval(timerRef.current);
          handleNextScreen(index);
        }}
      >
        <View style={{ flex: 1, padding: 20 }}>
          <View style={styles.header}>
            <HeaderSvg />
            <View>
              <Text style={styles.headerText}>Secure</Text>
              <Text style={styles.headerText}>WebApp</Text>
            </View>
          </View>

          <View style={styles.imageContainer}>
            <Image style={styles.mainImage} source={item.img} />
            <View style={styles.textContainer}>
              <Text style={styles.text}>{item.text}</Text>
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.replace('UserPermission')}>
            <View style={styles.btn}>
              <Text style={styles.btnText}>Log In Now!</Text>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Updated pagination with three animated fill bars
  const renderPagination = (index) => {
    setActiveIndex(index);

    // Animate the fill bars for each pagination dot
    dotAnimations.forEach((dotAnimation, idx) => {
      Animated.timing(dotAnimation, {
        toValue: idx <= index ? 1 : 0,
        duration: 2000,
        useNativeDriver: false,
      }).start();
    });

    return (
      <View style={styles.paginationContainer}>
        {dotAnimations.map((dotAnimation, idx) => (
          <View key={idx} style={styles.fillBar}>
            <Animated.View
              style={[
                styles.filledBar,
                { width: dotAnimation.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
              ]}
            />
          </View>
        ))}
      </View>
    );
  };

  return (
    <LinearGradient colors={['#FFF', '#D8E8DD']} style={{ flex: 1 }}>
      <AppIntroSlider
        ref={sliderRef}
        renderItem={renderItem}
        data={data}
        renderPagination={renderPagination}
        onSlideChange={(index) => setActiveIndex(index)}
      />
    </LinearGradient>
  );
};

export default Onboard;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  headerText: {
    color: '#1C390E',
    fontFamily: 'Poppins',
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
    letterSpacing: 0.7,
  },
  imageContainer: {
    flex: 1,
    marginTop: responsiveHeight(10),
    alignItems: 'center',
  },
  mainImage: {
    width: responsiveWidth(70),
    height: responsiveHeight(25),
    resizeMode: 'contain',
  },
  textContainer: {
    width: responsiveWidth(80),
    marginTop: responsiveHeight(10),
  },
  text: {
    color: '#213623',
    fontFamily: 'Prociono',
    fontSize: responsiveFontSize(4),
    fontWeight: '500',
    letterSpacing: 0.215,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: responsiveHeight(18),
    left: responsiveWidth(5),
    flexDirection: 'row',
    gap: responsiveWidth(5),
  },
  fillBar: {
    backgroundColor: '#C1DFB7',
    height: responsiveHeight(0.6),
    width: responsiveWidth(20), // 20% width for each bar
    borderRadius: 10,
    overflow: 'hidden',
  },
  filledBar: {
    backgroundColor: '#213623',
    height: '100%',
  },
  btn: {
    width: '100%',
    height: responsiveHeight(7),
    backgroundColor: '#335E1F',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  btnText: {
    color: '#FFF',
    fontFamily: 'Poppins',
    fontSize: responsiveFontSize(2.1),
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
