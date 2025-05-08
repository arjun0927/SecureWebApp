import React, { useState, useRef, useCallback } from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';

// Get screen dimensions for responsive calculations
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scaleFactor = SCREEN_WIDTH / 375;
const rs = (size) => size * scaleFactor; // Responsive size

const EnhancedFlatList = ({ 
  data, 
  renderItem, 
  fetchMoreData, 
  refreshData,
  ListEmptyComponent,
  keyExtractor,
  hasMoreData = true,
  initialNumToRender = 10
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const flatListRef = useRef(null);
  const onEndReachedCalledDuringMomentum = useRef(false);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await refreshData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

  // Load more data when reaching end of list
  const handleLoadMore = useCallback(async () => {
    // Guard conditions to prevent multiple calls
    if (
      !hasMoreData || 
      loadingMore || 
      onEndReachedCalledDuringMomentum.current
    ) return;

    try {
      setLoadingMore(true);
      onEndReachedCalledDuringMomentum.current = true;
      await fetchMoreData();
    } catch (error) {
      console.error('Error loading more data:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMoreData, loadingMore, fetchMoreData]);

  // Render footer with loading indicator
  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color="#4D8733" size="small" />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  }, [loadingMore]);

  // Memoize item layout for better performance
  const getItemLayout = useCallback((_, index) => ({
    length: rs(200), // Adjust based on your item height
    offset: rs(200) * index,
    index,
  }), []);

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={5}
      windowSize={10}
      initialNumToRender={initialNumToRender}
      updateCellsBatchingPeriod={50}
      getItemLayout={getItemLayout}
      
      // Infinite scroll properties
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.3}
      onMomentumScrollBegin={() => {
        onEndReachedCalledDuringMomentum.current = false;
      }}
      
      // Pull to refresh
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#4D8733']}
          tintColor="#4D8733"
        />
      }
      
      // Footer & empty state
      ListFooterComponent={renderFooter}
      ListEmptyComponent={ListEmptyComponent}
      
      // Styling
      contentContainerStyle={
        data.length === 0
          ? styles.emptyContainer
          : styles.contentContainer
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: rs(20),
    paddingHorizontal: rs(15)
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: rs(15),
    gap: rs(8)
  },
  loadingText: {
    fontSize: rs(14),
    color: '#4D8733',
    fontFamily: 'Poppins-Regular'
  }
});

export default React.memo(EnhancedFlatList);

// Usage example:
/*

*/