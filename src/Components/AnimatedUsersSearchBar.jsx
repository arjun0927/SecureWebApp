import {
	StyleSheet,
	TouchableOpacity,
	TextInput,
	Animated,
	Easing,
	Keyboard,
	Platform,
  } from 'react-native';
  import React, { useState, useEffect, useRef } from 'react';
  import SearchSvg from '../assets/Svgs/SearchSvg';
  import { useGlobalContext } from '../Context/GlobalContext';
  
  const AnimatedUsersSearchBar = () => {
	const [input, setInput] = useState('');
	const [isExpanded, setIsExpanded] = useState(false);
	const animation = useRef(new Animated.Value(0)).current;
	const inputRef = useRef(null);
	const { users, setUsers } = useGlobalContext();
	const [originalData, setOriginalData] = useState([]);
  
	useEffect(() => {
	  if (users && users.length > 0 && originalData.length === 0) {
		setOriginalData(users);
	  }
	}, [users]);
  
	// Handle keyboard dismiss
	useEffect(() => {
	  if (!isExpanded) {
		Keyboard.dismiss();
	  }
	}, [isExpanded]);
  
	const handleSearch = (text) => {
	  setInput(text);
  
	  // Safety check for originalData
	  if (!originalData || originalData.length === 0) {
		return;
	  }
  
	  if (text.trim() === '') {
		setUsers(originalData);
		return;
	  }
  
	  const filteredData = originalData.filter((item) => {
		if (!item) return false;
		
		return (
		  (item.userName?.toLowerCase().includes(text.toLowerCase()) || false) ||
		  (item.email?.toLowerCase().includes(text.toLowerCase()) || false) ||
		  (item.password?.toLowerCase().includes(text.toLowerCase()) || false)
		);
	  });
  
	  setUsers(filteredData);
	};
  
	const toggleSearchBar = () => {
	  setIsExpanded((prev) => {
		const newExpandedState = !prev;
  
		Animated.timing(animation, {
		  toValue: newExpandedState ? 1 : 0,
		  duration: 300,
		  easing: Easing.inOut(Easing.ease),
		  useNativeDriver: false,
		}).start(() => {
		  // Focus or blur the input after animation completes
		  if (newExpandedState && inputRef.current) {
			inputRef.current.focus();
		  }
		  
		  // Clear search when closing
		  if (!newExpandedState) {
			setInput('');
			setUsers(originalData);
		  }
		});
  
		return newExpandedState;
	  });
	};
  
	const animatedInputWidth = animation.interpolate({
	  inputRange: [0, 1],
	  outputRange: [0, 140],
	});
  
	const animatedBackgroundColor = animation.interpolate({
	  inputRange: [0, 1],
	  outputRange: ['#E0FFD3', 'white'],
	});
  
	const animatedElevation = animation.interpolate({
	  inputRange: [0, 1],
	  outputRange: [0, 2],
	});
  
	// iOS shadow styles
	const shadowStyle = Platform.OS === 'ios' ? {
	  shadowColor: '#000',
	  shadowOffset: { width: 0, height: isExpanded ? 2 : 0 },
	  shadowOpacity: isExpanded ? 0.2 : 0,
	  shadowRadius: isExpanded ? 2 : 0,
	} : {};
  
	return (
	  <Animated.View
		style={[
		  styles.mainContainer,
		  {
			backgroundColor: animatedBackgroundColor,
			elevation: animatedElevation,
			...shadowStyle,
		  },
		]}
	  >
		<TouchableOpacity
		  style={styles.searchIconContainer}
		  onPress={toggleSearchBar}
		  activeOpacity={0.7}
		>
		  <SearchSvg />
		</TouchableOpacity>
		<Animated.View
		  style={[styles.animatedInputContainer, { width: animatedInputWidth }]}
		>
		  <TextInput
			ref={inputRef}
			placeholder="Search"
			placeholderTextColor="#A9A9A9"
			style={styles.textInput}
			value={input}
			onChangeText={handleSearch}
			onBlur={() => {
			  if (input.trim() === '') {
				toggleSearchBar();
			  }
			}}
		  />
		</Animated.View>
	  </Animated.View>
	);
  };
  
  export default AnimatedUsersSearchBar;
  
  const styles = StyleSheet.create({
	mainContainer: {
	  height: 40,
	  flexDirection: 'row',
	  alignItems: 'center',
	  borderRadius: 10,
	  paddingHorizontal: 10,
	  overflow: 'hidden',
	  zIndex: 1,
	},
	textInput: {
	  flex: 1,
	  backgroundColor: 'transparent',
	  height: '100%',
	  fontSize: 16,
	  paddingHorizontal: 10,
	  color: '#000',
	},
	searchIconContainer: {
	  justifyContent: 'center',
	  alignItems: 'center',
	  padding: 2,
	},
	animatedInputContainer: {
	  height: '100%',
	  overflow: 'hidden',
	},
  });