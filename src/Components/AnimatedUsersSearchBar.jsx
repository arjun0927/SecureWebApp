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
	Keyboard,
} from 'react-native';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import SearchSvg from '../assets/Svgs/SearchSvg';
import { useGlobalContext } from '../Context/GlobalContext';
import {
	responsiveFontSize,
	responsiveWidth,
	responsiveHeight,
} from 'react-native-responsive-dimensions';
import AntDesign from 'react-native-vector-icons/AntDesign';
import debounce from 'lodash/debounce';

const AnimatedUsersSearchBar = () => {
	const [input, setInput] = useState('');
	const [isExpanded, setIsExpanded] = useState(false);
	const animation = useRef(new Animated.Value(0)).current;
	const { users, setUsers } = useGlobalContext();
	const [originalData, setOriginalData] = useState(users);
	const { width: windowWidth, height: windowHeight } = useWindowDimensions();

	// Determine if we're on a small screen
	const isSmallScreen = windowWidth < 375;
	const isMediumScreen = windowWidth >= 375 && windowWidth < 768;
	const isLargeScreen = windowWidth >= 768;

	const getSearchWidth = useCallback(() => {
		if (isSmallScreen) return windowWidth * 0.35;
		if (isMediumScreen) return windowWidth * 0.35;
		return windowWidth * 0.42;
	  }, [windowWidth, isSmallScreen, isMediumScreen, isLargeScreen]);

	  const getSearchIconSize = useCallback(() => {
		if (isSmallScreen) return responsiveFontSize(2.1);
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

	// Update the originalData initialization and management
	useEffect(() => {
		// Initialize originalData when users first loads
		if (users?.length > 0 && originalData.length === 0) {
			setOriginalData([...users]);
		}
	}, [users]);

	// Handle keyboard dismiss
	useEffect(() => {
		if (!isExpanded) {
			Keyboard.dismiss();
		}
	}, [isExpanded]);

	const debouncedSearch = useCallback(
		(text) => {
			const startTime = performance.now();

			// If search is empty, reset to original data immediately
			if (!text || text.trim() === '') {
				setUsers([...originalData]);
				return;
			}

			const searchTerm = text.toLowerCase();
			const filteredData = originalData.filter((item) => {
				const userName = item?.userName?.toLowerCase() || '';
				const email = item?.email?.toLowerCase() || '';
				const password = item?.password?.toLowerCase() || '';

				const matchesBasicInfo =
					userName.includes(searchTerm) ||
					email.includes(searchTerm) ||
					password.includes(searchTerm);

				const matchesTableAccess = item?.tablesAccess?.some((table) => {
					const tableName = table?.tableName?.toLowerCase() || '';
					const role = table?.role?.toLowerCase() || '';

					return (
						tableName.includes(searchTerm) ||
						role.includes(searchTerm)
					);
				});

				return matchesBasicInfo || matchesTableAccess;
			});

			setUsers(filteredData);
			const endTime = performance.now();
			// console.log(`Search completed in ${(endTime - startTime).toFixed(2)}ms`);
			// console.log(`Found ${filteredData.length} results`);
		},
		[originalData] // Keep originalData as dependency
	);

	// Create debounced function ref
	const debouncedSearchRef = useRef(null);

	useEffect(() => {
		// Initialize debounced function
		debouncedSearchRef.current = debounce((text) => {
			debouncedSearch(text);
		}, 300); // 300ms delay

		return () => {
			// Cleanup
			if (debouncedSearchRef.current?.cancel) {
				debouncedSearchRef.current.cancel();
			}
		};
	}, [debouncedSearch]);

	const handleSearch = (text) => {
		setInput(text);
		if (!text || text.trim() === '') {
			// Immediately reset to original data when search is cleared
			setUsers([...originalData]);
		} else {
			debouncedSearchRef.current(text);
		}
	};

	const handleClear = () => {
		setInput('');
		setUsers([...originalData]);
	};

	const toggleSearchBar = () => {
		setIsExpanded((prev) => {
			const newExpandedState = !prev;

			// If closing the search bar, clear the input and reset to original data
			if (!newExpandedState) {
				setInput('');
				// Use the latest originalData
				setUsers([...originalData]);
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

	const animatedContainerWidth = animation.interpolate({
		inputRange: [0, 1],
		outputRange: [searchIconSize + responsiveWidth(4), getSearchWidth() + responsiveWidth(8)],
	});

	const searchIconSize = getSearchIconSize();

	return (
		<Animated.View
			style={[
				styles.mainContainer,
				{
					backgroundColor: animatedBackgroundColor,
					height: isSmallScreen ? responsiveHeight(5.2) :
						isMediumScreen ? responsiveHeight(5.5) :
							responsiveHeight(5),
					borderRadius: isSmallScreen ? responsiveWidth(1.5) : responsiveWidth(2),
					paddingVertical: isSmallScreen ? responsiveHeight(0.5) :
						isMediumScreen ? responsiveHeight(0.6) :
							responsiveHeight(0.5),
					// Animated width
					width: animatedContainerWidth,
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

			{/* Fixed position clear button */}
			<View style={styles.clearButtonContainer}>
				{isExpanded && input.length > 0 && (
					<TouchableOpacity
						onPress={handleClear}
						style={styles.clearButton}
						hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
					>
						<View style={styles.clearIconContainer}>
							<View style={styles.clearIcon}>
								<AntDesign name='close' size={responsiveFontSize(2.2)} color={'#888'} />
							</View>
						</View>
					</TouchableOpacity>
				)}
			</View>
		</Animated.View>
	);
};

export default AnimatedUsersSearchBar;

const styles = StyleSheet.create({
	mainContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-start',
		overflow: 'hidden',
		maxWidth: '100%',
		position: 'relative',
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
	clearButtonContainer: {
		position: 'absolute',
		right: responsiveWidth(2),
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
	},
	clearButton: {
		justifyContent: 'center',
		alignItems: 'center',
		padding: responsiveWidth(1),
	},
	clearIconContainer: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	clearIcon: {
		width: '100%',
		height: '100%',
		marginRight: 5,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
	},
});