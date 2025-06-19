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
import AntDesign from 'react-native-vector-icons/AntDesign'

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

  // Add debounced search function
  const debouncedSearch = useCallback(
    (text, originalData) => {
      // console.log('Debounced search executed with:', text);
      const startTime = performance.now();

      if (!text || text.trim() === '') {
        setData(originalData);
        // console.log('Search cleared, reset to original data');
        return;
      }

      const filteredData = originalData.filter((item) => {
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
      const endTime = performance.now();
      // console.log(`Search completed in ${(endTime - startTime).toFixed(2)}ms`);
      // console.log(`Found ${filteredData.length} results`);
    },
    []
  );

  // Create debounced function ref
  const debouncedSearchRef = useRef(null);

  useEffect(() => {
    // Initialize debounced function
    debouncedSearchRef.current = debounce((text) => {
      debouncedSearch(text, originalData);
    }, 300); // 300ms delay

    return () => {
      // Cleanup
      if (debouncedSearchRef.current?.cancel) {
        debouncedSearchRef.current.cancel();
      }
    };
  }, [debouncedSearch, originalData]);

  const handleSearch = (text) => {
    setInput(text);
    // console.log('Search input changed:', text);
    debouncedSearchRef.current(text);
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
    outputRange: ['#E0FFD3', '#FFF'],
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
          // elevation: animatedElevation,
          height: isSmallScreen ? responsiveHeight(5.2) :
            isMediumScreen ? responsiveHeight(5.5) :
              responsiveHeight(5),
          borderRadius: isSmallScreen ? responsiveWidth(1.5) : responsiveWidth(2), 
          paddingVertical: isSmallScreen ? responsiveHeight(0.5) :
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
                isMediumScreen ? responsiveHeight(0) :
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
                <AntDesign name='close' size={responsiveFontSize(2.2)} color={'#888'} />
              </View>
            </View>
          )}
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// Add debounce utility function at the bottom of the file, before the styles
function debounce(func, wait) {
  let timeout;
  const debouncedFn = (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  debouncedFn.cancel = () => clearTimeout(timeout);
  return debouncedFn;
}

export default AnimatedTableSearchBar;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    maxWidth: '100%',
   
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
    marginRight: 10,
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