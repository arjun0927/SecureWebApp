import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  Platform,
  Animated,
  PanResponder,
  SafeAreaView,
} from 'react-native';
import Video from 'react-native-video';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UIActivityIndicator } from 'react-native-indicators';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import Orientation from 'react-native-orientation-locker';

const VideoPlayerScreen = ({ route, navigation }) => {
  // Get video URI from route params
  const { videoUri } = route.params || {};
  
  const [videoPaused, setVideoPaused] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const [isSeekingForward, setIsSeekingForward] = useState(false);
  const [isSeekingBackward, setIsSeekingBackward] = useState(false);
  const [isSeekBarSeeking, setIsSeekBarSeeking] = useState(false);
  const [isVideoEnded, setIsVideoEnded] = useState(false);

  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const seekBarContainerRef = useRef(null);
  const [seekBarWidth, setSeekBarWidth] = useState(0);

  // Hide status bar when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      StatusBar.setHidden(true, 'fade');
    } else {
      StatusBar.setHidden(false, 'fade');
    }
  }, [isFullscreen]);

  // Handle orientation
  useEffect(() => {
    return () => {
      Orientation.lockToPortrait();
      StatusBar.setHidden(false, 'fade');
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (showControls && !videoLoading && !videoPaused && !isSeekingForward && !isSeekingBackward && !isSeekBarSeeking) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, videoPaused, videoLoading, isSeekingForward, isSeekingBackward, isSeekBarSeeking]);

  const handleBackward = () => {
    // console.log('Backward pressed - Current time:', currentTime);
    if (videoRef.current && duration > 0) {
      const newTime = Math.max(0, currentTime - 10);
      // console.log('Seeking to:', newTime);
      setIsSeekingBackward(true);
      setShowControls(false);
      videoRef.current.seek(newTime);
      // Don't update currentTime here, let onProgress handle it
    }
  };

  const handleForward = () => {
    // console.log('Forward pressed - Current time:', currentTime, 'Duration:', duration);
    if (videoRef.current && duration > 0) {
      const newTime = Math.min(duration, currentTime + 10);
      // console.log('Seeking to:', newTime);
      setIsSeekingForward(true);
      setShowControls(false);
      videoRef.current.seek(newTime);
      // Don't update currentTime here, let onProgress handle it
    }
  };

  const showControlsTemporarily = () => {
    if (videoLoading || isSeekingForward || isSeekingBackward || isSeekBarSeeking) return;
    
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    if (!videoPaused) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    }
  };

  const onVideoLoadStart = () => {
    // console.log('Video load started');
    setVideoLoading(true);
    setShowControls(true);
  };

  const onVideoLoadComplete = (data) => {
    // console.log('Video loaded:', data);
    setDuration(data.duration);
    setVideoLoading(false);
    setShowControls(true);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const onVideoEnd = () => {
    setIsVideoEnded(true);
    setVideoPaused(true);
    setShowControls(true);
  };

  const togglePlayPause = () => {
    if (isVideoEnded) {
      // If video ended, restart from beginning
      if (videoRef.current) {
        videoRef.current.seek(0);
        setIsVideoEnded(false);
      }
    }
    setVideoPaused(!videoPaused);
    showControlsTemporarily();
  };

  const toggleFullscreen = () => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);

    if (newFullscreenState) {
      Orientation.lockToLandscape();
    } else {
      Orientation.lockToPortrait();
    }

    showControlsTemporarily();
  };

  const handleClose = () => {
    Orientation.lockToPortrait();
    StatusBar.setHidden(false, 'fade');
    navigation.goBack();
  };

  const onVideoError = (error) => {
    console.error('Video loading error:', error);
    setVideoLoading(false);
  };

  const toggleControls = () => {
    if (videoLoading || isSeekingForward || isSeekingBackward || isSeekBarSeeking) return;
    setShowControls(!showControls);
  };

  const onProgress = (data) => {
    if (!isSeeking && data.currentTime !== undefined) {
      setCurrentTime(data.currentTime);
      if (duration > 0) {
        setSeekPosition((data.currentTime / duration) * 100);
      }
      
      // Reset seeking states when progress updates
      if (isSeekingForward) {
        setIsSeekingForward(false);
        setShowControls(true);
        if (!videoPaused) {
          if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
          }
          controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
          }, 4000);
        }
      }
      
      if (isSeekingBackward) {
        setIsSeekingBackward(false);
        setShowControls(true);
        if (!videoPaused) {
          if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
          }
          controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
          }, 4000);
        }
      }
      
      if (isSeekBarSeeking) {
        // Add a small delay before hiding the loader to ensure smooth transition
        setTimeout(() => {
          setIsSeekBarSeeking(false);
          setShowControls(true);
          if (!videoPaused) {
            if (controlsTimeoutRef.current) {
              clearTimeout(controlsTimeoutRef.current);
            }
            controlsTimeoutRef.current = setTimeout(() => {
              setShowControls(false);
            }, 4000);
          }
        }, 100);
      }
    }
  };

  const handleSeekBarTouch = (event) => {
    if (!seekBarWidth || duration === 0) return;
    
    const { locationX } = event.nativeEvent;
    const seekPercentage = Math.max(0, Math.min(100, (locationX / seekBarWidth) * 100));
    const newTime = (seekPercentage / 100) * duration;
    
    if (videoRef.current) {
      setIsSeekBarSeeking(true);
      setShowControls(false);
      videoRef.current.seek(newTime);
      setSeekPosition(seekPercentage);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setIsSeeking(true);
        handleSeekBarTouch(evt);
      },
      onPanResponderMove: (evt) => {
        if (!seekBarWidth || duration === 0) return;
        
        const { locationX } = evt.nativeEvent;
        const seekPercentage = Math.max(0, Math.min(100, (locationX / seekBarWidth) * 100));
        const newTime = (seekPercentage / 100) * duration;
        
        setSeekPosition(seekPercentage);
        setCurrentTime(newTime);
      },
      onPanResponderRelease: (evt) => {
        if (!seekBarWidth || duration === 0) return;
        
        const { locationX } = evt.nativeEvent;
        const seekPercentage = Math.max(0, Math.min(100, (locationX / seekBarWidth) * 100));
        const newTime = (seekPercentage / 100) * duration;
        
        if (videoRef.current) {
          videoRef.current.seek(newTime);
        }
        
        setIsSeeking(false);
        // Don't reset isSeekBarSeeking here, let onProgress handle it
      },
    })
  ).current;

  const onSeekBarLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setSeekBarWidth(width);
    // console.log('Seek bar width set:', width);
  };

  // Add a new effect to handle seekbar seeking state
  useEffect(() => {
    if (!isSeeking && isSeekBarSeeking) {
      const timer = setTimeout(() => {
        setIsSeekBarSeeking(false);
        setShowControls(true);
        if (!videoPaused) {
          if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
          }
          controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
          }, 4000);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isSeeking, isSeekBarSeeking, videoPaused]);

  if (!videoUri) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No video URI provided</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleClose}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Check if any seeking operation is in progress
  const isAnySeeking = isSeekingForward || isSeekingBackward || isSeekBarSeeking;

  return (
    <SafeAreaView style={[styles.container, isFullscreen && styles.fullscreenContainer]}>
      <StatusBar
        hidden={isFullscreen}
        backgroundColor="black"
        barStyle="light-content"
      />
      
      <View style={styles.videoContainer}>
        <TouchableOpacity
          style={styles.videoWrapper}
          activeOpacity={1}
          onPress={toggleControls}
        >
          <Video
            ref={videoRef}
            source={{ uri: videoUri }}
            style={isFullscreen ? styles.fullscreenVideo : styles.video}
            resizeMode="contain"
            paused={videoPaused}
            onLoadStart={onVideoLoadStart}
            onLoad={onVideoLoadComplete}
            onProgress={onProgress}
            onError={onVideoError}
            onEnd={onVideoEnd}
            controls={false}
            repeat={false}
            playInBackground={false}
            playWhenInactive={false}
            ignoreSilentSwitch="ignore"
            progressUpdateInterval={500}
          />

          {/* Loading Overlay */}
          {(videoLoading || isAnySeeking) && (
            <View style={styles.loaderOverlay}>
              <UIActivityIndicator color={'#fff'} size={responsiveFontSize(4)} />
            </View>
          )}

          {/* Custom Controls Overlay */}
          {showControls && !videoLoading && !isAnySeeking && (
            <Animated.View style={styles.controlsOverlay}>
              {/* Top Controls */}
              <View style={styles.topControls}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={handleClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="arrow-back" size={responsiveFontSize(3)} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={toggleFullscreen}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={isFullscreen ? "contract" : "expand"}
                    size={responsiveFontSize(2.5)}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>

              {/* Center Controls */}
              <View style={styles.centerControls}>
                <TouchableOpacity
                  style={styles.seekButton}
                  onPress={handleBackward}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <Ionicons name="play-back" size={responsiveFontSize(3)} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.playPauseButton}
                  onPress={togglePlayPause}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <Ionicons
                    name={videoPaused || isVideoEnded ? "play" : "pause"}
                    size={responsiveFontSize(3.5)}
                    color="#fff"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.seekButton}
                  onPress={handleForward}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <Ionicons name="play-forward" size={responsiveFontSize(3)} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Bottom Controls */}
              <View style={styles.bottomControls}>
                <View style={styles.progressContainer}>
                  <Text style={styles.timeText}>{formatTime(currentTime)}</Text>

                  <View 
                    ref={seekBarContainerRef}
                    style={styles.seekBarContainer}
                    onLayout={onSeekBarLayout}
                    {...panResponder.panHandlers}
                  >
                    <TouchableOpacity
                      style={styles.seekBar}
                      activeOpacity={1}
                      onPress={handleSeekBarTouch}
                    >
                      <View
                        style={[
                          styles.seekBarFill,
                          { width: `${Math.max(0, Math.min(100, seekPosition))}%` }
                        ]}
                      />
                      <View
                        style={[
                          styles.seekBarThumb,
                          { left: `${Math.max(0, Math.min(100, seekPosition))}%` }
                        ]}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>
              </View>
            </Animated.View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  fullscreenContainer: {
    backgroundColor: 'black',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: 250,
    alignSelf: 'center',
  },
  fullscreenVideo: {
    width: '100%',
    height: '100%',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(4),
    paddingTop: Platform.OS === 'ios' ? responsiveHeight(2) : responsiveHeight(1),
    paddingBottom: responsiveHeight(1),
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  bottomControls: {
    paddingHorizontal: responsiveWidth(4),
    paddingBottom: responsiveHeight(3),
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: responsiveWidth(6),
    padding: responsiveWidth(2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: responsiveWidth(7),
    padding: responsiveWidth(3.5),
    marginHorizontal: responsiveWidth(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  seekButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: responsiveWidth(6),
    padding: responsiveWidth(3),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  seekText: {
    color: '#fff',
    fontSize: responsiveFontSize(1.2),
    fontWeight: 'bold',
    position: 'absolute',
    bottom: -2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#fff',
    fontSize: responsiveFontSize(1.4),
    fontFamily: 'Montserrat-Medium',
    minWidth: responsiveWidth(12),
    textAlign: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: responsiveFontSize(1.6),
    fontFamily: 'Montserrat-Medium',
    marginTop: responsiveHeight(2),
  },
  seekBarContainer: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  seekBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    width: '100%',
  },
  seekBarFill: {
    height: '100%',
    backgroundColor: '#4D8733',
    borderRadius: 2,
  },
  seekBarThumb: {
    width: 12,
    height: 12,
    backgroundColor: '#4D8733',
    borderRadius: 6,
    position: 'absolute',
    top: '50%',
    marginTop: -6,
    marginLeft: -6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: responsiveFontSize(2),
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#4D8733',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  backButtonText: {
    color: '#fff',
    fontSize: responsiveFontSize(1.8),
  },
});

export default VideoPlayerScreen;