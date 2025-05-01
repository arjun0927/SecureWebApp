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
import { UIActivityIndicator } from 'react-native-indicators';
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import SearchSvg from '../../assets/Svgs/SearchSvg';
import DeleteSvg2 from '../../assets/Svgs/DeleteSvg2';
import DeleteSvg from '../../assets/Svgs/DeleteSvg';
import AddUsersSvg from '../../assets/Svgs/AddUsersSvg';
import Circle from '../../assets/Svgs/Circle';
import EditSvg from '../../assets/Svgs/EditSvg';
import DeleteModal from '../MainUserComponents/DeleteModal';
import RadioSelectedCheckbox from '../../assets/Svgs/RadioSelectedCheckbox';
import axios from 'axios';
import { ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from '../../Context/GlobalContext';
import { responsiveWidth } from 'react-native-responsive-dimensions';

// Get screen dimensions for responsive calculations
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Scale factor for responsive font sizing
const scaleFactor = SCREEN_WIDTH / 375; // Based on standard iPhone width

// Responsive sizing functions
const rs = (size) => size * scaleFactor; // Responsive size
const rf = (size) => Math.round(size * scaleFactor); // Responsive font size

// Separate component for table row to prevent unnecessary rerenders
const TableRow = React.memo(({
	item,
	index,
	fieldsToDisplay,
	expandedIndex,
	toggleAccordion,
	hasMoreFields,
	handleCircleSelect,
	selectedIndices,
	navigation,
	fieldData,
	id,
	typeInfo,
	onDeletePress
}) => {
	return (
		<View style={styles.form}>
			<View style={styles.cardHeader}>
				<View style={styles.leftCardHeader}>
					<TouchableOpacity
						onPress={() => handleCircleSelect(index, item)}
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						<View>
							{selectedIndices.includes(index) ? (
								<View style={styles.selectedCircle}>
									<RadioSelectedCheckbox />
								</View>
							) : (
								<Circle />
							)}
						</View>
					</TouchableOpacity>
				</View>
				<View style={styles.rightCardHeader}>
					<TouchableOpacity
						onPress={() => navigation.navigate('MainEditUser', {
							fieldData: fieldData,
							id: id,
							__ID: item.__ID,
							userItem: item,
							typeInfo: typeInfo
						})}
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						<View style={styles.headerRightIcon}>
							<EditSvg />
						</View>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => onDeletePress(index)}
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						<View style={styles.headerRightIcon}>
							<DeleteSvg />
						</View>
					</TouchableOpacity>
				</View>
			</View>
			<View style={styles.headerLine}></View>
			<View>
				{fieldsToDisplay.map((field, fieldIndex) => (
					<View key={fieldIndex} style={[
						styles.dataRow,
						fieldIndex === fieldsToDisplay.length - 1 && styles.noBorder,
						field === '__ID' && styles.noBorder
					]}>
						{
							!(field === '__ID') && (
								<>
									<Text
										style={styles.rowLabel}
										numberOfLines={1}
										ellipsizeMode="tail"
									>
										{field}
									</Text>
									<Text
										style={styles.rowValue}
										numberOfLines={1}
										ellipsizeMode="tail"
									>
										{item[field]}
									</Text>
								</>
							)
						}
					</View>
				))}
			</View>

			{hasMoreFields && (
				<TouchableOpacity
					onPress={() => toggleAccordion(index)}
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
					<View style={styles.viewMoreContainer}>
						<Feather
							name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
							color="#4D8733"
							size={rs(20)}
							style={{ marginRight: 5 }}
						/>
						<Text style={styles.viewMoreContainerText}>
							{expandedIndex === index ? 'View Less' : 'View More'}
						</Text>
					</View>
				</TouchableOpacity>
			)}
		</View>
	);
});

const AllTableData = ({ navigation, route }) => {
	const [selectedIndices, setSelectedIndices] = useState([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [expandedIndex, setExpandedIndex] = useState(null);
	const [loading, setLoading] = useState(false);
	const [fieldData, setFieldData] = useState([]);
	const [selectedIndex, setSelectedIndex] = useState(null);
	const [isSearchVisible, setSearchVisible] = useState(false);
	const [deleteTableLoader, setDeleteTableLoader] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [loadingMore, setLoadingMore] = useState(false);
	const [hasMoreData, setHasMoreData] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const animation = useRef(new Animated.Value(0)).current;
	const textOpacity = useRef(new Animated.Value(1)).current;
	const searchInputRef = useRef(null);

	// Number of fields to display initially
	const initialFieldsToShow = 3;

	const { id, tableAccess, tableName } = route.params;
	const {
		showToast,
		getAllTableData,
		userData,
		typeInfo,
		setUserData,
		setTypeInfo
	} = useGlobalContext();

	const hasFetchedData = useRef(false);

	// Setup fields based on tableAccess
	useEffect(() => {
		if (tableAccess) {
			setFieldData(Object.keys(tableAccess));
		}
	}, [tableAccess]);

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

	// Initial data fetch
	useEffect(() => {
		const fetchData = async () => {
			if (hasFetchedData.current) return;

			try {
				setLoading(true);
				await getAllTableData(id);
				hasFetchedData.current = true;
			} catch (error) {
				console.error('Error fetching data:', error);
				showToast({
					type: 'ERROR',
					message: 'Failed to load data'
				});
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [id, getAllTableData, showToast]);


	// Toggle accordion expansion state
	const toggleAccordion = useCallback((index) => {
		setExpandedIndex(prevIndex => prevIndex === index ? null : index);
	}, []);

	// Handle item selection
	const handleCircleSelect = useCallback((index) => {
		setSelectedIndices(prevIndices => {
			if (prevIndices.includes(index)) {
				return prevIndices.filter(i => i !== index);
			} else {
				return [...prevIndices, index];
			}
		});
	}, []);

	// Handle delete operation
	const handleDelete = useCallback(async () => {
		try {
			let idsToDelete = [];

			if (selectedIndices.length > 0) {
				idsToDelete = selectedIndices.map(index => userData[index]?.__ID);
			} else if (selectedIndex !== null) {
				idsToDelete = [userData[selectedIndex]?.__ID];
			}

			if (idsToDelete.length > 0) {
				const token = await AsyncStorage.getItem('token');
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

					setUserData(prevData =>
						prevData.filter((_, index) => !idsToDelete.includes(userData[index]?.__ID))
					);

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

	// Toggle search animation
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
					duration: 150, // Fade out text faster
					useNativeDriver: false,
				}),
			]).start(() => {
				searchInputRef.current?.focus();
			});
		}
	}, [isSearchVisible, animation, textOpacity]);

	const searchWidth = animation.interpolate({
		inputRange: [0, 1],
		outputRange: [0, SCREEN_WIDTH * 0.65], // Use absolute width instead of percentage
	});

	const searchHeight = animation.interpolate({
		inputRange: [0, 1],
		outputRange: [0, rs(40)],
	});

	// Filter data based on search term - memoized for performance
	const filteredData = useMemo(() => {
		if (!searchTerm.trim()) return userData;

		return userData.filter(item =>
			Object.values(item).some(value =>
				String(value).toLowerCase().includes(searchTerm.toLowerCase())
			)
		);
	}, [userData, searchTerm]);

	// Get fields to display based on expanded state
	const getFieldsToDisplay = useCallback((index) => {
		if (expandedIndex === index) {
			return fieldData; // Show all fields when expanded
		}
		return fieldData.slice(0, initialFieldsToShow); // Show limited fields when collapsed
	}, [expandedIndex, fieldData, initialFieldsToShow]);

	// Check if there are more fields to show
	const hasMoreFields = fieldData.length > initialFieldsToShow;

	// Handle individual row delete button press
	const handleDeletePress = useCallback((index) => {
		setSelectedIndex(index);
		setModalVisible(true);
	}, []);

	// Optimize FlatList rendering
	const getItemLayout = useCallback((_, index) => ({
		length: rs(200),
		offset: rs(200) * index,
		index,
	}), []);

	// Footer with loading indicator - memoized
	const renderFooter = useCallback(() => {
			if (!loadingMore) return null;
			
			return (
				<View style={styles.footerLoader}>
					<UIActivityIndicator color={'#4D8733'} size={rs(20)} />
				</View>
			);
		}, [loadingMore]);

	const keyExtractor = useCallback((item) =>
		item.__ID ? item.__ID.toString() : Math.random().toString()
		, []);

	const renderItem = useCallback(({ item, index }) => {
		const fieldsToDisplay = getFieldsToDisplay(index);

		return (
			<TableRow
				item={item}
				index={index}
				fieldsToDisplay={fieldsToDisplay}
				expandedIndex={expandedIndex}
				toggleAccordion={toggleAccordion}
				hasMoreFields={hasMoreFields}
				handleCircleSelect={handleCircleSelect}
				selectedIndices={selectedIndices}
				navigation={navigation}
				fieldData={fieldData}
				id={id}
				typeInfo={typeInfo}
				onDeletePress={handleDeletePress}
			/>
		);
	}, [
		getFieldsToDisplay,
		expandedIndex,
		toggleAccordion,
		hasMoreFields,
		handleCircleSelect,
		selectedIndices,
		navigation,
		fieldData,
		id,
		typeInfo,
		handleDeletePress
	]);

	const ListEmptyComponent = useCallback(() => (
		<View style={styles.emptyContainer}>
			<Feather name="database" size={rs(50)} color="#CCC" />
			<Text style={styles.emptyText}>No data found</Text>
		</View>
	), []);

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
							<SearchSvg />
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
								<DeleteSvg2 strokeColor={'#4D8733'} fillColor={'#4D8733'} />
							</View>
						</TouchableOpacity>

						<Animated.View style={{ opacity: isSearchVisible ? 0 : 1 }}>
							<TouchableOpacity
								onPress={() => navigation.navigate('UserAddNewData', {
									fieldData: fieldData,
									id: id,
									typeInfo: typeInfo
								})}
								hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
							>
								<View style={styles.addUserContainer}>
									<AddUsersSvg />
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
							data={filteredData}
							renderItem={renderItem}
							keyExtractor={keyExtractor}
							getItemLayout={getItemLayout}
							removeClippedSubviews={true}
							maxToRenderPerBatch={10}
							windowSize={10}
							initialNumToRender={8}
							updateCellsBatchingPeriod={50}
							ListEmptyComponent={ListEmptyComponent}
							ListFooterComponent={renderFooter}
							contentContainerStyle={
								filteredData.length === 0
									? { flex: 1 }
									: { paddingBottom: rs(20) }
							}
							onEndReached={hasMoreData ? loadMoreData : null}
							onEndReachedThreshold={0.5} // Start loading when user is halfway through the last item
							showsVerticalScrollIndicator={false}
						/>
					</View>
				)}

				{/* Delete Modal */}
				{modalVisible && (
					<DeleteModal
						modalVisible={modalVisible}
						deleteTableLoader={deleteTableLoader}
						setModalVisible={setModalVisible}
						handleDelete={handleDelete}
						handleCancel={() => setModalVisible(false)}
						selectedIndices={selectedIndices}
					/>
				)}
			</View>
		</KeyboardAvoidingView>
	);
};

export default AllTableData;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F4FAF4',
		// paddingTop: Platform.OS === 'ios' ? rs(40) : rs(20),
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
		// paddingVertical: rs(10),
	},
	backButton: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	usersText: {
		color: '#848486',
		fontSize: rf(16),
		fontFamily: 'Poppins-Medium',
		marginRight: rs(5),
	},
	headerTitle: {
		color: '#222327',
		fontSize: rf(18),
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
		// height: '100%',
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
		// paddingHorizontal: rs(12),
		width: responsiveWidth(10),
		height: responsiveWidth(10),
		// paddingVertical: rs(8),
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
		fontSize: rf(15),
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
		fontSize: rf(14),
		fontFamily: 'Poppins-Regular',
	},
	rowValue: {
		flex: 1,
		color: '#767A8D',
		fontSize: rf(14),
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