import {
	StyleSheet,
	Text,
	TextInput,
	View,
	TouchableOpacity,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	Animated,
	FlatList,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
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

const AllTableData = ({ navigation, route }) => {
	const [selectedIndices, setSelectedIndices] = useState([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [expandedIndex, setExpandedIndex] = useState(null);
	const [loading, setLoading] = useState(false);
	const [fieldData, setFieldData] = useState([]);
	const [selectedIndex, setSelectedIndex] = useState(null);
	const [isSearchVisible, setSearchVisible] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const animation = useRef(new Animated.Value(0)).current;

	// Number of fields to display initially
	const initialFieldsToShow = 3;

	const { id, tableAccess, tableName } = route.params;
	const { showToast, getAllTableData, userData, typeInfo, setUserData, setTypeInfo } = useGlobalContext();

	const hasFetchedData = useRef(false);

	useEffect(() => {
		if (tableAccess) {
			setFieldData(Object.keys(tableAccess));
		}
	}, [tableAccess]);

	useEffect(() => {
		const fetchData = async () => {
			if (hasFetchedData.current) return;

			try {
				setLoading(true);
				await getAllTableData(id);
				hasFetchedData.current = true; // Mark data as fetched
			} catch (error) {
				console.error('Error fetching data:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchData(); // Call fetchData when the component mounts
	}, [id, getAllTableData]);

	const toggleAccordion = (index) => {
		setExpandedIndex(index === expandedIndex ? null : index);
	};

	const handleCircleSelect = (index, item) => {
		if (selectedIndices.includes(index)) {
			setSelectedIndices(selectedIndices.filter((i) => i !== index));
		} else {
			setSelectedIndices([...selectedIndices, index]);
		}
	};

	const handleDelete = async () => {
		try {
			let idsToDelete = [];

			if (selectedIndices.length > 0) {
				// Multiple selection, use the selected indices
				idsToDelete = selectedIndices.map(index => userData[index]?.__ID);
			} else if (selectedIndex !== null) {
				// Single selection, use the selected index
				idsToDelete = [userData[selectedIndex]?.__ID];
			}

			if (idsToDelete.length > 0) {
				const token = await AsyncStorage.getItem('token');
				console.log('idsToDelete:', idsToDelete);

				const response = await axios.post(
					`https://secure.ceoitbox.com/api/delete/TableData/${id}`,
					{ delete__IDs: idsToDelete },
					{ headers: { Authorization: `Bearer ${token}` } }
				);
				console.log('deleteResponse', response.data);
				showToast({
					type: 'SUCCESS',
					message: 'Data deleted successfully'
				});

				setUserData(prevData => prevData.filter((_, index) => !idsToDelete.includes(userData[index]?.__ID)));

				setSelectedIndices([]);
				setSelectedIndex(null);
				setModalVisible(false);
			}
		} catch (error) {
			showToast({
				type: 'ERROR',
				message: 'Error deleting data'
			});
			console.error('Error deleting data:', error);
		}
	};

	const textOpacity = useRef(new Animated.Value(1)).current;

	const toggleSearch = () => {
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
			]).start(() => setSearchVisible(false));
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
					duration: 300,
					useNativeDriver: false,
				}),
			]).start();
		}
	};

	const searchWidth = animation.interpolate({
		inputRange: [0, 1],
		outputRange: ['0%', '48%'],
	});

	const searchHeight = animation.interpolate({
		inputRange: [0, 1],
		outputRange: [0, 50],
	});

	const filteredData = userData.filter(item =>
		Object.values(item).some(value =>
			String(value).toLowerCase().includes(searchTerm.toLowerCase())
		)
	);

	const handleSearch = (term) => {
		setSearchTerm(term);
	};

	// Function to get fields to display based on expanded state
	const getFieldsToDisplay = (index) => {
		if (expandedIndex === index) {
			return fieldData; // Show all fields when expanded
		}
		return fieldData.slice(0, initialFieldsToShow); // Show only the first 4 fields when collapsed
	};

	// Check if there are more fields to show
	const hasMoreFields = (fieldData?.length || 0) > initialFieldsToShow;

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<View style={styles.container}>
				<View style={styles.header}>
					<Text style={styles.usersText}>Table</Text>
					<TouchableOpacity
						style={{ flexDirection: 'row' }}
						onPress={() => navigation.goBack()}
					>
						<Feather name="chevron-left" size={24} color="black" />
						<Text style={styles.headerTitle}>{tableName}</Text>
					</TouchableOpacity>
				</View>

				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						marginVertical: 20,
						marginHorizontal: 15,
					}}
				>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<View style={styles.actionsContainer}>
							<TouchableOpacity style={styles.svgContainer} onPress={toggleSearch}>
								<SearchSvg />
							</TouchableOpacity>
						</View>
						<Animated.View style={[styles.searchContainer, { height: searchHeight, width: searchWidth }]}>
							{isSearchVisible && (
								<TextInput
									style={styles.searchInput}
									placeholder="Search..."
									placeholderTextColor="#888"
									value={searchTerm}
									onChangeText={handleSearch}
								/>
							)}
						</Animated.View>

						<View style={{ flexDirection: 'row', gap: 10 }}>
							<TouchableOpacity
								onPress={() => setModalVisible(true)}
								disabled={selectedIndices.length === 0}
								activeOpacity={0.1}
							>
								<View
									style={[
										styles.svgContainer,
										{ opacity: selectedIndices.length > 0 ? 1 : 0.5 },
									]}
								>
									<DeleteSvg2 strokeColor={'#4D8733'} fillColor={'#4D8733'} />
								</View>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() =>
									navigation.navigate('UserAddNewData', { fieldData: fieldData, id: id, typeInfo: typeInfo })
								}>
								<View style={styles.addUserContainer}>
									<View>
										<AddUsersSvg />
									</View>
									<Animated.View style={{ opacity: textOpacity }}>
										{!isSearchVisible && (
											<Text style={styles.addUserContainerText}>Add New Data</Text>
										)}
									</Animated.View>
								</View>
							</TouchableOpacity>
						</View>
					</View>
				</View>

				{loading ? (
					<View style={styles.loaderContainer}>
						<ActivityIndicator animating={true} size={'large'} color="#4D8733" />
					</View>
				) : (
					<View style={{ marginBottom: 105 }}>
						<FlatList
							data={filteredData}
							keyExtractor={(item, index) =>
								item.id ? item.id.toString() : index.toString()
							}
							renderItem={({ item, index }) => {
								const fieldsToDisplay = getFieldsToDisplay(index);

								return (
									<View style={styles.form}>
										<View style={styles.cardHeader}>
											<View style={styles.leftCardHeader}>
												<TouchableOpacity onPress={() => handleCircleSelect(index, item)}>
													<View>
														{selectedIndices.includes(index) ? (
															<View
																style={{
																	width: 30,
																	height: 30,
																	borderRadius: 15,
																	backgroundColor: '#E7F4E3',
																	justifyContent: 'center',
																	alignItems: 'center',
																}}
															>
																<RadioSelectedCheckbox />
															</View>
														) : (
															<Circle />
														)}
													</View>
												</TouchableOpacity>
												{/* <Text style={styles.headerText}>{item.__ID}</Text> */}
											</View>
											<View style={styles.rightCardHeader}>
												<TouchableOpacity onPress={() => navigation.navigate('MainEditUser', { fieldData: fieldData, id: id, __ID: item.__ID, userItem: item, typeInfo: typeInfo })}>
													<View style={styles.headerRightIcon}>
														<EditSvg />
													</View>
												</TouchableOpacity>
												<TouchableOpacity onPress={() => {
													setSelectedIndex(index);
													setModalVisible(true);
												}}>
													<View style={styles.headerRightIcon}>
														<DeleteSvg />
													</View>
												</TouchableOpacity>
											</View>
										</View>
										<View style={styles.headerLine}></View>
										<View>
											{fieldsToDisplay.map((field, fieldIndex) => {
												return (
													<View key={fieldIndex} style={styles.dataRow}>
														<Text style={styles.rowLabel} numberOfLines={1} ellipsizeMode="tail">
															{field}
														</Text>

														<Text style={styles.rowValue} numberOfLines={1} ellipsizeMode="tail">
															{item[field]}
														</Text>

													</View>
												);
											})}
										</View>

										{/* Only show View More/Less if there are more than 4 fields */}
										{hasMoreFields && (
											<TouchableOpacity onPress={() => toggleAccordion(index)}>
												<View style={styles.viewMoreContainer}>
													<Feather
														name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
														color="black"
														size={23}
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
							}}
						/>

						{modalVisible && (
							<DeleteModal
								modalVisible={modalVisible}
								setModalVisible={setModalVisible}
								handleDelete={handleDelete}
								handleCancel={() => setModalVisible(false)}
								selectedIndices={selectedIndices}
							/>
						)}
					</View>
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
		paddingTop: 20,
	},
	loaderContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#FFF',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 15
	},
	usersText: {
		color: '#848486',
		fontSize: responsiveFontSize(1.8),
		fontFamily:'Poppins-Medium'
	},
	headerTitle: {
		color: '#222327',
		fontSize: responsiveFontSize(2),
		fontFamily:'Poppins-Medium'
	},
	searchContainer: {
		overflow: 'hidden',
		marginHorizontal: 15,
	},
	actionsContainer: {
		flexDirection: 'column',
		gap: 5,
	},
	searchInput: {
		height: 42,
		backgroundColor: '#FFF',
		fontSize: 16,
		fontWeight: '400',
		borderRadius: 10,
		paddingHorizontal: 15,
		borderColor: '#DDD',
		borderWidth: 1,
	},
	svgContainer: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		backgroundColor: '#FFF',
		elevation: 4,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 0.6,
		borderColor: '#EBE7F3',
	},
	addUserContainer: {
		flexDirection: 'row',
		gap: 5,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 10,
		paddingVertical: 8,
		backgroundColor: '#FFF',
		borderColor: '#4D8733',
		borderWidth: 1,
		borderRadius: 10,
	},
	addUserContainerText: {
		fontSize: responsiveFontSize(1.8),
		color: 'black',
		fontFamily:'Poppins-Medium'
	},
	form: {
		backgroundColor: '#FFF',
		borderRadius: 15,
		padding: 15,
		borderColor: '#E9EBF3',
		borderWidth: 1,
		marginVertical: 10,
		marginLeft: 15,
		marginRight: 15,
	},
	cardHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	leftCardHeader: {
		flexDirection: 'row',
		gap: 10,
		width: '65%',
		alignItems: 'center',
	},
	headerText: {
		fontSize: responsiveFontSize(2),
		color: 'black',
		fontWeight: '500',
	},
	rightCardHeader: {
		flexDirection: 'row',
		gap: 10,
		alignItems: 'center',
	},
	headerRightIcon: {
		backgroundColor: '#EEF5ED',
		borderRadius: 15,
		width: 30,
		height: 30,
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerLine: {
		marginTop: 12,
		marginBottom: 5,
		borderBottomWidth: 1,
		borderColor: '#BDC3D4',
	},
	dataRow: {
		flexDirection: 'row',
		paddingVertical: 10,
		paddingHorizontal: 5,
		borderBottomWidth: 1,
		borderBottomColor: '#EEEFF6',
	},
	noBorder: {
		borderBottomWidth: 0,
	},
	rowLabel: {
		flex: 1,
		color: '#222327',
		fontSize: responsiveFontSize(1.7),
		fontFamily: 'Poppins-Regular',
	},
	rowValue: {
		flex: 1,
		color: '#767A8D',
		fontSize: responsiveFontSize(1.7),
		fontFamily: 'Poppins-Regular',
	},
	viewMoreContainer: {
		flexDirection: 'row',
		paddingHorizontal: 20,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 10,
	},
	viewMoreContainerText: {
		color: '#4D8733',
		fontSize: responsiveFontSize(1.7),
		fontFamily:'Poppins-Medium'
	},
});