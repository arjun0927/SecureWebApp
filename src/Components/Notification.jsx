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
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import SearchSvg from '../assets/Svgs/SearchSvg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Video from 'react-native-video';
import { black } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';

const screenWidth = Dimensions.get('window').width;

const Notification = ({ navigation }) => {
	const [features, setFeatures] = useState([]);
	const [filteredFeatures, setFilteredFeatures] = useState([]);
	const [videoState, setVideoState] = useState({}); // Track individual video states
	const [enlargedImage, setEnlargedImage] = useState(null);
	const [enlargedVideo, setEnlargedVideo] = useState(null); // State to track enlarged video
	const [input, setInput] = useState('');
	const [isExpanded, setIsExpanded] = useState(false);
	const animation = useRef(new Animated.Value(0)).current;

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
					playing: !isCurrentlyPlaying, // Toggle play state for the specific video
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
							<Text style={styles.headerTitle}>What’s New ✨</Text>
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
										onPress={() => setEnlargedVideo(feature.videoUrl)} // Directly open video in landscape
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
			{enlargedImage && (
				<Modal transparent={true} animationType="fade" visible={true}>
					<TouchableOpacity
						style={styles.modalOverlay}
						onPress={() => setEnlargedImage(null)}
					>
						<Image
							source={{ uri: enlargedImage }}
							style={styles.enlargedImage}
							resizeMode="contain"
						/>
					</TouchableOpacity>
				</Modal>
			)}
			{enlargedVideo && (
				<View style={styles.enlargedMediaContainer}>
					<Video
						source={{ uri: getDirectVideoUrl(enlargedVideo) }}
						style={styles.enlargedMedia}
						resizeMode="contain"
						controls={true}
						paused={true}
					/>
					<TouchableOpacity
						style={styles.closeIcon}
						onPress={() => setEnlargedVideo(null)}
					>
						<Feather name="x" size={30} color="#FFF" />
					</TouchableOpacity>
				</View>
			)}
		</KeyboardAvoidingView>
	);
};

export default Notification;


const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#F4FAF4' },
	enlargeIcon: {
		position: 'absolute',
		bottom: 5,
		right: 10,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		padding: 5,
		borderRadius: 15,
	},
	enlargedMediaContainer: {
		flex: 1,
		position: 'absolute',
		top: '25%',
		// backgroundColor: 'transparent',
		backgroundColor: 'black',
	},
	enlargedMedia: {
		width: screenWidth,
		height: screenWidth,
	},
	closeIcon: {
		position: 'absolute',
		top: 20,
		right: 20,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		padding: 10,
		borderRadius: 50,
	},

	enlargedImage: {
		width: screenWidth * 0.92,
		height: screenWidth * 0.92,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		justifyContent: 'center',
		alignItems: 'center',
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
	textInput: { flex: 1, backgroundColor: 'transparent', height: '100%', fontSize: 16, paddingHorizontal: 10 },
	searchIconContainer: { justifyContent: 'center', alignItems: 'center' },
	animatedInputContainer: { height: '100%', overflow: 'hidden' },
	headerTitle: { color: '#222327', fontSize: responsiveFontSize(2.3), fontWeight: '400', marginLeft: 5 },
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
	featuresContainer: { flex: 1, paddingHorizontal: 15 },
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
	media: { width: screenWidth / 3, height: '80%', borderRadius: 10, marginRight: 15 },
	featureDetails: { flex: 1 },
	featureDate: { fontSize: responsiveFontSize(1.5), color: '#888', marginBottom: 5 },
	featureName: { fontSize: responsiveFontSize(2), color: '#222', fontWeight: '600' },
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
