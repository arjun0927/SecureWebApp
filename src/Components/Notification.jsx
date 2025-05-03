import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
	FlatList,
	Image,
	Dimensions,
	TextInput,
	Animated,
	Easing,
	Modal,
	StatusBar,
	PanResponder,
	ActivityIndicator,
  } from 'react-native';
  import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
  import Feather from 'react-native-vector-icons/Feather';
  import { 
	responsiveFontSize,
	responsiveHeight,
	responsiveWidth 
  } from 'react-native-responsive-dimensions';
  import SearchSvg from '../assets/Svgs/SearchSvg';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import axios from 'axios';
  import Video from 'react-native-video';
  import { useFocusEffect } from '@react-navigation/native';
import Backhandler from './Backhandler';
  
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  const Notification = ({ navigation }) => {
	// States
	const [features, setFeatures] = useState([]);
	const [filteredFeatures, setFilteredFeatures] = useState([]);
	const [videoState, setVideoState] = useState({});
	const [enlargedImage, setEnlargedImage] = useState(null);
	const [enlargedVideo, setEnlargedVideo] = useState(null);
	const [input, setInput] = useState('');
	const [isExpanded, setIsExpanded] = useState(false);
	const [isFullScreen, setIsFullScreen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [loadingError, setLoadingError] = useState(null);
	
	// Refs
	const animation = useRef(new Animated.Value(0)).current;
	const flatListRef = useRef(null);

	Backhandler();
	
	const scale = useRef(new Animated.Value(1)).current;
	const lastScale = useRef(1);
	const offsetX = useRef(new Animated.Value(0)).current;
	const offsetY = useRef(new Animated.Value(0)).current;
	const lastX = useRef(0);
	const lastY = useRef(0);
	const initialDistance = useRef(null);
	const lastTap = useRef(null);
	const doubleTapTimeout = useRef(null);
  
	// API call with error handling
	const getNotification = useCallback(async () => {
	  setIsLoading(true);
	  setLoadingError(null);
	  try {
		const data = await AsyncStorage.getItem('loginInfo');
		const parsedToken = JSON.parse(data);
		const token = parsedToken?.token;
		if (!token) {
		  throw new Error('Authentication token not found');
		}
		
		const response = await axios.get(
		  'https://secure.ceoitbox.com/api/getAllFeatures',
		  {
			headers: { Authorization: `Bearer ${token}` },
		  }
		);
  
		if (response.data.features) {
		  setFeatures(response.data.features);
		  setFilteredFeatures(response.data.features);
		} else {
		  setFeatures([]);
		  setFilteredFeatures([]);
		}
	  } catch (error) {
		console.error('Error in fetching notifications:', error);
		setLoadingError(error.message || 'Failed to load updates');
	  } finally {
		setIsLoading(false);
	  }
	}, []);
  
	// Fetch data when screen comes into focus
	useFocusEffect(
	  useCallback(() => {
		getNotification();
		
		return () => {
		  // Reset video states when leaving screen
		  setVideoState({});
		};
	  }, [getNotification])
	);
  
	// Handle status bar visibility
	useEffect(() => {
	  const showStatusBar = !enlargedVideo && !enlargedImage;
	  StatusBar.setHidden(!showStatusBar);
	  return () => StatusBar.setHidden(false);
	}, [enlargedVideo, enlargedImage]);
  
	// Create pan responder for image zooming - memoized for better performance
	const panResponder = useMemo(() => 
	  PanResponder.create({
		onStartShouldSetPanResponder: () => true,
		onStartShouldSetPanResponderCapture: () => true,
		onMoveShouldSetPanResponder: () => true,
		onMoveShouldSetPanResponderCapture: () => true,
		
		onPanResponderGrant: () => {
		  lastX.current = offsetX._value;
		  lastY.current = offsetY._value;
		},
		
		onPanResponderMove: (evt, gestureState) => {
		  // Handle pinch zoom
		  if (evt.nativeEvent.changedTouches.length >= 2) {
			const touches = evt.nativeEvent.changedTouches;
			const touchA = touches[0];
			const touchB = touches[1];
			
			// Calculate distance between two touch points
			const distance = Math.sqrt(
			  Math.pow(touchA.pageX - touchB.pageX, 2) +
			  Math.pow(touchA.pageY - touchB.pageY, 2)
			);
			
			// Initial distance on touch start
			if (!initialDistance.current) {
			  initialDistance.current = distance;
			  return;
			}
			
			// Calculate new scale
			const newScale = (distance / initialDistance.current) * lastScale.current;
			
			// Limit scale between 1 and 3
			if (newScale >= 1 && newScale <= 3) {
			  scale.setValue(newScale);
			}
		  } 
		  // Handle pan when zoomed in
		  else if (lastScale.current > 1) {
			// Calculate boundaries to prevent excessive panning
			const maxOffsetX = (lastScale.current - 1) * screenWidth / 2;
			const maxOffsetY = (lastScale.current - 1) * screenHeight / 2;
			
			const newOffsetX = lastX.current + gestureState.dx;
			const newOffsetY = lastY.current + gestureState.dy;
			
			// Keep within boundaries
			const boundedOffsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, newOffsetX));
			const boundedOffsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, newOffsetY));
			
			offsetX.setValue(boundedOffsetX);
			offsetY.setValue(boundedOffsetY);
		  }
		},
		
		onPanResponderRelease: () => {
		  lastScale.current = scale._value;
		  initialDistance.current = null;
		  
		  // If scale is less than 1.1, reset to original position
		  if (scale._value < 1.1) {
			resetZoom();
		  }
		},
		
		onPanResponderTerminate: () => {
		  lastScale.current = scale._value;
		  initialDistance.current = null;
		},
	  }),
	[]);
  
	// Helper functions
	const resetZoom = useCallback(() => {
	  Animated.parallel([
		Animated.spring(scale, {
		  toValue: 1,
		  useNativeDriver: true,
		}),
		Animated.spring(offsetX, {
		  toValue: 0,
		  useNativeDriver: true,
		}),
		Animated.spring(offsetY, {
		  toValue: 0,
		  useNativeDriver: true,
		}),
	  ]).start(() => {
		lastScale.current = 1;
		lastX.current = 0;
		lastY.current = 0;
	  });
	}, [scale, offsetX, offsetY]);
  
	const handleDoubleTap = useCallback(() => {
	  if (lastScale.current > 1) {
		// Reset zoom
		resetZoom();
	  } else {
		// Zoom in
		Animated.spring(scale, {
		  toValue: 2,
		  useNativeDriver: true,
		  friction: 7,
		}).start(() => {
		  lastScale.current = 2;
		});
	  }
	}, [resetZoom, scale]);
  
	const handleImagePress = useCallback(() => {
	  const now = Date.now();
	  if (lastTap.current && (now - lastTap.current) < 300) {
		handleDoubleTap();
		lastTap.current = null;
		clearTimeout(doubleTapTimeout.current);
	  } else {
		lastTap.current = now;
		clearTimeout(doubleTapTimeout.current);
		doubleTapTimeout.current = setTimeout(() => {
		  lastTap.current = null;
		}, 300);
	  }
	}, [handleDoubleTap]);
  
	// Get direct video URL for playing
	const getDirectVideoUrl = useCallback((url) => {
	  if (!url) return null;
	  const match = url.match(/file\/d\/(.*?)\/preview/);
	  return match ? `https://drive.google.com/uc?export=download&id=${match[1]}` : url;
	}, []);
  
	// Toggle video play/pause with performance optimization
	const togglePlayPause = useCallback((videoUrl) => {
	  setVideoState((prevState) => ({
		...prevState,
		[videoUrl]: {
		  playing: !(prevState[videoUrl]?.playing || false),
		},
	  }));
	}, []);
  
	// Search functionality with debounce
	const searchTimeoutRef = useRef(null);
	
	const handleSearch = useCallback((text) => {
	  setInput(text);
	  
	  // Clear any existing timeout
	  if (searchTimeoutRef.current) {
		clearTimeout(searchTimeoutRef.current);
	  }
	  
	  // Set a new timeout
	  searchTimeoutRef.current = setTimeout(() => {
		if (text.trim() === '') {
		  setFilteredFeatures(features);
		  return;
		}
  
		const filteredData = features.filter((feature) => {
		  const featureName = feature?.featureName?.toLowerCase() || '';
		  const createdDate = new Date(feature.createdDate).toLocaleDateString().toLowerCase();
		  return featureName.includes(text.toLowerCase()) || createdDate.includes(text.toLowerCase());
		});
  
		setFilteredFeatures(filteredData);
	  }, 300); // 300ms debounce
	}, [features]);
  
	// Cleanup search timeout on unmount
	useEffect(() => {
	  return () => {
		if (searchTimeoutRef.current) {
		  clearTimeout(searchTimeoutRef.current);
		}
		if (doubleTapTimeout.current) {
		  clearTimeout(doubleTapTimeout.current);
		}
	  };
	}, []);
  
	// Toggle search bar animation
	const toggleSearchBar = useCallback(() => {
	  setIsExpanded((prev) => {
		const newExpandedState = !prev;
  
		Animated.timing(animation, {
		  toValue: newExpandedState ? 1 : 0,
		  duration: 300,
		  easing: Easing.inOut(Easing.ease),
		  useNativeDriver: false,
		}).start();
  
		if (!newExpandedState) {
		  setInput(''); // Clear input when closing
		  setFilteredFeatures(features); // Reset filtered results
		}
  
		return newExpandedState;
	  });
	}, [animation, features]);
  
	// Animation interpolations
	const animatedInputWidth = animation.interpolate({
	  inputRange: [0, 1],
	  outputRange: [0, responsiveWidth(40)], // Responsive width
	});
  
	const animatedBackgroundColor = animation.interpolate({
	  inputRange: [0, 1],
	  outputRange: ['#F4FAF4', 'white'],
	});
  
	const animatedElevation = animation.interpolate({
	  inputRange: [0, 1],
	  outputRange: [0, 3],
	});
  
	// Toggle fullscreen mode for video
	const toggleFullScreen = useCallback(() => {
	  setIsFullScreen((prev) => !prev);
	}, []);
  
	// Handle errors in media loading
	const handleMediaError = useCallback((error, type) => {
	  console.error(`Error loading ${type}:`, error);
	  // Could implement error UI here
	}, []);
  
	// Render feature item for FlatList
	const renderFeatureItem = useCallback(({ item }) => (
	  <View style={styles.featureCard}>
		{/* Video or Image */}
		{item.videoUrl ? (
		  <View style={styles.mediaContainer}>
			<Video
			  source={{ uri: getDirectVideoUrl(item.videoUrl) }}
			  style={styles.media}
			  resizeMode="cover"
			  paused={!videoState[item.videoUrl]?.playing}
			  onError={(e) => handleMediaError(e, 'video')}
			  poster="https://via.placeholder.com/300x200?text=Loading..."
			  posterResizeMode="cover"
			  repeat={true}
			  ignoreSilentSwitch="ignore"
			/>
			<TouchableOpacity
			  style={[
				styles.playIcon, 
				videoState[item.videoUrl]?.playing && styles.playIconPlaying
			  ]}
			  onPress={() => togglePlayPause(item.videoUrl)}
			  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
			>
			  <Feather
				name={videoState[item.videoUrl]?.playing ? 'pause' : 'play'}
				size={responsiveFontSize(2.5)}
				color="#FFF"
			  />
			</TouchableOpacity>
			<TouchableOpacity
			  style={styles.enlargeIcon}
			  onPress={() => setEnlargedVideo(item.videoUrl)}
			  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
			>
			  <Feather name="maximize" size={responsiveFontSize(2)} color="#FFF" />
			</TouchableOpacity>
		  </View>
		) : item.imgUrl ? (
		  <View style={styles.mediaContainer}>
			<Image
			  source={{ uri: item.imgUrl }}
			  style={styles.media}
			  resizeMode="cover"
			  onError={(e) => handleMediaError(e, 'image')}
			  // Add a default placeholder image
			/>
			<TouchableOpacity
			  style={styles.enlargeIcon}
			  onPress={() => setEnlargedImage(item.imgUrl)}
			  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
			>
			  <Feather name="maximize" size={responsiveFontSize(2)} color="#FFF" />
			</TouchableOpacity>
		  </View>
		) : (
		  <View style={[styles.media, styles.noMediaPlaceholder]}>
			<Feather name="image" size={responsiveFontSize(3)} color="#CCC" />
		  </View>
		)}
  
		<View style={styles.featureDetails}>
		  <Text style={styles.featureDate}>
			{new Date(item.createdDate).toLocaleDateString()}
		  </Text>
		  <Text style={styles.featureName} numberOfLines={2} ellipsizeMode="tail">
			{item.featureName}
		  </Text>
		</View>
	  </View>
	), [videoState, togglePlayPause, getDirectVideoUrl, handleMediaError]);
  
	// Empty list component
	const renderEmptyList = useCallback(() => (
	  <View style={styles.emptyContainer}>
		{isLoading ? (
		  <ActivityIndicator size="large" color="#4CAF50" />
		) : loadingError ? (
		  <>
			<Feather name="alert-circle" size={responsiveFontSize(5)} color="#FF6B6B" />
			<Text style={styles.emptyText}>{loadingError}</Text>
			<TouchableOpacity style={styles.retryButton} onPress={getNotification}>
			  <Text style={styles.retryButtonText}>Retry</Text>
			</TouchableOpacity>
		  </>
		) : (
		  <>
			<Feather name="inbox" size={responsiveFontSize(5)} color="#ABABAB" />
			<Text style={styles.emptyText}>
			  {input.length > 0 
				? "No updates match your search criteria" 
				: "No updates available yet"}
			</Text>
		  </>
		)}
	  </View>
	), [isLoading, loadingError, input.length, getNotification]);
  
	return (
	  <KeyboardAvoidingView
		style={{ flex: 1 }}
		behavior={Platform.OS === 'ios' ? 'padding' : undefined}
	  >
		<View style={styles.container}>
		  {/* Header with Search Bar */}
		  <View style={styles.header}>
			<View style={styles.headerTitleContainer}>
			  <TouchableOpacity
				style={styles.backButton}
				onPress={() => navigation.goBack()}
				hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
			  >
				<Feather name="chevron-left" size={responsiveFontSize(2.4)} color="black" />
			  </TouchableOpacity>
			  <Text style={styles.headerTitle}>What's New ✨</Text>
			</View>
			<Animated.View
			  style={[
				styles.searchBarContainer,
				{
				  backgroundColor: animatedBackgroundColor,
				  elevation: animatedElevation,
				},
			  ]}
			>
			  <TouchableOpacity 
				style={styles.searchIconContainer} 
				onPress={toggleSearchBar}
				// hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
			  >
				<SearchSvg />
			  </TouchableOpacity>
			  <Animated.View style={[styles.animatedInputContainer, { width: animatedInputWidth }]}>
				<TextInput
				  placeholder="Search"
				  placeholderTextColor="#A9A9A9"
				  style={styles.textInput}
				  value={input}
				  onChangeText={handleSearch}
				  autoFocus={isExpanded}
				  returnKeyType="search"
				/>
				{input.length > 0 && (
				  <TouchableOpacity 
					style={styles.clearButton}
					onPress={() => handleSearch('')}
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				  >
					<Feather name="x-circle" size={responsiveFontSize(1.8)} color="#888" />
				  </TouchableOpacity>
				)}
			  </Animated.View>
			</Animated.View>
		  </View>
  
		  {/* Intro Text */}
		  <View style={styles.introTextContainer}>
			<Text style={styles.introText}>
			  We are excited to introduce the latest updates to our helpdesk dashboard!
			</Text>
		  </View>
  
		  {/* Features List */}
		  <FlatList
			ref={flatListRef}
			data={filteredFeatures}
			renderItem={renderFeatureItem}
			keyExtractor={item => item._id}
			contentContainerStyle={styles.featuresContainer}
			ListEmptyComponent={renderEmptyList}
			showsVerticalScrollIndicator={false}
			refreshing={isLoading}
			onRefresh={getNotification}
			initialNumToRender={6}
			maxToRenderPerBatch={4}
			windowSize={5}
		  />
		</View>
  
		{/* Image Modal with zoom implementation */}
		{enlargedImage && (
		  <Modal 
			transparent={true} 
			animationType="fade" 
			visible={enlargedImage !== null}
			statusBarTranslucent={true}
			onRequestClose={() => {
			  resetZoom();
			  setEnlargedImage(null);
			}}
		  >
			<View style={styles.modalOverlay}>
			  <Animated.View 
				style={{
				  transform: [
					{ scale },
					{ translateX: offsetX },
					{ translateY: offsetY }
				  ]
				}}
				{...panResponder}
			  >
				<TouchableOpacity 
				  activeOpacity={1}
				  onPress={handleImagePress}
				>
				  <Image
					source={{ uri: enlargedImage }}
					style={styles.enlargedImage}
					resizeMode="contain"
					onError={(e) => handleMediaError(e, 'enlarged image')}
				  />
				</TouchableOpacity>
			  </Animated.View>
			  <View style={styles.imageControlsOverlay}>
				<TouchableOpacity
				  style={styles.closeIcon}
				  onPress={() => {
					resetZoom();
					setEnlargedImage(null);
				  }}
				  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
				  <Feather name="x" size={responsiveFontSize(3)} color="#FFF" />
				</TouchableOpacity>
				<Text style={styles.zoomInstructions}>
				  Pinch to zoom • Double tap to {lastScale.current > 1 ? "reset" : "zoom"}
				</Text>
			  </View>
			</View>
		  </Modal>
		)}
  
		{/* Video Fullscreen Modal */}
		{enlargedVideo && (
		  <Modal
			visible={enlargedVideo !== null}
			transparent={false}
			animationType="fade"
			statusBarTranslucent={true}
			onRequestClose={() => setEnlargedVideo(null)}
		  >
			<View style={styles.fullscreenVideoContainer}>
			  <Video
				source={{ uri: getDirectVideoUrl(enlargedVideo) }}
				style={styles.fullscreenVideo}
				resizeMode={isFullScreen ? "cover" : "contain"}
				controls={true}
				paused={false}
				fullscreen={isFullScreen}
				ignoreSilentSwitch="ignore"
				onError={(e) => handleMediaError(e, 'fullscreen video')}
			  />
			  <View style={styles.videoControlsContainer}>
				<TouchableOpacity
				  style={styles.closeIcon}
				  onPress={() => setEnlargedVideo(null)}
				  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
				  <Feather name="x" size={responsiveFontSize(3)} color="#FFF" />
				</TouchableOpacity>
				<TouchableOpacity
				  style={styles.fullscreenIcon}
				  onPress={toggleFullScreen}
				  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
				  <Feather 
					name={isFullScreen ? "minimize" : "maximize"} 
					size={responsiveFontSize(3)} 
					color="#FFF" 
				  />
				</TouchableOpacity>
			  </View>
			</View>
		  </Modal>
		)}
	  </KeyboardAvoidingView>
	);
  };
  
  export default Notification;
  
  const styles = StyleSheet.create({
	container: { 
	  flex: 1, 
	  backgroundColor: '#F4FAF4' 
	},
	header: {
	  flexDirection: 'row',
	  justifyContent: 'space-between',
	  alignItems: 'center',
	  paddingTop: Platform.OS === 'ios' ? responsiveHeight(5) : responsiveHeight(2),
	  paddingHorizontal: responsiveWidth(3),
	  paddingBottom: responsiveHeight(1),
	},
	headerTitleContainer: {
	  flexDirection: 'row',
	  alignItems: 'center',
	},
	backButton: {
	  padding: responsiveWidth(1),
	},
	searchBarContainer: {
	  height: responsiveHeight(5),
	  flexDirection: 'row',
	  alignItems: 'center',
	  borderRadius: 10,
	  paddingHorizontal: responsiveWidth(2.5),
	  overflow: 'hidden',
	},
	searchIconContainer: { 
	  justifyContent: 'center', 
	  alignItems: 'center' 
	},
	animatedInputContainer: { 
	  height: '100%', 
	  overflow: 'hidden',
	  flexDirection: 'row',
	  alignItems: 'center',
	},
	textInput: { 
	  flex: 1, 
	  backgroundColor: 'transparent', 
	  height: '100%', 
	  fontSize: responsiveFontSize(1.8), 
	  paddingHorizontal: responsiveWidth(2.5),
	  color: '#333',
	},
	clearButton: {
	  padding: 5,
	},
	headerTitle: { 
	  color: '#222327', 
	  fontSize: responsiveFontSize(2.3), 
	  fontWeight: '500', 
	  marginLeft: responsiveWidth(2) 
	},
	introTextContainer: {
	  marginHorizontal: responsiveWidth(5),
	  marginBottom: responsiveHeight(2),
	  marginTop: responsiveHeight(1),
	},
	introText: {
	  fontSize: responsiveFontSize(1.7),
	  color: '#181818',
	  fontWeight: '400',
	  alignSelf: 'center',
	  textAlign: 'center',
	  fontStyle: 'normal',
	  lineHeight: responsiveHeight(2.5),
	  letterSpacing: 0.5,
	  fontFamily: 'Montserrat',
	},
	featuresContainer: { 
	  paddingHorizontal: responsiveWidth(4),
	  paddingBottom: responsiveHeight(2),
	  flexGrow: 1,
	},
	featureCard: {
	  backgroundColor: '#FFF',
	  borderRadius: 10,
	  marginBottom: responsiveHeight(1.5),
	  padding: responsiveWidth(2.5),
	  flexDirection: 'row',
	  alignItems: 'center',
	  elevation: 3,
	  shadowColor: '#000',
	  shadowOffset: { width: 0, height: 2 },
	  shadowOpacity: 0.1,
	  shadowRadius: 3,
	  height: responsiveHeight(15),
	},
	mediaContainer: {
	  position: 'relative',
	  width: responsiveWidth(30),
	  height: responsiveHeight(12),
	  marginRight: responsiveWidth(3),
	  borderRadius: 10,
	  overflow: 'hidden',
	},
	media: { 
	  width: responsiveWidth(30), 
	  height: responsiveHeight(12), 
	  borderRadius: 10,
	},
	noMediaPlaceholder: {
	  backgroundColor: '#F0F0F0',
	  justifyContent: 'center',
	  alignItems: 'center',
	},
	featureDetails: { 
	  flex: 1,
	  height: '100%',
	  justifyContent: 'center',
	},
	featureDate: { 
	  fontSize: responsiveFontSize(1.5), 
	  color: '#888', 
	  marginBottom: responsiveHeight(0.5) 
	},
	featureName: { 
	  fontSize: responsiveFontSize(2), 
	  color: '#222', 
	  fontWeight: '600',
	  flexShrink: 1,
	},
	enlargeIcon: {
	  position: 'absolute',
	  bottom: responsiveHeight(0.5),
	  right: responsiveWidth(1),
	  backgroundColor: 'rgba(0, 0, 0, 0.5)',
	  padding: responsiveWidth(1),
	  borderRadius: 15,
	},
	playIcon: {
	  position: 'absolute',
	  top: '50%',
	  left: '50%',
	  marginTop: -responsiveHeight(2.5),
	  marginLeft: -responsiveWidth(5),
	  backgroundColor: 'rgba(0, 0, 0, 0.5)',
	  borderRadius: responsiveWidth(5),
	  width: responsiveWidth(10),
	  height: responsiveWidth(10),
	  justifyContent: 'center',
	  alignItems: 'center',
	  zIndex: 1,
	},
	playIconPlaying: {
	  backgroundColor: 'rgba(0, 0, 0, 0.6)',
	},
	modalOverlay: {
	  flex: 1,
	  backgroundColor: 'rgba(0, 0, 0, 0.9)',
	  justifyContent: 'center',
	  alignItems: 'center',
	},
	enlargedImage: {
	  width: screenWidth,
	  height: screenHeight * 0.8,
	},
	imageControlsOverlay: {
	  position: 'absolute',
	  top: 0,
	  left: 0,
	  right: 0,
	  padding: responsiveHeight(3),
	  flexDirection: 'row',
	  justifyContent: 'space-between',
	  alignItems: 'center',
	},
	zoomInstructions: {
	  color: 'white',
	  backgroundColor: 'rgba(0, 0, 0, 0.5)',
	  padding: responsiveWidth(2),
	  borderRadius: 20,
	  fontSize: responsiveFontSize(1.4),
	},
	fullscreenVideoContainer: {
	  flex: 1,
	  backgroundColor: '#000',
	  justifyContent: 'center',
	},
	fullscreenVideo: {
	  width: screenWidth,
	  height: screenHeight,
	},
	videoControlsContainer: {
	  position: 'absolute',
	  top: Platform.OS === 'ios' ? 50 : 30,
	  right: 20,
	  flexDirection: 'row',
	},
	closeIcon: {
	  backgroundColor: 'rgba(0, 0, 0, 0.5)',
	  padding: responsiveWidth(2.5),
	  borderRadius: 25,
	},
	fullscreenIcon: {
	  backgroundColor: 'rgba(0, 0, 0, 0.5)',
	  padding: responsiveWidth(2.5),
	  borderRadius: 25,
	  marginLeft: 10,
	},
	emptyContainer: {
	  flex: 1,
	  justifyContent: 'center',
	  alignItems: 'center',
	  height: responsiveHeight(40),
	},
	emptyText: {
	  fontSize: responsiveFontSize(2),
	  color: '#888',
	  textAlign: 'center',
	  marginTop: responsiveHeight(2),
	  marginHorizontal: responsiveWidth(10),
	},
	retryButton: {
	  marginTop: responsiveHeight(2),
	  backgroundColor: '#4CAF50',
	  paddingVertical: responsiveHeight(1),
	  paddingHorizontal: responsiveWidth(6),
	  borderRadius: 20,
	},
	retryButtonText: {
	  color: 'white',
	  fontSize: responsiveFontSize(1.8),
	  fontWeight: '500',
	},
  });