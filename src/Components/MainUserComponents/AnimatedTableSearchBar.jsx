import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Animated,
  Easing,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import SearchSvg from '../../assets/Svgs/SearchSvg';
// import { TextInput } from 'react-native-paper';
import { useGlobalContext } from '../../Context/GlobalContext';
import { responsiveWidth } from 'react-native-responsive-dimensions';

const AnimatedTableSearchBar = () => {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const { data, setData } = useGlobalContext();
  const [originalData, setOriginalData] = useState([]);

  useEffect(() => {
    if (originalData.length === 0) {
      setOriginalData(data);
    }
  }, [data]);

  const handleSearch = (text) => {
    setInput(text);

    if (text.trim() === '') {
      setData(originalData);
      return;
    }

    const filteredData = originalData.filter((item) => {
      return (
        item?.tableName?.toLowerCase().includes(text.toLowerCase()) ||
        item?.spreadsheetsName?.toLowerCase().includes(text.toLowerCase()) ||
        item?.uniqueField?.toLowerCase().includes(text.toLowerCase())
      );
    });

    setData(filteredData);
  };

  const toggleSearchBar = () => {
    // Use the previous state to correctly update the isExpanded value
    setIsExpanded((prev) => {
      const newExpandedState = !prev;

      // Start the animation with the new state
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
    outputRange: [0, responsiveWidth(35)],
  });

  const animatedBackgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E0FFD3', 'white'],
  });

  const animatedElevation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 2],
  });

  return (
    <Animated.View
      style={[
        styles.mainContainer,
        {
          backgroundColor: animatedBackgroundColor,
          elevation: animatedElevation,
          shadowOpacity: isExpanded ? 0 : 0.2,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.searchIconContainer}
        onPress={toggleSearchBar}
      >
        <SearchSvg />
      </TouchableOpacity>
      <Animated.View
        style={[styles.animatedInputContainer, { width: animatedInputWidth }]}
      >
        <TextInput
          placeholder="Search"
          placeholderTextColor="#A9A9A9"
          style={styles.textInput}
          value={input}
          onChangeText={handleSearch}
          autoFocus={isExpanded} // Focus automatically when expanded
          // underlineColor="transparent" // Optional: Remove if not needed
          // activeUnderlineColor="transparent" // Optional: Remove if not needed
        />

      </Animated.View>
    </Animated.View>
  );
};

export default AnimatedTableSearchBar;

const styles = StyleSheet.create({
  mainContainer: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    height: '100%',
    fontSize: 16,
    paddingHorizontal: 10,
  },
  searchIconContainer: {
    // width: 35,
    // height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedInputContainer: {
    height: '100%',
    overflow: 'hidden',
  },
});
