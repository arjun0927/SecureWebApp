import { Image, StyleSheet, Text, TouchableOpacity, View, Modal, Dimensions, StatusBar, SafeAreaView, ActivityIndicator, Platform } from 'react-native';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SearchSvg from '../assets/Svgs/SearchSvg';
import { FlashList } from "@shopify/flash-list";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import ImageViewer from 'react-native-image-zoom-viewer';
import Video from 'react-native-video';
import Feather from 'react-native-vector-icons/Feather';

const { width, height } = Dimensions.get('window');

const NewNotification = ({ navigation }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [features, setFeatures] = useState([]);
	const [imageViewerVisible, setImageViewerVisible] = useState(false);
	const [videoModalVisible, setVideoModalVisible] = useState(false);
	const [selectedMedia, setSelectedMedia] = useState(null);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [videoLoading, setVideoLoading] = useState(true);
	const [videoPaused, setVideoPaused] = useState(false);
	const videoRef = useRef(null);

	// Prepare images array for ImageViewer component
	const getImagesForViewer = useCallback(() => {
		return features
			.filter(item => item.imgUrl)
			.map(item => ({
				url: item.imgUrl,
				props: { source: item.featureName }
			}));
	}, [features]);

	const getNotification = useCallback(async () => {
		setIsLoading(true);
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
			} else {
				setFeatures([]);
			}
		} catch (error) {
			console.error('Error in fetching notifications:', error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		getNotification();
	}, [getNotification]);

	const getDirectVideoUrl = useCallback((url) => {
		if (!url) return null;
		// Handle Google Drive links
		const driveMatch = url.match(/file\/d\/(.*?)\/preview/);
		if (driveMatch) {
			return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
		}
		// Handle other video URLs
		return url;
	}, []);

	const handleMediaPress = (item, index) => {
		if (item.videoUrl) {
			setSelectedMedia(getDirectVideoUrl(item.videoUrl));
			setVideoModalVisible(true);
			setVideoPaused(false);
		} else if (item.imgUrl) {
			// Find index of this image in the filtered images array
			const imageItems = features.filter(feat => feat.imgUrl);
			const imageIndex = imageItems.findIndex(img => img.id === item.id);
			setCurrentImageIndex(imageIndex >= 0 ? imageIndex : 0);
			setImageViewerVisible(true);
		}
	};

	const closeImageViewer = () => {
		setImageViewerVisible(false);
	};

	const closeVideoModal = () => {
		setVideoModalVisible(false);
		setSelectedMedia(null);
		setVideoPaused(true);
	};

	const onVideoLoad = () => {
		setVideoLoading(false);
	};

	const onVideoError = (error) => {
		console.error('Video loading error:', error);
		setVideoLoading(false);
	};

	const togglePlayPause = () => {
		setVideoPaused(!videoPaused);
	};

	const renderItem = ({ item, index }) => {
		const hasVideo = !!item?.videoUrl;
		const hasImage = !!item?.imgUrl;
		const formattedDate = new Date(item.createdDate).toLocaleDateString();

		return (
			<View style={styles.notification}>
				<TouchableOpacity
					style={styles.mediaContainer}
					onPress={() => handleMediaPress(item, index)}
					disabled={!hasVideo && !hasImage}
				>
					{hasVideo ? (
						<View style={styles.videoThumbnailContainer}>
							<Video
								source={{ uri: getDirectVideoUrl(item.videoUrl) }}
								style={styles.media}
								resizeMode="cover"
								paused={true}
								muted={true}
								posterResizeMode="cover"
								onLoad={() => {}}
								onLoadStart={() => {}}
								onError={() => {}}
							/>
							<View style={styles.playIconOverlay}>
								<Ionicons name="play-circle" size={responsiveFontSize(3.5)} color="#ffffff" />
							</View>
						</View>
					) : hasImage ? (
						<Image
							source={{ uri: item.imgUrl }}
							style={styles.image}
							resizeMode="cover"
						/>
						
					) : (
						<Text style={styles.noMediaText}>No Media</Text>
					)}
				</TouchableOpacity>

				<View style={styles.textContainer}>
					<Text style={styles.dateText}>{formattedDate}</Text>
					<Text style={styles.featureText}>{item?.featureName}</Text>
				</View>
			</View>
		);
	};

	const images = getImagesForViewer();

	return (
		<View style={styles.container}>
			<StatusBar backgroundColor="#F4FAF4" barStyle="dark-content" />
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<Ionicons name={'arrow-back'} size={responsiveFontSize(2.7)} color="black" />
						<Text style={styles.headerTitle}> What's New ✨ </Text>
					</View>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.searchIconContainer}
				>
					<SearchSvg width={responsiveFontSize(2.5)} height={responsiveFontSize(2.5)} />
				</TouchableOpacity>
			</View>
			<View style={styles.introTextContainer}>
				<Text style={styles.introText}>
					We are excited to introduce the latest updates to our helpdesk dashboard!
				</Text>
			</View>
			<View style={styles.notificationContainer}>
				{isLoading ? (
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="large" color="#4CAF50" />
						<Text style={styles.loadingText}>Loading features...</Text>
					</View>
				) : (
					<FlashList
						data={features}
						renderItem={renderItem}
						estimatedItemSize={200}
						keyExtractor={(item, index) => `feature-${item.id || index}`}
					/>
				)}
			</View>

			{/* Image Viewer Modal */}
			<Modal
				visible={imageViewerVisible}
				transparent={true}
				onRequestClose={closeImageViewer}
			>
				<ImageViewer
					imageUrls={images}
					index={currentImageIndex}
					enableSwipeDown={true}
					saveToLocalByLongPress={false}
					backgroundColor="rgba(0, 0, 0, 0.9)"
					loadingRender={() => <ActivityIndicator size="large" color="#ffffff" />}
					onClick={closeImageViewer}
				/>
			</Modal>

			{/* Video Player Modal */}
			<Modal
				animationType="fade"
				transparent={true}
				visible={videoModalVisible}
				onRequestClose={closeVideoModal}
			>
				<SafeAreaView style={styles.modalContainer}>
					<View style={styles.videoModalContent}>
						{/* Close button */}
						<TouchableOpacity
							style={styles.closeButton}
							onPress={closeVideoModal}
						>
							<Ionicons name="close-circle" size={responsiveFontSize(3.5)} color="#ffffff" />
						</TouchableOpacity>

						<View style={styles.videoContainer}>
							{selectedMedia && (
								<>
									<Video
										ref={videoRef}
										source={{ uri: selectedMedia }}
										style={styles.fullScreenVideo}
										resizeMode="contain"
										controls={true}
										paused={videoPaused}
										onLoad={onVideoLoad}
										onError={onVideoError}
										onEnd={() => setVideoPaused(true)}
										fullscreen={false}
										fullscreenOrientation="all"
										ignoreSilentSwitch="ignore"
									/>
									
									{videoLoading && (
										<View style={styles.videoLoadingOverlay}>
											<ActivityIndicator size="large" color="#ffffff" />
										</View>
									)}
									
									{/* Custom play/pause button overlay */}
									<TouchableOpacity 
										style={styles.videoControlsOverlay} 
										onPress={togglePlayPause}
										activeOpacity={1}
									>
										{videoPaused && (
											<View style={styles.playButtonContainer}>
												<Ionicons name="play" size={responsiveFontSize(6)} color="rgba(255, 255, 255, 0.8)" />
											</View>
										)}
									</TouchableOpacity>
								</>
							)}
						</View>
					</View>
				</SafeAreaView>
			</Modal>
		</View>
	);
};

export default NewNotification;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F4FAF4',
	},
	header: {
		paddingHorizontal: 15,
		paddingTop: 15,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignContent: 'center',
	},
	headerTitle: {
		fontSize: responsiveFontSize(2.3),
		fontFamily: 'Poppins-Medium',
		marginLeft: 5,
		color: '#222327',
	},
	searchIconContainer: {
		justifyContent: 'center',
		alignItems: 'center'
	},
	introTextContainer: {
		paddingHorizontal: 25,
		marginTop: 10,
	},
	introText: {
		fontSize: responsiveFontSize(1.8),
		fontFamily: 'Montserrat-Medium',
		color: '#181818',
	},
	notificationContainer: {
		backgroundColor: '#fff',
		flex: 1,
		marginHorizontal: 15,
		marginVertical: 15,
		borderRadius: 15,
	},
	notification: {
		flex: 1,
		flexDirection: 'row',
		padding: 10,
	},
	mediaContainer: {
		flex: 1,
		height: responsiveHeight(12),
		marginRight: 10,
		borderRadius: 8,
		overflow: 'hidden',
		backgroundColor: '#f0f0f0',
		justifyContent: 'center',
		alignItems: 'center',
	},
	image: {
		width: '100%',
		height: '100%',
	},
	media: {
		width: '100%',
		height: '100%',
	},
	videoThumbnailContainer: {
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
	},
	playIconOverlay: {
		position: 'absolute',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.3)',
		borderRadius: 30,
	},
	noMediaText: {
		fontSize: responsiveFontSize(1.3),
		fontFamily: 'Montserrat-Regular',
		color: '#666',
	},
	textContainer: {
		flex: 1,
		justifyContent: 'center',
	},
	featureText: {
		fontSize: responsiveFontSize(1.8),
		fontFamily: 'Poppins-Medium',
		color: '#222327',
	},
	dateText: {
		fontSize: responsiveFontSize(1.5),
		fontFamily: 'Montserrat-Medium',
		color: '#737C95',
	},
	modalContainer: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.9)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	videoModalContent: {
		width: width,
		height: responsiveHeight(50),
		position: 'relative',
	},
	closeButton: {
		position: 'absolute',
		top: 10,
		right: 10,
		zIndex: 2,
		padding: 5,
	},
	videoContainer: {
		width: '100%',
		height: '100%',
		backgroundColor: '#000',
		justifyContent: 'center',
		alignItems: 'center',
	},
	fullScreenVideo: {
		width: '100%',
		height: '100%',
	},
	videoLoadingOverlay: {
		...StyleSheet.absoluteFillObject,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	videoControlsOverlay: {
		...StyleSheet.absoluteFillObject,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'transparent',
	},
	playButtonContainer: {
		width: 80,
		height: 80,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 40,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		color: '#4CAF50',
		fontSize: responsiveFontSize(2),
		fontFamily: 'Montserrat-Medium',
		marginTop: 10,
	}
});