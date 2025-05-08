import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import HeaderSvg from '../assets/Svgs/HeaderSvg';

// Define data array directly in the component to ensure proper structure
const onboardData = [
  {
    id: 1,
    img: require('../assets/images/onboard/1.png'),
    message: 'Access controls ensure security and protect Info',
  },
  {
    id: 2,
    img: require('../assets/images/onboard/2.png'),
    message: 'Optimized mobile view for seamless data editing on-go.',
  },
  {
    id: 3,
    img: require('../assets/images/onboard/3.png'),
    message: 'Ensure robust data governance via permissions.',
  },
];

const Onboard = () => {
  const navigation = useNavigation();
  const sliderRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dotAnimations] = useState([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]);

  const handleNextScreen = () => {
    if (activeIndex < onboardData.length - 1) {
      sliderRef.current?.goToSlide(activeIndex + 1, true);
    } else {
      navigation.replace('UserPermission');
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.slideContainer}>
        <Image style={styles.mainImage} source={item.img} />
        <View style={styles.textWrapper}>
          <Text style={styles.text}>{item.message}</Text>
        </View>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {dotAnimations.map((_, idx) => (
          <View key={idx} style={styles.fillBar}>
            <View
              style={[
                styles.filledBar,
                { width: idx <= activeIndex ? '100%' : '0%' },
              ]}
            />
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={['#FFF', '#D8E8DD']} style={styles.container}>
        {/* Fixed Header with SafeAreaView consideration */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <HeaderSvg width={responsiveFontSize(2.5)} height={responsiveFontSize(2.5)} />
            <View>
              <Text style={styles.headerText}>Secure</Text>
              <Text style={styles.headerText}>WebApp</Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleNextScreen} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
        
        {/* Slider only for images and text */}
        <View style={styles.sliderContainer}>
          <AppIntroSlider
            ref={sliderRef}
            renderItem={renderItem}
            data={onboardData}
            onSlideChange={(index) => setActiveIndex(index)}
            renderPagination={() => null} // Disable built-in pagination
            showPrevButton={false}
            showNextButton={false}
            showDoneButton={false}
            dotStyle={{display: 'none'}}
            activeDotStyle={{display: 'none'}}
          />
          {renderPagination()} {/* Render our custom pagination */}
        </View>
        
        {/* Fixed Bottom Button */}
        <View style={styles.btnContainer}>
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={() => navigation.replace('UserPermission')}
            style={styles.btn}
          >
            <Text style={styles.btnText}>Log In Now!</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Onboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? responsiveHeight(2) : responsiveHeight(1.5),
    paddingBottom: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(5),
  },
  header: {
    flexDirection: 'row',
    gap: responsiveWidth(2.5),
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(2),
  },
  headerText: {
    color: '#1C390E',
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(2.1),
    lineHeight: responsiveHeight(3), // Increased line height to prevent cutting
  },
  skipText: {
    color: '#000',
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(2.1),
  },
  sliderContainer: {
    flex: 1,
    marginTop: responsiveHeight(2),
  },
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: responsiveWidth(5),
  },
  mainImage: {
    width: responsiveWidth(70),
    height: responsiveHeight(30),
    resizeMode: 'contain',
    marginBottom: responsiveHeight(5),
  },
  textWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(5),
  },
  text: {
    color: '#213623',
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(2.8),
    fontWeight: '500',
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveHeight(4),
    gap: responsiveWidth(4),
  },
  fillBar: {
    backgroundColor: '#C1DFB7',
    height: responsiveHeight(0.6),
    width: responsiveWidth(20),
    borderRadius: 10,
    overflow: 'hidden',
  },
  filledBar: {
    backgroundColor: '#213623',
    height: '100%',
  },
  btnContainer: {
    width: '100%',
    paddingBottom: responsiveHeight(4),
    paddingHorizontal: responsiveWidth(5),
  },
  btn: {
    width: '100%',
    height: responsiveHeight(7),
    backgroundColor: '#335E1F',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontFamily: 'Montserrat-Medium',
    fontSize: responsiveFontSize(2.1),
  },
});