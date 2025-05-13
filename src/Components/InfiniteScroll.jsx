import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator
} from 'react-native';
import React, { useState, useRef, useCallback, useEffect } from 'react';

const InfiniteScroll = ({
  data = [],
  renderItem,
  keyExtractor,
  initialNumToRender = 5,
  onEndReachedThreshold = 0.5,
  fetchData,
  ListEmptyComponent,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  getItemLayout,
  itemHeight = 200, // Default item height if getItemLayout is not provided
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const flatListRef = useRef(null);
  const hasFetchedData = useRef(false);

  // Default getItemLayout if not provided
  const defaultGetItemLayout = useCallback((_, index) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  }), [itemHeight]);

  // Initial data fetch
  useEffect(() => {
    let isMounted = true;

    const initialFetch = async () => {
      if (hasFetchedData.current) return;

      try {
        setLoading(true);
        if (fetchData) {
          await fetchData(1); // Fetch first page
        }
        hasFetchedData.current = true;
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initialFetch();

    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  // Load more data function
  const loadMoreData = useCallback(async () => {
    if (!hasMoreData || loadingMore || !fetchData) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      
      // Call the fetchData function with the next page
      const hasMore = await fetchData(nextPage);
      
      // Update pagination state
      setCurrentPage(nextPage);
      setHasMoreData(hasMore !== false); // If fetchData returns false explicitly, stop pagination
    } catch (error) {
      console.error('Error loading more data:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMoreData, loadingMore, currentPage, fetchData]);

  // Handle end reached to load more data
  const handleEndReached = useCallback(() => {
    if (hasMoreData && !loadingMore) {
      loadMoreData();
    }
  }, [hasMoreData, loadingMore, loadMoreData]);

  // Footer with loading indicator
  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={'#4D8733'} size={24} />
      </View>
    );
  }, [loadingMore]);

  // Default empty component
  const DefaultEmptyComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No data found</Text>
    </View>
  ), []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color={'#4D8733'} size={32} />
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout || defaultGetItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={initialNumToRender}
      updateCellsBatchingPeriod={50}
      ListEmptyComponent={ListEmptyComponent || DefaultEmptyComponent}
      ListFooterComponent={renderFooter}
      onEndReached={handleEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      contentContainerStyle={
        data.length === 0 
          ? [styles.emptyListContainer, contentContainerStyle] 
          : contentContainerStyle
      }
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
    />
  );
};

export default InfiniteScroll;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins-Medium',
  },
  emptyListContainer: {
    flex: 1,
  }
});