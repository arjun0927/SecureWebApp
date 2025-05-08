import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Easing,
  Dimensions,
  Platform,
  useWindowDimensions,
} from 'react-native';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import SearchSvg from '../../assets/Svgs/SearchSvg';
import { useGlobalContext } from '../../Context/GlobalContext';
import {
  responsiveFontSize,
  responsiveWidth,
  responsiveHeight,
} from 'react-native-responsive-dimensions';

const AnimatedTableSearchBar = () => {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const { data, setData } = useGlobalContext();
  const [originalData, setOriginalData] = useState([]);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Determine if we're on a small screen
  const isSmallScreen = windowWidth < 375;
  const isMediumScreen = windowWidth >= 375 && windowWidth < 768;
  const isLargeScreen = windowWidth >= 768;

  const getSearchWidth = useCallback(() => {
    if (isSmallScreen) return windowWidth * 0.65; 
    if (isMediumScreen) return windowWidth * 0.35; 
    return windowWidth * 0.42; 
  }, [windowWidth, isSmallScreen, isMediumScreen, isLargeScreen]);

  // Cache search icon size
  const getSearchIconSize = useCallback(() => {
    if (isSmallScreen) return responsiveFontSize(2);
    if (isMediumScreen) return responsiveFontSize(2.3);
    return responsiveFontSize(2.5);
  }, [isSmallScreen, isMediumScreen, isLargeScreen]);

  // Update animation config on screen resize
  useEffect(() => {
    if (isExpanded) {
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
  }, [windowWidth, windowHeight, isExpanded]);

  useEffect(() => {
    if (originalData.length === 0 && data?.length > 0) {
      setOriginalData(data);
    }
  }, [data, originalData]);

  const handleSearch = (text) => {
    setInput(text);

    if (!text || text.trim() === '') {
      setData(originalData);
      return;
    }

    const filteredData = originalData.filter((item) => {
      // Safely check for properties that might be undefined
      const tableName = item?.tableName?.toLowerCase() || '';
      const spreadsheetsName = item?.spreadsheetsName?.toLowerCase() || '';
      const uniqueField = item?.uniqueField?.toLowerCase() || '';

      const searchTerm = text.toLowerCase();

      return (
        tableName.includes(searchTerm) ||
        spreadsheetsName.includes(searchTerm) ||
        uniqueField.includes(searchTerm)
      );
    });

    setData(filteredData);
  };

  const toggleSearchBar = () => {
    setIsExpanded((prev) => {
      const newExpandedState = !prev;

      // If closing the search bar, clear the input
      if (!newExpandedState) {
        setInput('');
        setData(originalData);
      }

      Animated.timing(animation, {
        toValue: newExpandedState ? 1 : 0,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start();

      return newExpandedState;
    });
  };

  const animatedInputWidth = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, getSearchWidth()],
  });

  const animatedBackgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E0FFD3', 'white'],
  });

  const animatedElevation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Platform.OS === 'ios' ? 3 : 2],
  });

  const animatedIconOpacity = animation.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [1, 0.7, 1],
  });

  const searchIconSize = getSearchIconSize();

  return (
    <Animated.View
      style={[
        styles.mainContainer,
        {
          backgroundColor: animatedBackgroundColor,
          elevation: animatedElevation,
          shadowOpacity: isExpanded ? 0.1 : 0,
          height: isSmallScreen ? responsiveHeight(5.2) :
            isMediumScreen ? responsiveHeight(5.5) :
              responsiveHeight(5),
          borderRadius: isSmallScreen ? responsiveWidth(1.5) : responsiveWidth(2), paddingVertical: isSmallScreen ? responsiveHeight(0.5) :
            isMediumScreen ? responsiveHeight(0.6) :
              responsiveHeight(0.5),

        },
      ]}
    >
      <Animated.View style={[styles.searchIconContainer, { opacity: animatedIconOpacity }]}>
        <TouchableOpacity
          onPress={toggleSearchBar}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.searchIconTouchable}
        >
          <SearchSvg
            width={searchIconSize}
            height={searchIconSize}
          />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={[
          styles.animatedInputContainer,
          {
            width: animatedInputWidth,
            marginLeft: isExpanded ? responsiveWidth(1) : 0
          }
        ]}
      >
        <TextInput
          placeholder="Search"
          placeholderTextColor="#A9A9A9"
          style={[
            styles.textInput,
            {
              fontSize: isSmallScreen ? responsiveFontSize(1.6) :
                isMediumScreen ? responsiveFontSize(1.8) :
                  responsiveFontSize(2),
              
              paddingVertical: isSmallScreen ? responsiveHeight(0.8) :
                isMediumScreen ? responsiveHeight(1) :
                  responsiveHeight(0),
            }
          ]}
          value={input}
          onChangeText={handleSearch}
          autoFocus={isExpanded}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </Animated.View>

      {isExpanded && (
        <TouchableOpacity
          onPress={() => {
            setInput('');
            setData(originalData);
          }}
          style={styles.clearButton}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          {input.length > 0 && (
            <View style={styles.clearIconContainer}>
              <View style={styles.clearIcon}>
                <View style={styles.clearIconLine1} />
                <View style={styles.clearIconLine2} />
              </View>
            </View>
          )}
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export default AnimatedTableSearchBar;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    maxWidth: '100%',
    alignSelf: 'flex-start',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 1 },
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    height: '100%',
    lineHeight: responsiveFontSize(2.4),
    color: '#333',
  },
  searchIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIconTouchable: {
    paddingLeft: responsiveWidth(2),
  },
  animatedInputContainer: {
    height: '100%',
    overflow: 'hidden',
  },
  clearButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsiveWidth(1),
  },
  clearIconContainer: {
    width: responsiveFontSize(1.8),
    height: responsiveFontSize(1.8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIcon: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  clearIconLine1: {
    position: 'absolute',
    width: '100%',
    height: 1.5,
    backgroundColor: '#888',
    transform: [{ rotate: '45deg' }],
  },
  clearIconLine2: {
    position: 'absolute',
    width: '100%',
    height: 1.5,
    backgroundColor: '#888',
    transform: [{ rotate: '-45deg' }],
  },
});