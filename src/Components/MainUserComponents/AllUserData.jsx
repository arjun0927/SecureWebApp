import { Dimensions, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Animated, TextInput, FlatList } from 'react-native'
import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react'
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather'
import { useGlobalContext } from '../../Context/GlobalContext';
import AddUsersSvg from '../../assets/Svgs/AddUsersSvg';
import SearchSvg from '../../assets/Svgs/SearchSvg';
import DeleteSvg2 from '../../assets/Svgs/DeleteSvg2';
import DeleteSvg from '../../assets/Svgs/DeleteSvg';
import { UIActivityIndicator } from 'react-native-indicators';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import AntDesign from 'react-native-vector-icons/AntDesign'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import DeleteModal from './DeleteModal';
import getToken from '../getToken';
import axios from 'axios';
import ImageModal from '../ImageModal';
import { checkBooleanCondition, checkDateCondition, checkNumberCondition, checkStringCondition, convertToNumber } from '../ConditionalFormatting';
import { useCameraDevice , useCameraPermission } from 'react-native-vision-camera';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Scale factor for responsive font sizing
const scaleFactor = SCREEN_WIDTH / 375; // Based on standard iPhone width

// Responsive sizing functions
const rs = (size) => size * scaleFactor; // Responsive size
const rf = (size) => Math.round(size * scaleFactor); // Responsive font size

// Constants for pagination
const PAGE_SIZE = 20;


// Add this custom hook at the top of the file, after imports
const useDebounce = (value, delay) => {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(timer);
		};
	}, [value, delay]);

	return debouncedValue;
};

const AllUserData = ({ route }) => {
	const animation = useRef(new Animated.Value(0)).current;
	const addButtonOpacity = useRef(new Animated.Value(1)).current;
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
	const [flatlistData, setFlatlistData] = useState([]);
	const [formattingData, setFormattingData] = useState([]);
	const [hasMoreData, setHasMoreData] = useState(true);
	const [tableData, setTableData] = useState([]);
	const searchInputRef = useRef(null);
	const isLoadingRef = useRef(false); // Ref to prevent multiple simultaneous load requests
	const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms delay

	// console.log('route.params : ', route.params)


	const {
		showToast,
		getAllTableData,
		userData,
		typeInfo,
		setUserData,
		globalFieldSettings,
	} = useGlobalContext();
	const { id, tableAccess, tableName } = route.params;

	// console.log('table Access : ', tableAccess)


	const tableInfo = globalFieldSettings.filter((item) => item._id === id);
	const globalPermission = tableInfo[0]?.userFieldSettings || {};
	const role = tableInfo[0]?.role;

	// console.log('tableInfo : ',tableInfo)

	// console.log('globalPermission : ', globalPermission)
	// console.log('tableInfo : ', tableInfo)
	// console.log('typeInfo : ',typeInfo?.deletePermission)
	// console.log('deletePermission : ',typeInfo?.deletePermission)

	const userPermission = tableInfo[0];
	const createPermission = userPermission?.createPermission
	const deletePermission = userPermission?.deletePermission
	// const editPermission = userPermission?.editPermission
	const permission = userPermission?.userFieldSettings

	// console.log('deletePermission : ',deletePermission)
	// console.log('userPermission : ',userPermission?.userFieldSettings)


	useEffect(() => {
		const data = Object.entries(tableAccess).map(([key, value]) => ({
			key,
			value
		}));
		setFormattingData(data);
	}, [])

	// console.log('formattingData : ', formattingData)

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const tableData = await getAllTableData(id);
				// console.log('tableData : ', tableData?.tableSettingsData
				// 	?.fields)
				// console.log('tableData : ', tableData)
				setTableData(tableData?.tableSettingsData?.fields)
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
	}, []);

	// useEffect(() => {
	// 	console.log('tableData : ', tableData)
	// }, [tableData])

	// Load initial data when userData changes
	useEffect(() => {
		if (userData.length > 0) {
			loadInitialData();
		}
	}, [userData]);

	// Load initial batch of data
	const loadInitialData = () => {
		// console.log('user Data : ', userData)
		const initialData = userData.slice(0, PAGE_SIZE);
		// console.log('initialData : ', initialData)
		setFlatlistData(initialData);
		setCurrentPage(1);
		setHasMoreData(initialData.length < userData.length);
	};

	// console.log('flatlistData : ', flatlistData)

	// Load more data function for infinite scroll
	const loadMoreData = useCallback(() => {
		// Return if already loading or no more data
		if (isLoadingRef.current || !hasMoreData || loadingMore) return;

		const nextPage = currentPage + 1;
		const startIndex = currentPage * PAGE_SIZE;
		const endIndex = nextPage * PAGE_SIZE;

		// If we're at the end of the data
		if (startIndex >= userData.length) {
			setHasMoreData(false);
			return;
		}

		// Set loading states
		isLoadingRef.current = true;
		setLoadingMore(true);

		// Simulate network delay (remove in production)
		setTimeout(() => {
			const newData = userData.slice(0, endIndex);

			setFlatlistData(newData);
			setCurrentPage(nextPage);
			setHasMoreData(endIndex < userData.length);
			setLoadingMore(false);
			isLoadingRef.current = false;
		}, 500);
	}, [currentPage, userData, hasMoreData, loadingMore]);

	const toggleSearch = useCallback(() => {
		if (isSearchVisible) {
			// Hide search bar
			Animated.parallel([
				Animated.timing(animation, {
					toValue: 0,
					duration: 300,
					useNativeDriver: false,
				}),
				Animated.timing(addButtonOpacity, {
					toValue: 1,
					duration: 300,
					useNativeDriver: false,
				}),
			]).start(() => {
				setSearchVisible(false);
				setSearchTerm('');
			});
		} else {
			// Show search bar
			setSearchVisible(true);
			Animated.parallel([
				Animated.timing(animation, {
					toValue: 1,
					duration: 300,
					useNativeDriver: false,
				}),
				Animated.timing(addButtonOpacity, {
					toValue: 0,
					duration: 150,
					useNativeDriver: false,
				}),
			]).start(() => {
				// Focus search input after animation completes
				if (searchInputRef.current) {
					searchInputRef.current.focus();
				}
			});
		}
	}, [isSearchVisible, animation, addButtonOpacity]);

	// Focus search input when it becomes visible
	useEffect(() => {
		if (isSearchVisible && searchInputRef.current) {
			searchInputRef.current.focus();
		}
	}, [isSearchVisible]);

	const handleEdit = useCallback((item, index) => {
		navigation.navigate('MainEditUser', {
			id: id,
			tableAccess: tableAccess,
			__ID: item.__ID,
			userItem: item,
			// typeInfo: typeInfo,
			// screenInfo: {
			// 	screen: 'AllUserData',
			// }
		});
	}, [navigation, fieldData, id, typeInfo]);


	// Filter data based on search term
	const filteredData = useMemo(() => {
		if (!debouncedSearchTerm.trim()) return flatlistData;

		return flatlistData.filter(item => {
			if (!item) return false;

			return Object.entries(item).some(([key, value]) => {
				if (key === '__ID') return false;
				if (value == null) return false;

				return String(value).toLowerCase().includes(debouncedSearchTerm.toLowerCase());
			});
		});
	}, [flatlistData, debouncedSearchTerm]);

	const ListEmptyComponent = React.useCallback(() => (
		<View style={styles.emptyContainer}>
			<Feather name="database" size={rs(50)} color="#CCC" />
			<Text style={styles.emptyText}>No data found</Text>
		</View>
	), []);

	// Footer with loading indicator - memoized
	const renderFooter = React.useCallback(() => {
		if (!loadingMore) return null;

		return (
			<View style={styles.footerLoader}>
				<UIActivityIndicator color={'#4D8733'} />
			</View>
		);
	}, [loadingMore]);

	// Calculate search width based on animation value
	// const finalWidth = role === 'USER' && typeInfo?.deletePermission
	// 	? SCREEN_WIDTH - rs(83)
	// 	: SCREEN_WIDTH - rs(130);

	const searchWidth = animation.interpolate({
		inputRange: [0, 1],
		outputRange: [0, SCREEN_WIDTH - rs(130)],
	});


	const navigation = useNavigation();


	const onToggle = (index) => {
		setExpandedIndex(expandedIndex === index ? null : index);
	}

	const onCircleSelect = (index) => {
		setSelectedIndices(
			prevIndex => prevIndex.includes(index) ? prevIndex.filter(i => i !== index) : [
				...prevIndex, index
			]
		)
	}


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
				const token = await getToken()
				setDeleteTableLoader(true);

				const response = await axios.post(
					`https://secure.ceoitbox.com/api/delete/TableData/${id}`,
					{ delete__IDs: idsToDelete },
					{ headers: { Authorization: `Bearer ${token}` } }
				);

				if (response) {
					console.log('Data deleted successfully:', response);
					showToast({
						type: 'SUCCESS',
						message: 'Data deleted successfully'
					});

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

	const handleDeletePress = useCallback((index) => {
		setSelectedIndex(index);
		setModalVisible(true);
	}, []);


	const renderItem = ({ item, index }) => {
		const isExpanded = expandedIndex === index;
		// Filter out __ID key and then slice
		const filteredKeys = tableData.filter(key => key !== '__ID');
		// console.log('filteredKeys : ', filteredKeys)
		const keysToShow = isExpanded ? filteredKeys : filteredKeys.slice(0, 2);
		const deleteSelected = selectedIndices.includes(index);
		// console.log('item : ', item)

		return (
			<View style={styles.form}>
				<View style={styles.cardHeader}>
					<View style={styles.leftCardHeader}>
						<TouchableOpacity
							onPress={() => onCircleSelect(index)}
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							<View>
								<>
									{role === 'ADMIN' && (
										deleteSelected ? (
											<View style={styles.selectedCircle}>
												<AntDesign name='checkcircle' size={responsiveFontSize(2)} color={'#4D8733'} />
											</View>
										) : (
											<View
												style={{
													width: rs(30),
													height: rs(30),
													justifyContent: 'center',
													alignItems: 'center',
												}}
											>
												<Feather name='circle' size={responsiveFontSize(2)} color={'black'} />
											</View>
										)
									)}
									{
										role === 'USER' && deletePermission && (
											deleteSelected ? (
												<View style={styles.selectedCircle}>
													<AntDesign name='checkcircle' size={responsiveFontSize(2)} color={'#4D8733'} />
												</View>
											) : (
												<View
													style={{
														width: rs(30),
														height: rs(30),
														justifyContent: 'center',
														alignItems: 'center',
													}}
												>
													<Feather name='circle' size={responsiveFontSize(2)} color={'black'} />
												</View>
											)
										)
									}
								</>

							</View>
						</TouchableOpacity>
					</View>
					<View style={styles.rightCardHeader}>
						<TouchableOpacity
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
							onPress={() => handleEdit(item, index)}
						>
							<View style={styles.headerRightIcon}>
								<MaterialIcons name={'edit'} size={responsiveFontSize(2)} color={'black'} />
							</View>
						</TouchableOpacity>
						<>
							{
								role === 'ADMIN' && (
									<TouchableOpacity
										hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
										onPress={() => handleDeletePress(index)}
									>
										<View style={styles.headerRightIcon}>
											<DeleteSvg width={responsiveFontSize(2)} height={responsiveFontSize(2)} />
										</View>
									</TouchableOpacity>
								)
							}
							{
								role === 'USER' && deletePermission && (

									<TouchableOpacity
										hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
										onPress={() => handleDeletePress(index)}
									>
										<View style={styles.headerRightIcon}>
											<DeleteSvg width={responsiveFontSize(2)} height={responsiveFontSize(2)} />
										</View>
									</TouchableOpacity>
								)

							}
						</>
					</View>
				</View>
				<View style={styles.headerLine} />
				<View style={{ flex: 1 }}>
					{keysToShow.map((key, i, arr) => {
						const isLastIndex = i === (arr.length - 1);
						if (key === '__ID') return null;

						const isImageUrl = /\.(jpeg|jpg|gif|png|svg)$/i.test(item[key]);
						const isDriveUrl = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{10,})\/view\?usp=drivesdk/.test(item[key]);

						// Find formatting data for this key
						const fieldData = formattingData.find(formatItem => formatItem.key === key);
						const newKeys = item?.key;
						const permission = globalPermission[`${key}`]
						const viewAccess = permission?.viewAccess
						// console.log('viewAccess : ',viewAccess)
						const conditionalFormatting = fieldData?.value?.conditionalFormatting;

						let cellStyle = {};
						let textStyle = {};

						// Apply conditional formatting if it exists
						if (conditionalFormatting && Array.isArray(conditionalFormatting)) {
							conditionalFormatting.forEach((formatRule) => {
								const { scope, dataType, condition, value: expectedValue, actions } = formatRule;
								let checkValue = item[key];
								let conditionMet = false;

								// console.log('checkValue : ',checkValue)
								// console.log('condition : ',condition)
								// console.log('expectedValue : ',expectedValue)


								// Check condition based on data type
								switch (dataType?.toLowerCase()) {
									case 'number':

										conditionMet = checkNumberCondition(
											convertToNumber(checkValue),
											condition,
											convertToNumber(expectedValue)
										);
										break;

									case 'text':
										conditionMet = checkStringCondition(
											(checkValue || "").toString().toLowerCase(),
											condition,
											(expectedValue || "").toString().toLowerCase()
										);
										break;

									case 'boolean':

										conditionMet = checkBooleanCondition(checkValue, condition);
										break;

									case 'date':
										conditionMet = checkDateCondition(
											checkValue,
											condition,
											expectedValue
										);
										// console.log('conditionMet : ',conditionMet)
										break;

									default:
										conditionMet = checkStringCondition(
											(checkValue || "").toString().toLowerCase(),
											condition,
											(expectedValue || "").toString().toLowerCase()
										);
										break;
								}



								// Apply styles if condition is met
								if (conditionMet && scope === "CELL") {
									if (actions.backgroundColor) {
										cellStyle.backgroundColor = actions.backgroundColor;
									}
									if (actions.bold) textStyle.fontWeight = "bold";
									if (actions.italic) textStyle.fontStyle = "italic";
									if (actions.underline) textStyle.textDecorationLine = "underline";
									if (actions.textColor) textStyle.color = actions.textColor;
								}
							});
						}

						const uniqueKey = `${item.__ID}-${key}-${i}-${index}`;

						// console.log('item key : ',item[key])
						// console.log('key : ',key)
						// console.log('per',permission)
						// console.log('permission : ',permission?.fieldName[key])
						let view;
						if (permission?.fieldName === key) {
							view = permission?.viewAccess
						}

						// console.log('role : ',role)

						return (
							<>
								{role === 'ADMIN' && (
									<View key={uniqueKey} style={[styles.dataRow, isLastIndex && styles.noBorder]}>
										<Text style={styles.rowLabel} >
											{key}
										</Text>

										{isImageUrl || isDriveUrl ? (
											<TouchableOpacity
												onPress={() => {
													setVisible(true);
													setImageUri(item[key]);
												}}
												style={{ flex: 1 }}
											>
												<Text style={{ color: 'blue', textDecorationLine: 'underline' }}>Click Here</Text>
											</TouchableOpacity>
										) : (
											<View style={[{ flex: 1, paddingTop: 2 }, cellStyle]}>
												<Text
													style={[styles.rowValue, textStyle]}
												>
													{item[key]}
												</Text>
											</View>
										)}
									</View>
								)}

								{role === 'USER' && view && (
									<View key={uniqueKey} style={[styles.dataRow, isLastIndex && styles.noBorder]}>
										<Text style={styles.rowLabel} ellipsizeMode="tail" numberOfLines={1}>
											{key}
										</Text>

										{isImageUrl || isDriveUrl ? (
											<TouchableOpacity
												onPress={() => {
													setVisible(true);
													setImageUri(item[key]);
												}}
												style={{ flex: 1 }}
											>
												<Text style={{ color: 'blue', textDecorationLine: 'underline' }}>Click Here</Text>
											</TouchableOpacity>
										) : (
											<View style={[{ flex: 1, paddingTop: 2 }, cellStyle]}>
												<Text
													style={[styles.rowValue, textStyle]}
													numberOfLines={1}
													ellipsizeMode="tail"
												>
													{item[key]}
												</Text>
											</View>
										)}
									</View>
								)}
							</>
						);

					})}

					{Object.keys(item).length > 3 && (
						<TouchableOpacity
							onPress={() => onToggle(index)}
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
					)}
				</View>
			</View>
		);
	};


	// console.log('userData : ', filteredData)


	return (
		<SafeAreaView style={styles.container}>
			<StatusBar backgroundColor={'#F4FAF4'} barStyle={'dark-content'} />
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

			{/* Actions bar with fixed height */}
			<View style={styles.actionsBar}>
				<View style={{ flexDirection: 'row', }}>
					<TouchableOpacity
						style={styles.iconButton}
						onPress={toggleSearch}
						hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
						activeOpacity={0.7}
					>
						<SearchSvg width={rs(20)} height={rs(20)} />
					</TouchableOpacity>

					<Animated.View style={[styles.searchContainer, { width: searchWidth }]}>
						{isSearchVisible && (
							<TextInput
								ref={searchInputRef}
								style={styles.searchInput}
								placeholder="Search..."
								placeholderTextColor="#888"
								value={searchTerm}
								onChangeText={setSearchTerm}
								numberOfLines={1}
								ellipsizeMode="tail"
							/>
						)}
					</Animated.View>
				</View>

				<View style={{ flexDirection: 'row', }}>
					<>
						{
							role === 'ADMIN' && (
								<TouchableOpacity
									onPress={() => setModalVisible(true)}
									style={[
										styles.iconButton,
										{ opacity: selectedIndices.length > 0 ? 1 : 0.5 }
									]}
									disabled={selectedIndices.length === 0}
									activeOpacity={0.9}
								>
									<DeleteSvg2
										strokeColor={'#4D8733'}
										fillColor={'#4D8733'}
										width={rs(22)}
										height={rs(22)}
									/>
								</TouchableOpacity>
							)
						}
						{
							role === 'USER' && deletePermission && (
								<TouchableOpacity
									onPress={() => setModalVisible(true)}
									style={[
										styles.iconButton,
										{ opacity: selectedIndices.length > 0 ? 1 : 0.5 }
									]}
									disabled={selectedIndices.length === 0}
									activeOpacity={0.9}
								>
									<DeleteSvg2
										strokeColor={'#4D8733'}
										fillColor={'#4D8733'}
										width={rs(22)}
										height={rs(22)}
									/>
								</TouchableOpacity>
							)
						}
					</>


					<>
						{
							role === 'ADMIN' && (
								<Animated.View style={{ opacity: addButtonOpacity }}>
									<TouchableOpacity
										hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
										style={styles.addButton}
										activeOpacity={0.7}
										onPress={() => navigation.navigate('UserAddNewData', {
											tableAccess,
											id,
											typeInfo
										})}
									>
										<AddUsersSvg width={rs(20)} height={rs(20)} />
										<Text style={styles.addButtonText}>Add New Data</Text>
									</TouchableOpacity>
								</Animated.View>
							)
						}
						{
							role === 'USER' && createPermission && (
								<Animated.View style={{ opacity: addButtonOpacity }}>
									<TouchableOpacity
										hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
										style={styles.addButton}
										activeOpacity={0.7}
										onPress={() => navigation.navigate('UserAddNewData', {
											tableAccess,
											id,
											typeInfo
										})}
									>
										<AddUsersSvg width={rs(20)} height={rs(20)} />
										<Text style={styles.addButtonText}>Add New Data</Text>
									</TouchableOpacity>
								</Animated.View>
							)
						}

					</>

				</View>
			</View>

			{
				loading ? (
					<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
						<UIActivityIndicator color={'#4D8733'} />
					</View>
				) : (
					<FlatList
						data={filteredData}
						renderItem={renderItem}
						keyExtractor={(item, index) => item?.__ID?.toString() || index.toString()}
						ListEmptyComponent={ListEmptyComponent}
						ListFooterComponent={renderFooter}
						onEndReached={loadMoreData}
						onEndReachedThreshold={0.5}
						contentContainerStyle={{
							paddingBottom: rs(5)
						}}
						showsVerticalScrollIndicator={false}
					/>
				)
			}
			{
				modalVisible && (
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
						contentType={'data'}
					/>
				)
			}
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
		</SafeAreaView>
	);
};

export default AllUserData;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F4FAF4',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: Platform.OS === 'ios' ? rs(40) : rs(10),
		marginBottom: rs(10),
		paddingHorizontal: rs(15),
	},
	backButton: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	usersText: {
		color: '#848486',
		fontSize: rf(14),
		fontFamily: 'Poppins-Regular',
		marginRight: rs(2),
	},
	headerTitle: {
		color: '#222327',
		fontSize: rf(16),
		fontFamily: 'Poppins-Medium',
		marginLeft: rs(2),
	},

	actionsBar: {
		flexDirection: 'row',
		paddingHorizontal: rs(15),
		height: rs(50),
		gap: rs(10),
	},

	leftSection: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1, // Take available space
	},

	// Right side of actions bar
	rightSection: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-end',
	},

	// Icons with consistent styling
	iconButton: {
		width: rs(40),
		height: rs(40),
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
		marginRight: rs(10),
	},

	// Search container with fixed height
	searchContainer: {
		height: rs(40),
		justifyContent: 'center',
		overflow: 'hidden', // Prevents content from showing during animation
	},

	// Search input with appropriate text styling
	searchInput: {
		height: '100%',
		width: '100%',
		backgroundColor: '#FFF',
		fontSize: rf(14),
		fontFamily: 'Poppins-Regular',
		borderRadius: rs(8),
		paddingHorizontal: rs(15),
		borderColor: '#DDD',
		borderWidth: 1,
		includeFontPadding: false, // Helps with text vertical alignment
		textAlignVertical: 'center', // Center text vertically
	},

	addButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: rs(10),
		paddingVertical: rs(8),
		backgroundColor: '#FFF',
		borderColor: '#4D8733',
		borderWidth: 1,
		borderRadius: rs(10),
		height: rs(40),
	},

	addButtonText: {
		fontSize: rf(14),
		color: 'black',
		fontFamily: 'Poppins-Medium',
		marginLeft: rs(5),
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
		paddingHorizontal: rs(10),
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
		marginTop: rs(5),
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