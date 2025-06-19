import { Image, StyleSheet, Text, TouchableOpacity, View, Modal, Dimensions, StatusBar, SafeAreaView, ActivityIndicator, Platform, TextInput, Animated, Easing, PanResponder, FlatList } from 'react-native';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SearchSvg from '../assets/Svgs/SearchSvg';
import { FlashList } from "@shopify/flash-list";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Video from 'react-native-video';
import Feather from 'react-native-vector-icons/Feather';
import { UIActivityIndicator } from 'react-native-indicators';
import { ImageZoom } from '@likashefqet/react-native-image-zoom';

const { width, height } = Dimensions.get('window');

const NewNotification = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [features, setFeatures] = useState([]);
  const [filteredFeatures, setFilteredFeatures] = useState([]);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [imageLoading, setImageLoading] = useState({});
  const [visibleItems, setVisibleItems] = useState(new Set());
  const [retryCount, setRetryCount] = useState({});

  const searchTimeoutRef = useRef(null);
  const animation = useRef(new Animated.Value(0)).current;

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
        setFilteredFeatures(response.data.features);
      } else {
        setFeatures([]);
        setFilteredFeatures([]);
      }
    } catch (error) {
      console.error('Error in fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getNotification();
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const getDirectVideoUrl = useCallback((url) => {
    if (!url) return null;
    const driveMatch = url.match(/file\/d\/(.*?)\/preview/);
    if (driveMatch) {
      return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
    }
    return url;
  }, []);

  const processImageUrl = useCallback((url) => {
    if (!url) return null;

    // If it's a Cloudinary URL, add parameters for better compatibility
    if (url.includes('cloudinary.com')) {
      // Add format and quality parameters for better device compatibility
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}f_auto,q_auto,fl_progressive,dpr_auto`;
    }

    return url;
  }, []);

  const getImageSource = useCallback((url, itemId) => {
    const processedUrl = processImageUrl(url);
    const currentRetryCount = retryCount[itemId] || 0;

    // console.log(`Image source for ${itemId}:`, {
    //   originalUrl: url,
    //   processedUrl: processedUrl,
    //   retryCount: currentRetryCount,
    //   cache: currentRetryCount > 0 ? 'reload' : 'force-cache'
    // });

    return {
      uri: processedUrl,
      cache: currentRetryCount > 0 ? 'reload' : 'force-cache',
      headers: {
        'Accept': 'image/webp,image/*,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (compatible; ReactNative)',
        'Cache-Control': 'no-cache'
      }
    };
  }, [processImageUrl, retryCount]);

  const handleMediaPress = (item, index) => {
    if (item.videoUrl) {
      const videoUrl = getDirectVideoUrl(item.videoUrl);
      navigation.navigate('VideoPlayerScreen', { videoUri: videoUrl });
    } else if (item.imgUrl) {
      setSelectedImage(item.imgUrl);
      setImageModalVisible(true);
    }
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
    setSelectedImage(null);
  };

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
        setInput('');
        setFilteredFeatures(features);
      }

      return newExpandedState;
    });
  }, [animation, features]);

  const handleSearch = useCallback((text) => {
    setInput(text);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

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
    }, 300);
  }, [features]);

  const animatedInputWidth = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, responsiveWidth(40)],
  });

  const animatedBackgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F4FAF4', 'white'],
  });

  const animatedElevation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 3],
  });

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    setVisibleItems(new Set(viewableItems.map(item => item.item.id)));
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50
  };

  const renderItem = ({ item, index }) => {
    const hasVideo = !!item?.videoUrl;
    const hasImage = !!item?.imgUrl;
    // console.log('video : ',hasVideo)
    const formattedDate = new Date(item.createdDate).toLocaleDateString();
    const isItemVisible = visibleItems.has(item.id);

    const handleImageError = (itemId) => {
      const currentRetryCount = retryCount[itemId] || 0;

      // console.log(`Image load error for ${itemId}, retry count: ${currentRetryCount}`);

      if (currentRetryCount < 2) {
        // Retry with different cache settings
        setRetryCount(prev => ({
          ...prev,
          [itemId]: currentRetryCount + 1
        }));

        // Clear the error state to retry
        setImageLoadErrors(prev => ({
          ...prev,
          [itemId]: false
        }));
      } else {
        // Final failure after retries
        // console.log(`Final image load failure for ${itemId}`);
        setImageLoadErrors(prev => ({
          ...prev,
          [itemId]: true
        }));
      }
    };

    const handleImageLoadStart = (itemId) => {
      setImageLoading(prev => ({
        ...prev,
        [itemId]: true
      }));
    };

    const handleImageLoadEnd = (itemId) => {
      setImageLoading(prev => ({
        ...prev,
        [itemId]: false
      }));
    };

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
              {isItemVisible ? (
                <Video
                  source={{ uri: getDirectVideoUrl(item.videoUrl) }}
                  style={styles.media}
                  resizeMode="cover"
                  paused={true}
                  muted={true}
                  poster={item.imgUrl}
                  posterResizeMode="cover"
                />
              ) : (
                <Image
                  source={{ uri: item.imgUrl }}
                  style={styles.media}
                  resizeMode="cover"
                />
              )}
              <View style={styles.playIconContainer}>
                <Ionicons name="play-circle" size={responsiveFontSize(3.5)} color="white" />
              </View>
            </View>
          ) : hasImage ? (
            <View style={styles.videoThumbnailContainer}>
              {imageLoading[item.id] && (
                <View style={styles.imageLoadingContainer}>
                  <ActivityIndicator size="small" color="#4D8733" />
                </View>
              )}
              {!imageLoadErrors[item.id] ? (
                <Image
                  source={getImageSource(item.imgUrl, item.id)}
                  style={styles.image}
                  resizeMode="contain"
                  onError={() => handleImageError(item.id)}
                  onLoadStart={() => handleImageLoadStart(item.id)}
                  onLoadEnd={() => handleImageLoadEnd(item.id)}
                />
              ) : (
                <View style={styles.fallbackContainer}>
                  <Feather name="image" size={responsiveFontSize(3)} color="#ABABAB" />
                  <Text style={styles.fallbackText}>Image not available</Text>
                </View>
              )}
              <View style={styles.playIconOverlay}>
                <Feather name="maximize" size={responsiveFontSize(2.7)} color="gray" />
              </View>
            </View>
          ) : (
            <View style={styles.noMediaContainer}>
              <Feather name="image" size={responsiveFontSize(3)} color="#ABABAB" />
              <Text style={styles.noMediaText}>No Media</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.textContainer}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <Text style={styles.featureText}>{item?.featureName}</Text>
        </View>
      </View>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      {isLoading ? (
        <UIActivityIndicator color={'#4D8733'} size={responsiveFontSize(4)} />
      ) : (
        <>
          <Feather name="inbox" size={responsiveFontSize(5)} color="#ABABAB" />
          <Text style={{ fontSize: responsiveFontSize(1.6), fontFamily: 'Poppins-Medium' }}>
            {input.length > 0
              ? "No updates match your search criteria"
              : "No updates available yet"
            }
          </Text>
        </>
      )}
    </View>
  );

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
          >
            <SearchSvg width={responsiveFontSize(2.5)} height={responsiveFontSize(2.5)} />
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
                <Feather name="x-circle" size={responsiveFontSize(2.2)} color="#888" />
              </TouchableOpacity>
            )}
          </Animated.View>
        </Animated.View>
      </View>

      <View style={styles.introTextContainer}>
        <Text style={styles.introText}>
          We are excited to introduce the latest updates to our helpdesk dashboard!
        </Text>
      </View>

      <View style={styles.notificationContainer}>
        {isLoading ? (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <UIActivityIndicator color={'#4D8733'} size={responsiveFontSize(4)} />
          </View>
        ) : (
          <FlatList
            data={filteredFeatures}
            renderItem={renderItem}
            keyExtractor={(item, index) => `feature-${item.id || index}`}
            ListEmptyComponent={renderEmptyList}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            removeClippedSubviews={true}
            showsVerticalScrollIndicator={false}
            maxToRenderPerBatch={5}
            windowSize={5}
            initialNumToRender={5}
          />
        )}
      </View>

      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeImageModal}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={responsiveFontSize(3)} color="white" />
              </TouchableOpacity>
              {selectedImage && (
                <Image
                  source={getImageSource(selectedImage, 'modal')}
                  style={styles.modalImage}
                  resizeMode="contain" />

              )
              }

            </View>
          </TouchableOpacity>
        </View>
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
  searchBarContainer: {
    height: responsiveHeight(5),
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: responsiveWidth(2),
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
    justifyContent: 'space-between',
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
    marginVertical: 25,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
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
    backgroundColor: '#f0f0f0',
  },
  playIconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: responsiveWidth(7),
    padding: 3,
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    width: '100%',
    height: '100%',
  },
  fallbackText: {
    fontSize: responsiveFontSize(1.3),
    fontFamily: 'Montserrat-Regular',
    color: '#666',
    marginTop: responsiveHeight(1),
  },
  playIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 3,
  },
  noMediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    width: '100%',
    height: '100%',
  },
  noMediaText: {
    fontSize: responsiveFontSize(1.3),
    fontFamily: 'Montserrat-Regular',
    color: '#666',
    marginTop: responsiveHeight(1),
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  featureText: {
    fontSize: responsiveFontSize(1.7),
    fontFamily: 'Poppins-Medium',
    color: 'Black',
  },
  dateText: {
    fontSize: responsiveFontSize(1.5),
    fontFamily: 'Montserrat-Medium',
    color: '#737C95',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: responsiveHeight(40),
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: responsiveHeight(5),
    right: responsiveWidth(5),
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: responsiveWidth(3),
    padding: responsiveWidth(2),
  },
  modalImage: {
    width: responsiveWidth(100),
    height: responsiveHeight(100),
  },
});



