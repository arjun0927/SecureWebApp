import React, { useRef, useState } from 'react';
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
import HeaderSvg from '../assets/Svgs/HeaderSvg';

// Define data array directly in the component to ensure proper structure
const onboardData = [
  {
    id: 1,
    img: require('../assets/images/onboard/1.png'),
    text: 'Access controls ensure security and protect Info',
  },
  {
    id: 2,
    img: require('../assets/images/onboard/2.png'),
    text: 'Optimized mobile view for seamless data editing on-go.',
  },
  {
    id: 3,
    img: require('../assets/images/onboard/3.png'),
    text: 'Ensure robust data governance via permissions .',
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
          <Text style={styles.text}>{item.text}</Text>
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
    <LinearGradient colors={['#FFF', '#D8E8DD']} style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <HeaderSvg />
          <View>
            <Text style={styles.headerText}>Secure</Text>
            <Text style={styles.headerText}>WebApp</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleNextScreen} style={styles.skipButton}>
          <Text style={[styles.headerText, { color: '#000' }]}>Skip</Text>
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
    paddingTop:15,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    
  },
  skipButton: {
    // alignSelf: 'flex-start',
    // paddingVertical: 5,
    // paddingHorizontal: 10,
  },
  headerText: {
    color: '#1C390E',
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(2.1),
    lineHeight: responsiveHeight(2),
  },
  sliderContainer: {
    flex: 1,
    marginTop: responsiveHeight(5),
    // marginBottom: responsiveHeight(10),
  },
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainImage: {
    width: responsiveWidth(70),
    height: responsiveHeight(25),
    resizeMode: 'contain',
    marginBottom: responsiveHeight(5),
  },
  textWrapper: {
    // alignItems: 'center',
    paddingHorizontal: responsiveWidth(5),
  },
  text: {
    color: '#213623',
    fontFamily: 'Poppins-Medium',
    fontSize: responsiveFontSize(3.1),
    fontWeight: '500',
  },
  paginationContainer: {
    marginBottom: responsiveHeight(7),
    flexDirection: 'row',
    marginLeft:20,
    gap: responsiveWidth(5),
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
    marginBottom: responsiveHeight(3),
  },
  btn: {
    width: '90%',
    height: responsiveHeight(7),
    backgroundColor: '#335E1F',
    borderRadius: 15,
    marginHorizontal:20,
    alignSelf:'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontFamily: 'Montserrat-Medium',
    fontSize: responsiveFontSize(2.1),
  },
});