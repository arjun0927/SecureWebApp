import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Image,
	Dimensions,
	TextInput,
	Animated,
	Easing,
	Modal,
	StatusBar,
	PanResponder,
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import SearchSvg from '../assets/Svgs/SearchSvg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Video from 'react-native-video';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const Notification = ({ navigation }) => {
	const [features, setFeatures] = useState([]);
	const [filteredFeatures, setFilteredFeatures] = useState([]);
	const [videoState, setVideoState] = useState({}); // Track individual video states
	const [enlargedImage, setEnlargedImage] = useState(null);
	const [enlargedVideo, setEnlargedVideo] = useState(null); // State to track enlarged video
	const [input, setInput] = useState('');
	const [isExpanded, setIsExpanded] = useState(false);
	const [isFullScreen, setIsFullScreen] = useState(false);
	const animation = useRef(new Animated.Value(0)).current;
	
	// Image zoom state
	const scale = useRef(new Animated.Value(1)).current;
	const lastScale = useRef(1);
	const offsetX = useRef(new Animated.Value(0)).current;
	const offsetY = useRef(new Animated.Value(0)).current;
	const lastX = useRef(0);
	const lastY = useRef(0);
	const initialDistance = useRef(null);

	// Create pan responder for image zooming
	const panResponder = useRef(
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
				// Handle pan
				else if (lastScale.current > 1) {
					// Only allow panning when zoomed in
					offsetX.setValue(lastX.current + gestureState.dx);
					offsetY.setValue(lastY.current + gestureState.dy);
				}
			},
			
			onPanResponderRelease: () => {
				lastScale.current = scale._value;
				initialDistance.current = null;
				
				// If scale is less than 1.1, reset to original position
				if (scale._value < 1.1) {
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
				}
			},
			
			onPanResponderTerminate: () => {
				lastScale.current = scale._value;
				initialDistance.current = null;
			},
		})
	).current;

	// Reset zoom values when closing the modal
	const resetZoom = () => {
		scale.setValue(1);
		offsetX.setValue(0);
		offsetY.setValue(0);
		lastScale.current = 1;
		lastX.current = 0;
		lastY.current = 0;
		initialDistance.current = null;
	};

	// Double tap to zoom
	const handleDoubleTap = () => {
		if (lastScale.current > 1) {
			// Reset zoom
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
		} else {
			// Zoom in
			Animated.spring(scale, {
				toValue: 2,
				useNativeDriver: true,
			}).start(() => {
				lastScale.current = 2;
			});
		}
	};

	// Handle double tap timer
	const lastTap = useRef(null);
	const handleImagePress = () => {
		const now = Date.now();
		if (lastTap.current && (now - lastTap.current) < 300) {
			handleDoubleTap();
			lastTap.current = null;
		} else {
			lastTap.current = now;
		}
	};

	// Fetch Notifications
	const getNotification = async () => {
		try {
			const token = await AsyncStorage.getItem('token');
			const response = await axios.get(
				'https://secure.ceoitbox.com/api/getAllFeatures',
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			if (response.data.features) {
				setFeatures(response.data.features);
				setFilteredFeatures(response.data.features);
			}
		} catch (error) {
			console.error('Error in fetching notifications:', error);
		}
	};

	useEffect(() => {
		getNotification();
	}, []);

	useEffect(() => {
		// Hide status bar when in fullscreen video mode
		if (enlargedVideo) {
			StatusBar.setHidden(true);
		} else {
			StatusBar.setHidden(false);
		}

		return () => StatusBar.setHidden(false);
	}, [enlargedVideo]);

	// Generate Direct Video URL
	const getDirectVideoUrl = (url) => {
		const match = url.match(/file\/d\/(.*?)\/preview/);
		return match ? `https://drive.google.com/uc?export=download&id=${match[1]}` : url;
	};

	// Toggle Video Play/Pause
	const togglePlayPause = (videoUrl) => {
		setVideoState((prevState) => {
			const isCurrentlyPlaying = prevState[videoUrl]?.playing || false;
			return {
				...prevState,
				[videoUrl]: {
					playing: !isCurrentlyPlaying,
				},
			};
		});
	};

	// Handle Search Filter
	const handleSearch = (text) => {
		setInput(text);

		if (text.trim() === '') {
			setFilteredFeatures(features);
			return;
		}

		const filteredData = features.filter((feature) => {
			return (
				feature?.featureName?.toLowerCase().includes(text.toLowerCase()) ||
				new Date(feature.createdDate)
					.toLocaleDateString()
					.includes(text.toLowerCase())
			);
		});

		setFilteredFeatures(filteredData);
	};

	// Toggle Search Bar Animation
	const toggleSearchBar = () => {
		setIsExpanded((prev) => {
			const newExpandedState = !prev;

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
		outputRange: [0, 160],
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
	const toggleFullScreen = () => {
		setIsFullScreen(!isFullScreen);
	};

	// Close enlarged image
	const closeEnlargedImage = () => {
		resetZoom();
		setEnlargedImage(null);
	};

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<View style={styles.container}>
				{/* Header with Search Bar */}
				<View style={styles.header}>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<TouchableOpacity
							style={{ flexDirection: 'row' }}
							onPress={() => navigation.goBack()}
						>
							<Feather name="chevron-left" size={24} color="black" />
							<Text style={styles.headerTitle}>What's New ✨</Text>
						</TouchableOpacity>
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
						<TouchableOpacity style={styles.searchIconContainer} onPress={toggleSearchBar}>
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
							/>
						</Animated.View>
					</Animated.View>
				</View>

				{/* Intro Text */}
				<View style={styles.middleTextContainer}>
					<Text style={styles.middleTextContainerText}>
						We are excited to introduce the latest updates to our helpdesk dashboard!
					</Text>
				</View>

				{/* Features List */}
				<ScrollView style={styles.featuresContainer}>
					{filteredFeatures.map((feature) => (
						<View key={feature._id} style={styles.featureCard}>
							{/* Video or Image */}
							{feature.videoUrl ? (
								<View style={{ position: 'relative' }}>
									<Video
										source={{ uri: getDirectVideoUrl(feature.videoUrl) }}
										style={styles.media}
										resizeMode="cover"
										paused={!videoState[feature.videoUrl]?.playing} // Use individual video state
										onError={(e) => console.log('Video error:', e)}
									/>
									<TouchableOpacity
										style={[styles.playIcon, videoState[feature.videoUrl]?.playing && styles.playIconPlaying]}
										onPress={() => togglePlayPause(feature.videoUrl)} // Toggle play for specific video
									>
										<Feather
											name={videoState[feature.videoUrl]?.playing ? 'pause' : 'play'}
											size={24}
											color="#FFF"
										/>
									</TouchableOpacity>
									<TouchableOpacity
										style={styles.enlargeIcon}
										onPress={() => setEnlargedVideo(feature.videoUrl)} // Open video in fullscreen
									>
										<Feather name="maximize" size={20} color="#FFF" />
									</TouchableOpacity>
								</View>
							) : feature.imgUrl ? (
								<View style={{ position: 'relative' }}>
									<Image
										source={{ uri: feature.imgUrl }}
										style={styles.media}
										resizeMode="cover"
									/>
									<TouchableOpacity
										style={styles.enlargeIcon}
										onPress={() => setEnlargedImage(feature.imgUrl)}
									>
										<Feather name="maximize" size={20} color="#FFF" />
									</TouchableOpacity>
								</View>
							) : null}

							<View style={styles.featureDetails}>
								<Text style={styles.featureDate}>
									{new Date(feature.createdDate).toLocaleDateString()}
								</Text>
								<Text style={styles.featureName}>{feature.featureName}</Text>
							</View>
						</View>
					))}
				</ScrollView>

			</View>

			{/* Image Modal with native zoom implementation */}
			{enlargedImage && (
				<Modal 
					transparent={true} 
					animationType="fade" 
					visible={enlargedImage !== null}
					statusBarTranslucent={true}
					onRequestClose={closeEnlargedImage}
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
							{...panResponder.panHandlers}
						>
							<TouchableOpacity 
								activeOpacity={1}
								onPress={handleImagePress}
							>
								<Image
									source={{ uri: enlargedImage }}
									style={styles.enlargedImage}
									resizeMode="contain"
								/>
							</TouchableOpacity>
						</Animated.View>
						<View style={styles.imageControlsOverlay}>
							<TouchableOpacity
								style={styles.closeIcon}
								onPress={closeEnlargedImage}
							>
								<Feather name="x" size={30} color="#FFF" />
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
						/>
						<View style={styles.videoControlsContainer}>
							<TouchableOpacity
								style={styles.closeIcon}
								onPress={() => setEnlargedVideo(null)}
							>
								<Feather name="x" size={30} color="#FFF" />
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.fullscreenIcon}
								onPress={toggleFullScreen}
							>
								<Feather 
									name={isFullScreen ? "minimize" : "maximize"} 
									size={30} 
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
	enlargeIcon: {
		position: 'absolute',
		bottom: 5,
		right: 10,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		padding: 5,
		borderRadius: 15,
	},
	enlargedImage: {
		width: screenWidth,
		height: screenHeight * 0.8,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.9)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	imageControlsOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		padding: 20,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	zoomInstructions: {
		color: 'white',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		padding: 8,
		borderRadius: 20,
		fontSize: 12,
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
		top: 40,
		right: 20,
		flexDirection: 'row',
	},
	fullscreenIcon: {
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		padding: 10,
		borderRadius: 25,
		marginLeft: 10,
	},
	closeIcon: {
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		padding: 10,
		borderRadius: 25,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 20,
		marginHorizontal: 10,
	},
	searchBarContainer: {
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
		paddingHorizontal: 10 
	},
	searchIconContainer: { 
		justifyContent: 'center', 
		alignItems: 'center' 
	},
	animatedInputContainer: { 
		height: '100%', 
		overflow: 'hidden' 
	},
	headerTitle: { 
		color: '#222327', 
		fontSize: responsiveFontSize(2.3), 
		fontWeight: '400', 
		marginLeft: 5 
	},
	middleTextContainer: {
		marginLeft: 10,
		marginRight: 10,
		marginBottom: 20,
		marginVertical: 10,
	},
	middleTextContainerText: {
		fontSize: responsiveFontSize(1.7),
		color: '#181818',
		fontWeight: '400',
		alignSelf: 'center',
		fontStyle: 'normal',
		lineHeight: 20,
		letterSpacing: 0.5,
		fontFamily: 'Montserrat',
	},
	featuresContainer: { 
		flex: 1, 
		paddingHorizontal: 15 
	},
	featureCard: {
		backgroundColor: '#FFF',
		borderRadius: 10,
		marginBottom: 15,
		padding: 10,
		flexDirection: 'row',
		alignItems: 'center',
		elevation: 3,
		height: 120,
	},
	media: { 
		width: screenWidth / 3, 
		height: '80%', 
		borderRadius: 10, 
		marginRight: 15 
	},
	featureDetails: { 
		flex: 1 
	},
	featureDate: { 
		fontSize: responsiveFontSize(1.5), 
		color: '#888', 
		marginBottom: 5 
	},
	featureName: { 
		fontSize: responsiveFontSize(2), 
		color: '#222', 
		fontWeight: '600' 
	},
	playIcon: {
		position: 'absolute',
		top: 22,
		left: 50,
		backgroundColor: 'rgba(0, 0, 0, 0.3)',
		borderRadius: 20,
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 1,
	},
	playIconPlaying: {
		backgroundColor: 'rgba(0, 0, 0, 0.3)',
		width: 40,
		height: 40,
	},
});