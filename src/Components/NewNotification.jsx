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
import Orientation from 'react-native-orientation-locker'; // You'll need to install this package

const { width, height } = Dimensions.get('window');

// Custom hook for handling orientation
const useOrientation = () => {
  const [orientation, setOrientation] = useState('PORTRAIT');

  useEffect(() => {
    // Get initial orientation
    Orientation.getOrientation((orientation) => {
      setOrientation(orientation);
    });

    // Add event listener for orientation changes
    Orientation.addOrientationListener((orientation) => {
      setOrientation(orientation);
    });

    // Clean up
    return () => {
      Orientation.removeOrientationListener();
    };
  }, []);

  const lockToPortrait = () => {
    Orientation.lockToPortrait();
  };

  const lockToLandscape = () => {
    Orientation.lockToLandscape();
  };

  const unlockOrientation = () => {
    Orientation.unlockAllOrientations();
  };

  return { 
    orientation,
    lockToPortrait,
    lockToLandscape,
    unlockOrientation
  };
};

const NewNotification = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [features, setFeatures] = useState([]);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoPaused, setVideoPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const { orientation, lockToPortrait, lockToLandscape, unlockOrientation } = useOrientation();

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

  useEffect(() => {
    // Enable orientation changes when video modal is open
    if (videoModalVisible) {
      unlockOrientation();
    } else {
      // Lock to portrait when returning to the main screen
      lockToPortrait();
    }

    return () => {
      // Clean up by locking to portrait when component unmounts
      lockToPortrait();
    };
  }, [videoModalVisible, unlockOrientation, lockToPortrait]);

  // Auto-hide controls after a few seconds of inactivity
  useEffect(() => {
    if (videoModalVisible && showControls) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [videoModalVisible, showControls]);

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
      setVideoLoading(true);
      setShowControls(true);
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
    lockToPortrait();
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
    // Show controls when user interacts
    setShowControls(true);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
    // Reset the timeout when showing controls
    if (!showControls) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 1000);
    }
  };

  const renderItem = ({ item, index }) => {
    const hasVideo = !!item?.videoUrl;
    const hasImage = !!item?.imgUrl;
    const formattedDate = new Date(item.createdDate).toLocaleDateString();

    return (
      <View style={styles.notification}>
        <TouchableOpacity
          activeOpacity={0.6}
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
                onLoad={() => { }}
                onLoadStart={() => { }}
                onError={() => { }}
              />
              <View style={{
                position: 'absolute',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Ionicons name="play-circle" size={responsiveFontSize(3.5)} color="gray" />
              </View>
            </View>
          ) : hasImage ? (
            <View style={styles.videoThumbnailContainer}>
              <Image
                source={{ uri: item.imgUrl }}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.playIconOverlay}>
                <Feather name="maximize" size={responsiveFontSize(2.7)} color="#FFF" />
              </View>
            </View>
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
        supportedOrientations={['portrait', 'landscape']}
      >
        <SafeAreaView style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.videoTouchableContainer}
            activeOpacity={1}
            onPress={toggleControls}
          >
            <View style={styles.videoModalContent}>
              <View style={styles.videoContainer}>
                {selectedMedia && (
                  <>
                    <Video
                      ref={videoRef}
                      source={{ uri: selectedMedia }}
                      style={styles.fullScreenVideo}
                      resizeMode="contain"
                      paused={videoPaused}
                      onLoad={onVideoLoad}
                      onError={onVideoError}
                      onEnd={() => setVideoPaused(true)}
                      fullscreen={false}
                      fullscreenOrientation="all"
                      ignoreSilentSwitch="ignore"
                      // Remove the built-in controls prop to use our custom controls
                      controls={false}
                    />

                    {videoLoading && (
                      <View style={styles.videoLoadingOverlay}>
                        <ActivityIndicator size="large" color="#ffffff" />
                      </View>
                    )}

                    {/* Top controls - only show when showControls is true */}
                    {showControls && (
                      <View style={styles.topControlsContainer}>
                        <TouchableOpacity
                          style={styles.closeButton}
                          onPress={closeVideoModal}
                        >
                          <Ionicons name="close-circle" size={responsiveFontSize(3.5)} color="#ffffff" />
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Bottom controls - only show when showControls is true */}
                    {showControls && (
                      <View style={styles.bottomControlsContainer}>
                        <TouchableOpacity
                          onPress={togglePlayPause}
                          style={styles.controlButton}
                        >
                          <Ionicons 
                            name={videoPaused ? "play" : "pause"} 
                            size={responsiveFontSize(3.5)} 
                            color="#ffffff" 
                          />
                        </TouchableOpacity>
                        
                        {/* You can add more controls here like a progress bar, time display, etc. */}
                        <TouchableOpacity
                          onPress={() => {
                            if (orientation.includes('LANDSCAPE')) {
                              lockToPortrait();
                            } else {
                              lockToLandscape();
                            }
                          }}
                          style={styles.controlButton}
                        >
                          <Ionicons 
                            name={orientation.includes('LANDSCAPE') ? "phone-portrait" : "phone-landscape"} 
                            size={responsiveFontSize(3)} 
                            color="#ffffff" 
                          />
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Play/Pause overlay - only show play icon when paused */}
                    {videoPaused && !showControls && (
                      <TouchableOpacity
                        style={styles.videoControlsOverlay}
                        onPress={togglePlayPause}
                        activeOpacity={1}
                      >
                        <View style={styles.playButtonContainer}>
                          <Ionicons name="play" size={responsiveFontSize(6)} color="rgba(255, 255, 255, 0.8)" />
                        </View>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            </View>
          </TouchableOpacity>
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
    right: responsiveWidth(1),
    bottom: responsiveWidth(1),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: responsiveWidth(0.5),
    borderRadius: responsiveWidth(1),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  videoTouchableContainer: {
    width: '100%',
    height: '100%',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
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
  topControlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 15,
    // Add a gradient background for better visibility
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bottomControlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    // Add a gradient background for better visibility
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  closeButton: {
    padding: 5,
  },
  controlButton: {
    padding: 10,
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