import {
	StyleSheet,
	Text,
	TextInput,
	View,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
	Animated,
	FlatList,
	StatusBar,
	Dimensions,
} from 'react-native';
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import SearchSvg from '../../assets/Svgs/SearchSvg';
import DeleteSvg2 from '../../assets/Svgs/DeleteSvg2';
import DeleteSvg from '../../assets/Svgs/DeleteSvg';
import AddUsersSvg from '../../assets/Svgs/AddUsersSvg';
import DeleteModal from '../MainUserComponents/DeleteModal';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import axios from 'axios';
import { UIActivityIndicator } from 'react-native-indicators';
import { useGlobalContext } from '../../Context/GlobalContext';
import { responsiveFontSize, responsiveWidth } from 'react-native-responsive-dimensions';
import ImageModal from '../ImageModal';
import getToken from '../getToken';

// Get screen dimensions for responsive calculations
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Scale factor for responsive font sizing
const scaleFactor = SCREEN_WIDTH / 375; // Based on standard iPhone width

// Responsive sizing functions
const rs = (size) => size * scaleFactor; // Responsive size
const rf = (size) => Math.round(size * scaleFactor); // Responsive font size
const regex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{10,})\/view\?usp=drivesdk/;

const DataRow = React.memo(({ field, value, isLast, setVisible, setImageUri }) => {
	if (field === '__ID') return null;

	return (
		<View style={[styles.dataRow, isLast && styles.noBorder]}>
			<Text
				style={styles.rowLabel}
				numberOfLines={1}
				ellipsizeMode="tail"
			>
				{field}
			</Text>

			{
				regex.test(value) ? (
					<TouchableOpacity
						onPress={() => {
							setVisible(true);
							setImageUri(value);
						}}
						style={{
							flex: 1,
							fontSize: rf(14),
							fontFamily: 'Poppins-Regular',
						}}
					>
						<Text style={{ color: 'blue', textDecorationLine: 'underline' }}>
							Click here
						</Text>
					</TouchableOpacity>

				) : (
					<Text style={styles.rowValue}
						numberOfLines={1}
						ellipsizeMode="tail"
					>
						{value}
					</Text>
				)
			}
		</View>
	);
});

// Separate component for action buttons to prevent unnecessary rerenders
const TableRowActions = React.memo(({
	index,
	handleCircleSelect,
	isSelected,
	onEdit,
	onDelete
}) => {
	return (
		<View style={styles.cardHeader}>
			<View style={styles.leftCardHeader}>
				<TouchableOpacity
					onPress={() => handleCircleSelect(index)}
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
					<View>
						{isSelected ? (
							<View style={styles.selectedCircle}>
								<AntDesign name='checkcircle' size={responsiveFontSize(2)} color={'#4D8733'} />
							</View>
						) : (
							<Feather name='circle' size={responsiveFontSize(2)} color={'black'} />
						)}
					</View>
				</TouchableOpacity>
			</View>
			<View style={styles.rightCardHeader}>
				<TouchableOpacity
					onPress={onEdit}
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
					<View style={styles.headerRightIcon}>
						<MaterialIcons name={'edit'} size={responsiveFontSize(2)} color={'black'} />
					</View>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={onDelete}
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
					<View style={styles.headerRightIcon}>
						<DeleteSvg width={responsiveFontSize(2)} height={responsiveFontSize(2)} />
					</View>
				</TouchableOpacity>
			</View>
		</View>
	);
});

// Separate component for the "View More/Less" button
const ViewMoreButton = React.memo(({
	isExpanded,
	onToggle,
	show
}) => {
	if (!show) return null;

	return (
		<TouchableOpacity
			onPress={onToggle}
			hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
		>
			<View style={styles.viewMoreContainer}>
				<Feather
					name={isExpanded ? 'chevron-up' : 'chevron-down'}
					color="#4D8733"
					size={rs(20)}
					style={{ marginRight: 5 }}
				/>
				<Text style={styles.viewMoreContainerText}>
					{isExpanded ? 'View Less' : 'View More'}
				</Text>
			</View>
		</TouchableOpacity>
	);
});

// Optimized TableRow component
const TableRow = React.memo(({
	item,
	index,
	initialFieldsToShow,
	expandedIndex,
	toggleAccordion,
	fieldData,
	handleCircleSelect,
	selectedIndices,
	handleEdit,
	handleDeletePress,
	setVisible,
	setImageUri
}) => {
	// Determine which fields to display
	const fieldsToDisplay = expandedIndex === index
		? fieldData
		: fieldData.slice(0, initialFieldsToShow);

	// Check if there are more fields to show
	const hasMoreFields = fieldData.length > initialFieldsToShow;

	// Check if the current row is selected
	const isSelected = selectedIndices.includes(index);

	return (
		<View style={styles.form}>
			<TableRowActions
				index={index}
				handleCircleSelect={handleCircleSelect}
				isSelected={isSelected}
				onEdit={() => handleEdit(item, index)}
				onDelete={() => handleDeletePress(index)}
			/>

			<View style={styles.headerLine} />

			<View>
				{fieldsToDisplay.map((field, fieldIndex) => (
					<DataRow
						key={field}
						field={field}
						value={item[field]}
						isLast={fieldIndex === fieldsToDisplay.length - 1}
						setVisible={setVisible}
						setImageUri={setImageUri}
					/>
				))}
			</View>

			<ViewMoreButton
				isExpanded={expandedIndex === index}
				onToggle={() => toggleAccordion(index)}
				show={hasMoreFields}
			/>
		</View>
	);
}, (prevProps, nextProps) => {
	// Custom comparison function for memoization
	// Return true if the component should NOT re-render
	return (
		prevProps.item === nextProps.item &&
		prevProps.expandedIndex === nextProps.expandedIndex &&
		prevProps.selectedIndices.includes(prevProps.index) ===
		nextProps.selectedIndices.includes(nextProps.index)
	);
});

const AllTableData = ({ navigation, route }) => {
	const [selectedIndices, setSelectedIndices] = useState([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [expandedIndex, setExpandedIndex] = useState(null);
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [fieldData, setFieldData] = useState([]);
	const [selectedIndex, setSelectedIndex] = useState(null);
	const [isSearchVisible, setSearchVisible] = useState(false);
	const [deleteTableLoader, setDeleteTableLoader] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [imageUri, setImageUri] = useState('');
	const [visible, setVisible] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [hasMoreData, setHasMoreData] = useState(true);
	const animation = useRef(new Animated.Value(0)).current;
	const textOpacity = useRef(new Animated.Value(1)).current;
	const searchInputRef = useRef(null);
	const flatListRef = useRef(null);

	// Number of fields to display initially
	const initialFieldsToShow = 3;

	const { id, tableAccess, tableName } = route.params;
	const {
		showToast,
		getAllTableData,
		userData,
		typeInfo,
		setUserData,
	} = useGlobalContext();

	const hasFetchedData = useRef(false);

	// Setup fields based on tableAccess
	useEffect(() => {
		if (tableAccess) {
			// Filter out __ID from initial view but keep it in the data
			const fields = Object.keys(tableAccess);
			setFieldData(fields);
		}
	}, [tableAccess]);

	// Initial data fetch - use a cleanup function to prevent state updates after unmount
	useEffect(() => {
		let isMounted = true;

		const fetchData = async () => {
			if (hasFetchedData.current) return;

			try {
				setLoading(true);
				await getAllTableData(id);
				hasFetchedData.current = true;
			} catch (error) {
				console.error('Error fetching data:', error);
				if (isMounted) {
					showToast({
						type: 'ERROR',
						message: 'Failed to load data'
					});
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		fetchData();

		return () => {
			isMounted = false;
		};
	}, [id, getAllTableData, showToast]);

	// Load more data function - optimized with proper state handling
	const loadMoreData = useCallback(async () => {
		if (!hasMoreData || loadingMore) return;

		try {
			setLoadingMore(true);
			// Here you would implement your pagination logic
			// Simulating a delay for demonstration
			await new Promise(resolve => setTimeout(resolve, 500));

			// Update the current page
			setCurrentPage(prevPage => {
				const newPage = prevPage + 1;
				// Stop pagination after page 3 (for demo)
				if (newPage >= 3) {
					setHasMoreData(false);
				}
				return newPage;
			});
		} catch (error) {
			console.error('Error loading more data:', error);
			showToast({
				type: 'ERROR',
				message: 'Failed to load more data'
			});
		} finally {
			setLoadingMore(false);
		}
	}, [hasMoreData, loadingMore, showToast]);

	// Toggle accordion expansion state - optimized
	const toggleAccordion = useCallback((index) => {
		setExpandedIndex(prevIndex => (prevIndex === index ? null : index));
	}, []);

	// Handle item selection - optimized
	const handleCircleSelect = useCallback((index) => {
		setSelectedIndices(prevIndices =>
			prevIndices.includes(index)
				? prevIndices.filter(i => i !== index)
				: [...prevIndices, index]
		);
	}, []);

	// Handle edit - memoized to avoid re-renders
	const handleEdit = useCallback((item, index) => {
		navigation.navigate('MainEditUser', {
			fieldData: fieldData,
			id: id,
			__ID: item.__ID,
			userItem: item,
			typeInfo: typeInfo,
			screenInfo: {
				screen: 'AllTableData',
			}
		});
	}, [navigation, fieldData, id, typeInfo]);

	// Handle delete operation - optimized
	const handleDelete = useCallback(async () => {
		try {
			let idsToDelete = [];
			let indicesToDelete = [];

			if (selectedIndices.length > 0) {
				// Batch delete
				idsToDelete = selectedIndices.map(index => userData[index]?.__ID).filter(Boolean);
				indicesToDelete = [...selectedIndices];
			} else if (selectedIndex !== null) {
				// Single delete
				const id = userData[selectedIndex]?.__ID;
				if (id) {
					idsToDelete = [id];
					indicesToDelete = [selectedIndex];
				}
			}

			if (idsToDelete.length > 0) {
				const token = await getToken();
				setDeleteTableLoader(true);

				const response = await axios.post(
					`https://secure.ceoitbox.com/api/delete/TableData/${id}`,
					{ delete__IDs: idsToDelete },
					{ headers: { Authorization: `Bearer ${token}` } }
				);

				if (response) {
					showToast({
						type: 'SUCCESS',
						message: 'Data deleted successfully'
					});

					// Update userData by creating a new array without deleted items
					// This is more efficient than filter for large arrays
					const newData = [...userData];
					const newDataFiltered = newData.filter((_, idx) => !indicesToDelete.includes(idx));
					setUserData(newDataFiltered);

					setSelectedIndices([]);
					setSelectedIndex(null);
					setModalVisible(false);
				}
			}
		} catch (error) {
			showToast({
				type: 'ERROR',
				message: 'Error deleting data'
			});
			console.error('Error deleting data:', error);
		} finally {
			setDeleteTableLoader(false);
		}
	}, [selectedIndices, selectedIndex, userData, id, showToast, setUserData]);

	// Toggle search animation - optimized
	const toggleSearch = useCallback(() => {
		if (isSearchVisible) {
			Animated.parallel([
				Animated.timing(animation, {
					toValue: 0,
					duration: 300,
					useNativeDriver: false,
				}),
				Animated.timing(textOpacity, {
					toValue: 1,
					duration: 300,
					useNativeDriver: false,
				}),
			]).start(() => {
				setSearchVisible(false);
				setSearchTerm('');
			});
		} else {
			setSearchVisible(true);
			Animated.parallel([
				Animated.timing(animation, {
					toValue: 1,
					duration: 300,
					useNativeDriver: false,
				}),
				Animated.timing(textOpacity, {
					toValue: 0,
					duration: 150,
					useNativeDriver: false,
				}),
			]).start(() => {
				searchInputRef.current?.focus();
			});
		}
	}, [isSearchVisible, animation, textOpacity]);

	// Optimize search width calculation
	const searchWidth = animation.interpolate({
		inputRange: [0, 1],
		outputRange: [0, SCREEN_WIDTH * 0.65],
	});

	const searchHeight = animation.interpolate({
		inputRange: [0, 1],
		outputRange: [0, rs(40)],
	});

	// Filter data based on search term - optimized for performance
	const filteredData = useMemo(() => {
		if (!searchTerm.trim()) return userData;

		return userData.filter(item => {
			// Quick early return optimization
			if (!item) return false;

			// Use some() for better performance, short-circuits once found
			return Object.entries(item).some(([key, value]) => {
				// Skip filtering on __ID field
				if (key === '__ID') return false;

				// Handle null/undefined values
				if (value == null) return false;

				// Convert value to string and check if it includes search term
				return String(value).toLowerCase().includes(searchTerm.toLowerCase());
			});
		});
	}, [userData, searchTerm]);

	// Handle individual row delete button press - optimized
	const handleDeletePress = useCallback((index) => {
		setSelectedIndex(index);
		setModalVisible(true);
	}, []);

	// Optimize FlatList rendering with constant item heights
	const getItemLayout = useCallback((_, index) => ({
		length: rs(200),
		offset: rs(200) * index,
		index,
	}), []);

	// Extract ID for key with fallback - optimized
	const keyExtractor = useCallback((item) =>
		(item.__ID?.toString() || String(Math.random())),
		[]);

	// Render item - fully memoized
	const renderItem = useCallback(({ item, index }) => (
		<TableRow
			item={item}
			index={index}
			initialFieldsToShow={initialFieldsToShow}
			expandedIndex={expandedIndex}
			toggleAccordion={toggleAccordion}
			fieldData={fieldData}
			handleCircleSelect={handleCircleSelect}
			selectedIndices={selectedIndices}
			handleEdit={handleEdit}
			handleDeletePress={handleDeletePress}
			setVisible={setVisible}
			setImageUri={setImageUri}
		/>
	), [
		expandedIndex,
		toggleAccordion,
		fieldData,
		initialFieldsToShow,
		handleCircleSelect,
		selectedIndices,
		handleEdit,
		handleDeletePress
	]);

	// Empty list component - memoized
	const ListEmptyComponent = useCallback(() => (
		<View style={styles.emptyContainer}>
			<Feather name="database" size={rs(50)} color="#CCC" />
			<Text style={styles.emptyText}>No data found</Text>
		</View>
	), []);

	// Footer with loading indicator - memoized
	const renderFooter = useCallback(() => {
		if (!loadingMore) return null;

		return (
			<View style={styles.footerLoader}>
				<UIActivityIndicator color={'#4D8733'} size={rs(20)} />
			</View>
		);
	}, [loadingMore]);

	// Handle end reached to load more data - optimized
	const handleEndReached = useCallback(() => {
		if (hasMoreData && !loadingMore && !isSearchVisible && searchTerm === '') {
			loadMoreData();
		}
	}, [hasMoreData, loadingMore, loadMoreData, isSearchVisible, searchTerm]);

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
		>
			<StatusBar barStyle="dark-content" backgroundColor="#F4FAF4" />
			<View style={styles.container}>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.usersText}>Table</Text>
					<TouchableOpacity
						style={styles.backButton}
						onPress={() => navigation.goBack()}
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						<Feather name="chevron-left" size={rs(22)} color="black" />
						<Text style={styles.headerTitle}>{tableName}</Text>
					</TouchableOpacity>
				</View>

				{/* Actions Bar */}
				<View style={styles.actionsBar}>
					<View style={styles.leftActions}>
						<TouchableOpacity
							style={styles.svgContainer}
							onPress={toggleSearch}
							hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
						>
							<SearchSvg width={rs(20)} height={rs(20)} />
						</TouchableOpacity>

						<Animated.View style={[
							styles.searchContainer,
							{ height: searchHeight, width: searchWidth }
						]}>
							{isSearchVisible && (
								<TextInput
									ref={searchInputRef}
									style={styles.searchInput}
									placeholder="Search..."
									placeholderTextColor="#888"
									value={searchTerm}
									onChangeText={setSearchTerm}
								/>
							)}
						</Animated.View>
					</View>

					<View style={styles.rightActions}>
						<TouchableOpacity
							onPress={() => setModalVisible(true)}
							disabled={selectedIndices.length === 0}
						>
							<View style={[
								styles.svgContainer,
								{ opacity: selectedIndices.length > 0 ? 1 : 0.5 }
							]}>
								<DeleteSvg2 strokeColor={'#4D8733'} fillColor={'#4D8733'} width={rs(22)} height={rs(22)} />
							</View>
						</TouchableOpacity>

						<Animated.View style={{ opacity: textOpacity }}>
							<TouchableOpacity
								onPress={() => navigation.navigate('UserAddNewData', {
									fieldData: fieldData,
									id: id,
									typeInfo: typeInfo
								})}
								hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
							>
								<View style={styles.addUserContainer}>
									<AddUsersSvg width={rs(20)} height={rs(20)} />
									<Text style={styles.addUserContainerText}>Add New Data</Text>
								</View>
							</TouchableOpacity>
						</Animated.View>
					</View>
				</View>

				{/* Content Area */}
				{loading ? (
					<View style={styles.loaderContainer}>
						<UIActivityIndicator color={'#4D8733'} />
					</View>
				) : (
					<View style={styles.listContainer}>
						<FlatList
							ref={flatListRef}
							data={filteredData}
							renderItem={renderItem}
							keyExtractor={keyExtractor}
							getItemLayout={getItemLayout}
							removeClippedSubviews={true}
							maxToRenderPerBatch={10}
							windowSize={5}
							initialNumToRender={5}
							updateCellsBatchingPeriod={50}
							ListEmptyComponent={ListEmptyComponent}
							ListFooterComponent={renderFooter}
							onEndReached={handleEndReached}
							onEndReachedThreshold={0.5}
							contentContainerStyle={
								filteredData.length === 0 ? { flex: 1 } : { paddingBottom: rs(20) }
							}
							showsVerticalScrollIndicator={false}
						/>
					</View>
				)}

				{/* Delete Modal */}
				{modalVisible && (
					<DeleteModal
						modalVisible={modalVisible}
						deleteLoader={deleteTableLoader}
						setDeleteLoader={setModalVisible}
						handleDelete={handleDelete}
						handleCancel={() => {
							setModalVisible(false);
							setSelectedIndex(null);
						}}
						selectedIndices={selectedIndices}
					/>
				)}
				{
					visible && (
						<ImageModal
							visible={visible}
							imageUri={imageUri}
							setImageUri={setImageUri}
							onClose={() => setVisible(false)}
						/>
					)
				}
			</View>
		</KeyboardAvoidingView>
	);
};

export default AllTableData;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F4FAF4',
		paddingTop: 10,
	},
	loaderContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#FFF',
	},
	listContainer: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: rs(15),
		paddingTop: rs(10),
	},
	backButton: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	usersText: {
		color: '#848486',
		fontSize: rf(14),
		fontFamily: 'Poppins-Medium',
		marginRight: rs(5),
	},
	headerTitle: {
		color: '#222327',
		fontSize: rf(16),
		fontFamily: 'Poppins-Medium',
	},
	actionsBar: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginVertical: rs(15),
		marginHorizontal: rs(15),
	},
	leftActions: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	rightActions: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: responsiveWidth(2),
	},
	searchContainer: {
		overflow: 'hidden',
		marginHorizontal: rs(10),
	},
	searchInput: {
		flex: 1,
		backgroundColor: '#FFF',
		fontSize: rf(14),
		fontFamily: 'Poppins-Regular',
		borderRadius: rs(10),
		paddingHorizontal: rs(15),
		borderColor: '#DDD',
		borderWidth: 1,
	},
	svgContainer: {
		width: responsiveWidth(10),
		height: responsiveWidth(10),
		borderRadius: rs(8),
		backgroundColor: '#FFF',
		elevation: 3,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 0.6,
		borderColor: '#EBE7F3',
	},
	addUserContainer: {
		flexDirection: 'row',
		gap: rs(5),
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: rs(10),
		paddingVertical: rs(8),
		backgroundColor: '#FFF',
		borderColor: '#4D8733',
		borderWidth: 1,
		borderRadius: rs(10),
	},
	addUserContainerText: {
		fontSize: rf(14),
		color: 'black',
		fontFamily: 'Poppins-Medium',
	},
	form: {
		backgroundColor: '#FFF',
		borderRadius: rs(15),
		padding: rs(15),
		borderColor: '#ECF3E9',
		borderWidth: 1,
		marginVertical: rs(8),
		width: '90%',
		alignSelf: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 3,
		elevation: 1,
	},
	cardHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	leftCardHeader: {
		flexDirection: 'row',
		gap: rs(10),
		width: '65%',
		alignItems: 'center',
	},
	rightCardHeader: {
		flexDirection: 'row',
		gap: rs(10),
		alignItems: 'center',
	},
	headerRightIcon: {
		backgroundColor: '#EEF5ED',
		borderRadius: rs(15),
		width: rs(30),
		height: rs(30),
		justifyContent: 'center',
		alignItems: 'center',
	},
	selectedCircle: {
		width: rs(30),
		height: rs(30),
		borderRadius: rs(15),
		backgroundColor: '#E7F4E3',
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerLine: {
		marginTop: rs(12),
		marginBottom: rs(5),
		borderBottomWidth: 1,
		borderColor: '#BDC3D4',
	},
	dataRow: {
		flexDirection: 'row',
		paddingVertical: rs(10),
		paddingHorizontal: rs(5),
		borderBottomWidth: 1,
		borderBottomColor: '#EEEFF6',
	},
	noBorder: {
		borderBottomWidth: 0,
	},
	rowLabel: {
		flex: 1,
		color: '#222327',
		fontSize: rf(13),
		fontFamily: 'Poppins-Regular',
	},
	rowValue: {
		flex: 1,
		color: '#767A8D',
		fontSize: rf(13),
		fontFamily: 'Poppins-Regular',
	},
	viewMoreContainer: {
		flexDirection: 'row',
		paddingHorizontal: rs(20),
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: rs(10),
	},
	viewMoreContainerText: {
		color: '#4D8733',
		fontSize: rf(14),
		fontFamily: 'Poppins-Medium',
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: rs(40),
	},
	emptyText: {
		marginTop: rs(15),
		fontSize: rf(16),
		color: '#666',
		fontFamily: 'Poppins-Medium',
	},
	footerLoader: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: rs(10),
	},
});